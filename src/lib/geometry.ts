/**
 * The dial's geometry. The arc opens at the bottom: it starts at the lower left, goes
 * up over the top and comes down to the lower right, leaving a gap for the readout.
 */
export const START_ANGLE = 135
export const SWEEP = 270

export const CENTER = { x: 200, y: 200 }

/** The angle, in SVG degrees, of a 0–1 position along the arc. */
export const angleAt = (t: number) => START_ANGLE + t * SWEEP

export function pointAt(t: number, radius: number, center = CENTER) {
  const radians = (angleAt(t) * Math.PI) / 180
  return {
    x: center.x + Math.cos(radians) * radius,
    y: center.y + Math.sin(radians) * radius,
  }
}

/** An `A` arc between two positions along the dial, for a stroked band. */
export function arcPath(from: number, to: number, radius: number, center = CENTER) {
  const start = pointAt(from, radius, center)
  const end = pointAt(to, radius, center)
  const large = (to - from) * SWEEP > 180 ? 1 : 0
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 ${large} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`
}
