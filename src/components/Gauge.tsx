import { useRef } from 'react'
import { CENTER, arcPath, pointAt } from '@/lib/geometry'
import { zones, type Thresholds, type Zone } from '@/lib/presets'
import { Dial, Fill, Reading, Zone as ZoneLabel } from './Gauge.styled'

const RADIUS = 150
const TRACK_WIDTH = 34

/** How fast the peak marker slides back down, in level per second. */
const PEAK_DECAY = 14

export type GaugeProps = {
  level: number
  thresholds: Thresholds
  zone: Zone
  listening: boolean
  alerting: boolean
  /** The colour the zone's name is set in, which depends on the theme's ground. */
  zoneInk: string
}

/**
 * The dial: one thick arc, banded into the four zones this activity works in, filled
 * to the room's current level.
 *
 * The fill is a single stroked path dashed to the reading — `pathLength` rescales it
 * so the dash *is* the number, and one attribute changes per frame rather than the
 * whole dial being redrawn.
 */
export function Gauge({ level, thresholds, zone, listening, alerting, zoneInk }: GaugeProps) {
  const peak = usePeak(level, listening)

  // Bands butt against each other and are separated by the notches drawn over them,
  // so only the two ends of the dial are rounded. A band with nothing in it is left
  // out rather than being drawn backwards, the long way round.
  const bands = [
    { zone: zones.calm, from: 0, to: thresholds.calm / 100 },
    { zone: zones.working, from: thresholds.calm / 100, to: thresholds.working / 100 },
    { zone: zones.loud, from: thresholds.working / 100, to: thresholds.loud / 100 },
    { zone: zones.over, from: thresholds.loud / 100, to: 1 },
  ].filter((band) => band.to > band.from)

  return (
    <Dial
      viewBox="14 14 372 316"
      role="img"
      aria-label={
        listening
          ? `${zone.name}. Noise level ${Math.round(level)} out of 100.`
          : 'Paused. The microphone is off and nothing is being measured.'
      }
      data-alerting={alerting || undefined}
    >
      {/* The bands: where this activity draws its lines, in the zones' own colours,
          pale enough that the fill drawn over them still reads as the reading. */}
      {bands.map((band, i) => (
        <path
          key={band.zone.id}
          d={arcPath(band.from, band.to, RADIUS)}
          stroke={band.zone.color}
          strokeWidth={TRACK_WIDTH}
          strokeLinecap={i === 0 || i === bands.length - 1 ? 'round' : 'butt'}
          strokeOpacity="0.22"
          fill="none"
        />
      ))}

      {/* A rounded cap on a zero-length dash would still draw a dot at the start of
          the dial, so a paused meter leaves the fill out rather than shortening it. */}
      {listening && (
        <Fill
          d={arcPath(0, 1, RADIUS)}
          pathLength={100}
          stroke={zone.color}
          strokeWidth={TRACK_WIDTH}
          strokeLinecap="round"
          strokeDasharray={`${Math.max(level, 0.4)} 100`}
          fill="none"
        />
      )}

      {/* The limits, cut through the track as white slots. Once the fill covers a
          band its colour is gone, and without these the dial would stop saying where
          this activity's lines are drawn. */}
      {[thresholds.calm, thresholds.working, thresholds.loud].map((limit) => {
        const inner = pointAt(limit / 100, RADIUS - TRACK_WIDTH / 2)
        const outer = pointAt(limit / 100, RADIUS + TRACK_WIDTH / 2)
        return (
          <line
            key={limit}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke="var(--surface)"
            strokeWidth="5"
          />
        )
      })}

      {/* The loudest moment of the last few seconds, marked outside the dial: a class
          settling down can see the mark it is coming back down from. */}
      {listening && peak > 1 && (
        <line
          x1={pointAt(peak / 100, RADIUS + TRACK_WIDTH / 2 + 8).x}
          y1={pointAt(peak / 100, RADIUS + TRACK_WIDTH / 2 + 8).y}
          x2={pointAt(peak / 100, RADIUS + TRACK_WIDTH / 2 + 20).x}
          y2={pointAt(peak / 100, RADIUS + TRACK_WIDTH / 2 + 20).y}
          stroke={zone.color}
          strokeWidth="6"
          strokeLinecap="round"
        />
      )}

      <Reading x={CENTER.x} y={CENTER.y + 20} textAnchor="middle">
        {Math.round(level)}
      </Reading>
      {/* A stopped meter takes the paper's own grey rather than the calm green: zero on a
          green dial is exactly the picture a genuinely silent room makes, and the colour
          is the part that carries to the back of the room. */}
      <ZoneLabel
        x={CENTER.x}
        y={CENTER.y + 70}
        textAnchor="middle"
        fill={listening ? zoneInk : 'var(--dim)'}
      >
        {listening ? zone.name : 'Paused'}
      </ZoneLabel>
    </Dial>
  )
}

/**
 * The high-water mark, which follows the level up immediately and slides back down.
 * Held in a ref rather than state: it is recomputed on the render the level already
 * causes, and asking for one of its own would double the work every frame.
 */
function usePeak(level: number, listening: boolean) {
  const peak = useRef(0)
  const at = useRef(performance.now())

  const now = performance.now()
  const dt = Math.min((now - at.current) / 1000, 0.25)
  at.current = now

  if (!listening) peak.current = 0
  else peak.current = Math.max(level, peak.current - PEAK_DECAY * dt)

  return peak.current
}
