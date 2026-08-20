/**
 * Turning what the microphone hears into the 0–100 number the gauge shows.
 *
 * The meter works in decibels rather than raw amplitude: loudness is logarithmic, and
 * a linear reading spends most of its range on the last few voices in the room while
 * everything below a shout sits squashed against zero.
 */

/** Quiet enough to read as silence. A still classroom sits a little above this. */
const FLOOR_DB = -62
/** A shout close to the mic. Anything past it is already off the top of the gauge. */
const CEILING_DB = -8

/** How fast the needle rises, and how much more slowly it falls back, in seconds. */
const ATTACK = 0.05
const RELEASE = 0.4

export const clampLevel = (level: number) => Math.max(0, Math.min(100, level))

/** Root mean square of a byte time-domain buffer, where 128 is the zero crossing. */
export function rmsOf(samples: Uint8Array): number {
  let sum = 0
  for (const sample of samples) {
    const centered = (sample - 128) / 128
    sum += centered * centered
  }
  return Math.sqrt(sum / samples.length)
}

/** Digital silence has no decibel value, so it is reported as the floor instead. */
export function dbOf(rms: number): number {
  return rms > 0 ? Math.max(FLOOR_DB, 20 * Math.log10(rms)) : FLOOR_DB
}

/** Where a reading sits on the gauge, after the room's own sensitivity trim. */
export function levelFromDb(db: number, sensitivity = 0): number {
  const span = CEILING_DB - FLOOR_DB
  return clampLevel(((db + sensitivity - FLOOR_DB) / span) * 100)
}

/** The inverse, used to work out a trim from a reading the room just gave us. */
export function dbForLevel(level: number): number {
  return FLOOR_DB + (clampLevel(level) / 100) * (CEILING_DB - FLOOR_DB)
}

/**
 * The trim that would move the reading now on the dial to `target`, so calibration is a
 * matter of standing in the quiet and saying "this is what quiet looks like here".
 *
 * It works from the level being shown rather than from the raw decibels behind it. The
 * two are a smoothing stage apart, and calibrating against the unsmoothed one meant the
 * drawer could say the room was reading 31 while the dial beside it said 57.
 */
export function trimForLevel(shown: number, trim: number, target: number): number {
  return Math.round(dbForLevel(target) - dbForLevel(shown) + trim)
}

/**
 * A meter's ballistics: quick to answer a voice, slow to let go of one. Time constants
 * rather than per-frame fractions, so the needle behaves the same on a 120Hz screen.
 */
export function smoothLevel(previous: number, next: number, dt: number): number {
  const tau = next > previous ? ATTACK : RELEASE
  const weight = 1 - Math.exp(-Math.max(dt, 0) / tau)
  return previous + (next - previous) * weight
}
