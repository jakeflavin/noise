import { describe, expect, it } from 'vitest'
import {
  builtInPresets,
  customPresetId,
  defaultPresetId,
  resolvePreset,
  sanitizeThresholds,
  zoneFor,
} from './presets'

describe('sanitizeThresholds', () => {
  it('leaves a sensible set alone', () => {
    expect(sanitizeThresholds({ calm: 10, working: 30, loud: 50 })).toEqual({
      calm: 10,
      working: 30,
      loud: 50,
    })
  })

  it('pushes a neighbour out of the way rather than letting the pair cross', () => {
    const { calm, working, loud } = sanitizeThresholds({ calm: 70, working: 30, loud: 20 })
    expect(working).toBeGreaterThan(calm)
    expect(loud).toBeGreaterThan(working)
  })

  it('keeps every threshold inside the dial', () => {
    const { calm, loud } = sanitizeThresholds({ calm: -20, working: 200, loud: 400 })
    expect(calm).toBeGreaterThanOrEqual(0)
    expect(loud).toBeLessThanOrEqual(100)
  })

  it('falls back to the custom defaults when nothing is stored', () => {
    const fallback = builtInPresets.find((p) => p.id === customPresetId)!.thresholds
    expect(sanitizeThresholds(undefined)).toEqual(fallback)
  })
})

describe('resolvePreset', () => {
  it('finds a built-in by id', () => {
    expect(resolvePreset('silent', { calm: 1, working: 2, loud: 3 }).name).toBe('Silent')
  })

  it('gives the custom preset the user’s own thresholds', () => {
    const mine = { calm: 12, working: 34, loud: 56 }
    expect(resolvePreset(customPresetId, mine).thresholds).toEqual(mine)
  })

  it('falls back to the default when the id is unknown', () => {
    const fallback = resolvePreset('made-up', { calm: 1, working: 5, loud: 9 })
    expect(fallback.id).toBe(defaultPresetId)
  })
})

describe('zoneFor', () => {
  const thresholds = { calm: 20, working: 40, loud: 60 }

  it('names each band', () => {
    expect(zoneFor(5, thresholds).id).toBe('calm')
    expect(zoneFor(25, thresholds).id).toBe('working')
    expect(zoneFor(45, thresholds).id).toBe('loud')
    expect(zoneFor(95, thresholds).id).toBe('over')
  })

  it('treats a threshold as the first reading of the band above it', () => {
    expect(zoneFor(20, thresholds).id).toBe('working')
    expect(zoneFor(60, thresholds).id).toBe('over')
  })
})
