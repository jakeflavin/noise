import { describe, expect, it } from 'vitest'
import { idleAlert, stepAlert, type AlertState } from './alert'

const GRACE = 3000
const COOLDOWN = 20000
const step = (state: AlertState, over: boolean, now: number) =>
  stepAlert(state, { over, now, graceMs: GRACE, cooldownMs: COOLDOWN })

describe('stepAlert', () => {
  it('says nothing while the room is under the limit', () => {
    expect(step(idleAlert, false, 1000).fire).toBe(false)
  })

  it('waits out the grace period before firing', () => {
    let { state, fire } = step(idleAlert, true, 0)
    expect(fire).toBe(false)
    ;({ state, fire } = step(state, true, GRACE - 1))
    expect(fire).toBe(false)
    expect(state.active).toBe(false)
    ;({ state, fire } = step(state, true, GRACE))
    expect(fire).toBe(true)
    expect(state.active).toBe(true)
  })

  it('fires once, not on every frame of the same noisy stretch', () => {
    let state = step(idleAlert, true, 0).state
    state = step(state, true, GRACE).state
    const again = step(state, true, GRACE + 16)
    expect(again.fire).toBe(false)
    expect(again.state.active).toBe(true)
  })

  it('restarts the grace period after the room settles', () => {
    let state = step(idleAlert, true, 0).state
    state = step(state, false, 1000).state
    expect(state.overSince).toBeNull()
    expect(state.active).toBe(false)
    state = step(state, true, 2000).state
    expect(step(state, true, 2000 + GRACE - 1).fire).toBe(false)
  })

  it('holds the cooldown across a dip under the limit', () => {
    let state = step(idleAlert, true, 0).state
    state = step(state, true, GRACE).state
    state = step(state, false, GRACE + 500).state

    const tooSoon = step(state, true, GRACE + 1000)
    expect(step(tooSoon.state, true, GRACE + 1000 + GRACE).fire).toBe(false)

    const later = step(state, true, COOLDOWN + 10000)
    expect(step(later.state, true, COOLDOWN + 10000 + GRACE).fire).toBe(true)
  })
})
