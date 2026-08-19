import { describe, expect, it } from 'vitest'
import { defaultSettings, migrate } from './useSettings'

describe('migrate', () => {
  it('fills in everything an empty store is missing', () => {
    expect(migrate({})).toEqual(defaultSettings)
  })

  it('keeps what was stored', () => {
    expect(migrate({ presetId: 'groups', sound: false })).toMatchObject({
      presetId: 'groups',
      sound: false,
    })
  })

  it('pulls out-of-range numbers back into range', () => {
    const settings = migrate({ sensitivity: 500, graceSeconds: -4, cooldownSeconds: 9999 })
    expect(settings.sensitivity).toBe(24)
    expect(settings.graceSeconds).toBe(0)
    expect(settings.cooldownSeconds).toBe(300)
  })

  it('repairs custom thresholds that have crossed over', () => {
    const { custom } = migrate({ custom: { calm: 80, working: 20, loud: 10 } })
    expect(custom.calm).toBeLessThan(custom.working)
    expect(custom.working).toBeLessThan(custom.loud)
  })
})
