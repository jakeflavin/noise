import { describe, expect, it } from 'vitest'
import { CENTER, angleAt, arcPath, pointAt } from './geometry'

describe('angleAt', () => {
  it('opens at the lower left and closes at the lower right', () => {
    expect(angleAt(0)).toBe(135)
    expect(angleAt(1)).toBe(405)
  })

  it('puts the middle of the dial straight up', () => {
    const top = pointAt(0.5, 100)
    expect(top.x).toBeCloseTo(CENTER.x)
    expect(top.y).toBeCloseTo(CENTER.y - 100)
  })
})

describe('arcPath', () => {
  it('flags the long way round only past a half turn', () => {
    expect(arcPath(0, 0.5, 100)).toContain(' 0 1 ')
    expect(arcPath(0, 1, 100)).toContain(' 1 1 ')
  })
})
