import { sanitizeThresholds, defaultPresetId, type Thresholds } from '../lib/presets'
import { usePersistentState } from './usePersistentState'

export type Settings = {
  presetId: string
  /** The custom preset's thresholds, kept whether or not it is the one selected. */
  custom: Thresholds
  /** Trim in decibels, so one classroom's quiet can be told from another's. */
  sensitivity: number
  /** Play a chime with the alert, as well as showing it. */
  sound: boolean
  /** How long the room has to stay over its limit before the alert counts it. */
  graceSeconds: number
  /** How long the alert stays quiet afterwards, however loud the room stays. */
  cooldownSeconds: number
}

const STORAGE_KEY = 'hush.settings'

export const defaultSettings: Settings = {
  presetId: defaultPresetId,
  custom: sanitizeThresholds(undefined),
  sensitivity: 0,
  sound: true,
  graceSeconds: 3,
  cooldownSeconds: 20,
}

/** Fills in anything the stored settings are missing, and repairs what is out of range. */
export function migrate(stored: Partial<Settings>): Settings {
  return {
    ...defaultSettings,
    ...stored,
    custom: sanitizeThresholds(stored.custom),
    sensitivity: clamp(stored.sensitivity, defaultSettings.sensitivity, -24, 24),
    graceSeconds: clamp(stored.graceSeconds, defaultSettings.graceSeconds, 0, 30),
    cooldownSeconds: clamp(stored.cooldownSeconds, defaultSettings.cooldownSeconds, 5, 300),
  }
}

function clamp(value: number | undefined, or: number, min: number, max: number) {
  return Number.isFinite(value) ? Math.max(min, Math.min(max, value as number)) : or
}

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? migrate(JSON.parse(raw)) : defaultSettings
  } catch {
    return defaultSettings
  }
}

function save(settings: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // A full or blocked store should not stop the meter running.
  }
}

export function useSettings() {
  return usePersistentState(load, save)
}
