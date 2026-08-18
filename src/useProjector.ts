import { useCallback, useEffect, useState } from 'react'

type WakeLock = { release: () => Promise<void>; released: boolean }
type WakeLockNavigator = Navigator & {
  wakeLock?: { request: (type: 'screen') => Promise<WakeLock> }
}

/**
 * Projector mode: the gauge on the board at the front, the chrome out of the way.
 *
 * Fullscreen state is read from the document rather than remembered, because Escape
 * leaves fullscreen without going anywhere near this app's buttons.
 */
export function useProjector() {
  const [on, setOn] = useState(false)

  useEffect(() => {
    const sync = () => setOn(document.fullscreenElement !== null)
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [])

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

  return { on, toggle }
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
