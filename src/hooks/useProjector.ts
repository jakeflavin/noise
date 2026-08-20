import { useCallback, useEffect, useRef, useState } from 'react'

type WakeLock = { release: () => Promise<void>; released: boolean }
type WakeLockNavigator = Navigator & {
  wakeLock?: { request: (type: 'screen') => Promise<WakeLock> }
}

/** How long the chrome stays up after the last thing the teacher did. */
const IDLE_MS = 2600

/**
 * Projector mode: the gauge on the board at the front, the chrome out of the way.
 *
 * Fullscreen state is read from the document rather than remembered, because Escape
 * leaves fullscreen without going anywhere near this app's buttons.
 *
 * Getting the chrome out of the way is a question about the *teacher*, not the pointer,
 * so it is answered by idleness rather than by hover. Hover was the obvious rule and the
 * wrong one: the thing being hovered is the app shell, which fills the viewport, so a
 * cursor parked anywhere on a laptop driving a projector kept the chrome up for the whole
 * lesson. Idleness also gives touch the same behaviour for free — a tap brings the
 * controls back — where hover had to exempt it entirely.
 */
export function useProjector() {
  const [on, setOn] = useState(false)
  const [chrome, setChrome] = useState(true)
  const idle = useRef<number | null>(null)

  useEffect(() => {
    const sync = () => setOn(document.fullscreenElement !== null)
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [])

  useEffect(() => {
    if (!on) {
      setChrome(true)
      return
    }

    const clear = () => {
      if (idle.current !== null) window.clearTimeout(idle.current)
      idle.current = null
    }

    const wake = () => {
      setChrome(true)
      clear()
      // A drawer open on top of the dial is the teacher still working, so the clock
      // does not run until it is closed.
      if (document.querySelector('dialog[open]')) return
      idle.current = window.setTimeout(() => setChrome(false), IDLE_MS)
    }

    wake()
    for (const event of ['pointermove', 'pointerdown', 'keydown', 'wheel'] as const) {
      window.addEventListener(event, wake, { passive: true })
    }
    return () => {
      clear()
      for (const event of ['pointermove', 'pointerdown', 'keydown', 'wheel'] as const) {
        window.removeEventListener(event, wake)
      }
    }
  }, [on])

  const toggle = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {})
      return
    }

    // Fullscreen is refused outside a gesture, and iOS Safari on a phone has no such
    // API at all. The mode is worth having as a layout either way, so a refusal turns
    // it on without the fullscreen rather than being treated as a failure.
    const request = document.documentElement.requestFullscreen?.bind(document.documentElement)
    if (!request) setOn(true)
    else void request().catch(() => setOn(true))
  }, [])

  return { on, toggle, chrome: !on || chrome }
}

/**
 * Holds the screen awake while the meter runs, so a display left up through a lesson
 * does not dim halfway through it. Unsupported browsers simply do not get the lock,
 * and a lock is dropped whenever the tab is hidden, so it is retaken on return.
 */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    const request = (navigator as WakeLockNavigator).wakeLock
    if (!request) return

    let lock: WakeLock | null = null
    let cancelled = false

    const take = async () => {
      try {
        const next = await request.request('screen')
        if (cancelled) void next.release()
        else lock = next
      } catch {
        // Denied or unsupported: the screen dims as it normally would.
      }
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible' && !lock?.released) void take()
    }

    void take()
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      void lock?.release().catch(() => {})
    }
  }, [active])
}
