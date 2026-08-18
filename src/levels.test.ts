import { describe, expect, it } from 'vitest'
import {
  clampLevel,
  dbForLevel,
  dbOf,
  levelFromDb,
  rmsOf,
  sensitivityFor,
  smoothLevel,
} from './levels'

describe('rmsOf', () => {
  it('reads a flat, centred buffer as silence', () => {
    expect(rmsOf(new Uint8Array(64).fill(128))).toBe(0)
  })

  it('reads a full-scale square wave as one', () => {
    const samples = Uint8Array.from({ length: 64 }, (_, i) => (i % 2 ? 0 : 255))
    expect(rmsOf(samples)).toBeCloseTo(1, 1)
  })
})

describe('dbOf', () => {
  it('reports silence as the floor rather than negative infinity', () => {
    expect(Number.isFinite(dbOf(0))).toBe(true)
    expect(levelFromDb(dbOf(0))).toBe(0)
  })

  it('reports full scale as zero decibels', () => {
    expect(dbOf(1)).toBeCloseTo(0)
  })
})

describe('levelFromDb', () => {
  it('stays inside the gauge at both extremes', () => {
    expect(levelFromDb(-200)).toBe(0)
    expect(levelFromDb(0)).toBe(100)
  })

  it('round-trips through dbForLevel', () => {
    expect(levelFromDb(dbForLevel(42))).toBeCloseTo(42)
  })

  it('lifts a reading by the sensitivity trim', () => {
    expect(levelFromDb(-40, 6)).toBeGreaterThan(levelFromDb(-40))
  })
})

describe('sensitivityFor', () => {
  it('finds the trim that puts the current room at the target', () => {
    const raw = -50
    const trim = sensitivityFor(raw, 10)
    // The trim is a whole number of decibels, so it lands near the target, not on it.
    expect(Math.abs(levelFromDb(raw, trim) - 10)).toBeLessThan(1)
  })
})

describe('smoothLevel', () => {
  it('rises faster than it falls', () => {
    const up = smoothLevel(0, 100, 0.05)
    const down = 100 - smoothLevel(100, 0, 0.05)
    expect(up).toBeGreaterThan(down)
  })

  it('converges on the target and never overshoots it', () => {
    let level = 0
    for (let i = 0; i < 200; i++) level = smoothLevel(level, 80, 0.016)
    expect(level).toBeCloseTo(80, 1)
    expect(level).toBeLessThanOrEqual(80)
  })
})

describe('clampLevel', () => {
  it('holds the 0–100 range', () => {
    expect(clampLevel(-5)).toBe(0)
    expect(clampLevel(140)).toBe(100)
  })
})
