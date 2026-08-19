/**
 * When the room going over its limit should actually be *said* about.
 *
 * A meter that shouts at the first laugh gets muted by lunchtime, so an alert has to
 * survive a grace period first, and having fired it will not fire again until the
 * cooldown has passed. Kept as a step function over explicit state so the timing can
 * be tested without waiting for it.
 */

export type AlertState = {
  /** When the room first went over, or null while it is under the limit. */
  overSince: number | null
  /** When the last alert sounded, so a noisy stretch does not fire on every frame. */
  lastFiredAt: number | null
  /** Whether the room is currently in an alerting state, which the gauge shows. */
  active: boolean
}

export const idleAlert: AlertState = { overSince: null, lastFiredAt: null, active: false }

export type AlertStep = {
  /** Whether the level is above the preset's limit right now. */
  over: boolean
  now: number
  graceMs: number
  cooldownMs: number
}

/** The next state, and whether this is the moment to sound the alert. */
export function stepAlert(state: AlertState, step: AlertStep): { state: AlertState; fire: boolean } {
  const { over, now, graceMs, cooldownMs } = step

  // Dropping back under the limit clears the run, but not the cooldown: the point of
  // the cooldown is to space alerts out across dips, not only within one long one.
  if (!over) {
    return { state: { ...state, overSince: null, active: false }, fire: false }
  }

  const overSince = state.overSince ?? now
  const survived = now - overSince >= graceMs
  const cooled = state.lastFiredAt === null || now - state.lastFiredAt >= cooldownMs

  if (survived && cooled) {
    return { state: { overSince, lastFiredAt: now, active: true }, fire: true }
  }

  return { state: { ...state, overSince, active: survived }, fire: false }
}
