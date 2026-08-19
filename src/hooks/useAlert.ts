import { useEffect, useRef, useState } from 'react'
import { idleAlert, stepAlert } from '@/lib/alert'
import { playChime } from '@/lib/chime'

type Options = {
  /** Whether the room is over its limit right now. */
  over: boolean
  listening: boolean
  graceSeconds: number
  cooldownSeconds: number
  sound: boolean
}

/** How often the grace period is checked while the room is over its limit. */
const TICK_MS = 250

/**
 * Runs the alert's clock against the live reading.
 *
 * Whether the room is over its limit is the only part of the reading that matters
 * here, so the machine is stepped on its own slow interval rather than on the meter's
 * frames — the grace period has to keep running while nothing about the room changes.
 */
export function useAlert({ over, listening, graceSeconds, cooldownSeconds, sound }: Options) {
  const state = useRef(idleAlert)
  const [alerting, setAlerting] = useState(false)
  const soundRef = useRef(sound)
  soundRef.current = sound

  useEffect(() => {
    if (!listening || !over) {
      // The run ends, but the cooldown the machine is holding does not.
      state.current = stepAlert(state.current, {
        over: false,
        now: Date.now(),
        graceMs: 0,
        cooldownMs: 0,
      }).state
      setAlerting(false)
      if (!listening) state.current = idleAlert
      return
    }

    const tick = () => {
      const next = stepAlert(state.current, {
        over: true,
        now: Date.now(),
        graceMs: graceSeconds * 1000,
        cooldownMs: cooldownSeconds * 1000,
      })
      state.current = next.state
      setAlerting(next.state.active)
      if (next.fire && soundRef.current) playChime()
    }

    tick()
    const id = setInterval(tick, TICK_MS)
    return () => clearInterval(id)
  }, [over, listening, graceSeconds, cooldownSeconds])

  return alerting
}
