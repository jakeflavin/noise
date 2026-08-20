/**
 * What counts as "too loud" is not a property of the room, it is a property of what
 * the class is doing: silent reading and group work want very different dials. A
 * preset is that judgement, written down as the three points where the gauge changes
 * its mind, and switching activity is meant to be one tap on the front screen.
 */

export type Thresholds = {
  /** Above this the room has stopped being silent. */
  calm: number
  /** Above this the working hum has become loud. */
  working: number
  /** Above this the class is over its limit, and the alert can start counting. */
  loud: number
}

export type Preset = {
  id: string
  name: string
  /** What the activity looks like, shown under the name when picking. */
  hint: string
  /** The colour of its chip, so the row of activities is told apart by colour. */
  color: string
  /** The chip's colour where it has to carry a label — see {@link Ink}. */
  ink: Ink
  thresholds: Thresholds
}

/**
 * Every colour in the app has two jobs, and one value cannot do both.
 *
 * `color` is the dial: flat and saturated, because a band has to carry across a room.
 * Those same values are far too light to set type in or on — white on the yellow is
 * 1.64:1 — so anything that touches a letter uses `ink` instead: the same hue taken
 * dark enough on paper, and left bright on the dark ground, that it clears 4.5:1 both
 * as text and as a fill with `--on-zone` over it.
 */
export type Ink = { light: string; dark: string }

export type Zone = {
  id: 'calm' | 'working' | 'loud' | 'over'
  name: string
  /** Flat and saturated: the dial has to carry across a room, not look subtle. */
  color: string
  /** The same hue, safe to set type in or under. */
  ink: Ink
}

/** Green through to red, which is the order a class already reads without being told. */
export const zones: Record<Zone['id'], Zone> = {
  calm: {
    id: 'calm',
    name: 'Calm',
    color: '#2FBF71',
    ink: { light: '#1E7B49', dark: '#2FBF71' },
  },
  working: {
    id: 'working',
    name: 'Working',
    color: '#FFC02E',
    ink: { light: '#8A6819', dark: '#FFC02E' },
  },
  loud: {
    id: 'loud',
    name: 'Getting loud',
    color: '#FF8A2B',
    ink: { light: '#A4591C', dark: '#FF8A2B' },
  },
  over: {
    id: 'over',
    name: 'Too loud',
    color: '#EF4136',
    ink: { light: '#C2352C', dark: '#F15B51' },
  },
}

export const builtInPresets: Preset[] = [
  {
    id: 'silent',
    name: 'Silent',
    hint: 'Tests and independent reading',
    color: '#5B8DEF',
    ink: { light: '#4469B2', dark: '#5B8DEF' },
    thresholds: { calm: 8, working: 16, loud: 26 },
  },
  {
    id: 'independent',
    name: 'Independent',
    hint: 'Heads-down work, quiet questions',
    color: '#2FBF71',
    ink: { light: '#1E7B49', dark: '#2FBF71' },
    thresholds: { calm: 16, working: 28, loud: 42 },
  },
  {
    id: 'partners',
    name: 'Partners',
    hint: 'Talking in twos and threes',
    color: '#FFC02E',
    ink: { light: '#8A6819', dark: '#FFC02E' },
    thresholds: { calm: 26, working: 44, loud: 60 },
  },
  {
    id: 'groups',
    name: 'Groups',
    hint: 'Tables working out loud',
    color: '#FF8A2B',
    ink: { light: '#A4591C', dark: '#FF8A2B' },
    thresholds: { calm: 36, working: 58, loud: 74 },
  },
  {
    id: 'custom',
    name: 'Custom',
    hint: 'Your own limits',
    color: '#A167E6',
    ink: { light: '#8253BA', dark: '#A974E8' },
    thresholds: { calm: 20, working: 40, loud: 60 },
  },
]

export const customPresetId = 'custom'
export const defaultPresetId = 'independent'

/** The smallest band the editor will leave between two thresholds. */
const MIN_GAP = 4

/**
 * Puts three thresholds back in order. The sliders are independent, so dragging one
 * past its neighbour is expected rather than exceptional: the neighbour gives way and
 * keeps its minimum band instead of the pair crossing over.
 */
export function sanitizeThresholds(thresholds: Partial<Thresholds> | undefined): Thresholds {
  const fallback = builtInPresets.find((p) => p.id === customPresetId)!.thresholds
  const round = (value: number | undefined, or: number) =>
    Number.isFinite(value) ? Math.round(Math.max(0, Math.min(100, value as number))) : or

  const calm = Math.min(round(thresholds?.calm, fallback.calm), 100 - MIN_GAP * 2)
  const working = Math.min(
    Math.max(round(thresholds?.working, fallback.working), calm + MIN_GAP),
    100 - MIN_GAP,
  )
  const loud = Math.max(round(thresholds?.loud, fallback.loud), working + MIN_GAP)

  return { calm, working, loud: Math.min(loud, 100) }
}

/** The chosen preset, with the user's own thresholds standing in for the custom one. */
export function resolvePreset(id: string, custom: Thresholds): Preset {
  const preset =
    builtInPresets.find((p) => p.id === id) ?? builtInPresets.find((p) => p.id === defaultPresetId)!
  return preset.id === customPresetId
    ? { ...preset, thresholds: sanitizeThresholds(custom) }
    : preset
}

export function zoneFor(level: number, thresholds: Thresholds): Zone {
  if (level < thresholds.calm) return zones.calm
  if (level < thresholds.working) return zones.working
  if (level < thresholds.loud) return zones.loud
  return zones.over
}
