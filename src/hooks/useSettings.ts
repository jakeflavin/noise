import { sanitizeThresholds, defaultPresetId, type Thresholds } from '../lib/presets'
import { usePersistentState } from './usePersistentState'
import type { Theme } from './useAppliedTheme'

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
  /** Light, dark, or whatever the device is set to. */
  theme: Theme
}

const STORAGE_KEY = 'hush.settings'

const themes: Theme[] = ['light', 'dark', 'system']

export const defaultSettings: Settings = {
  presetId: defaultPresetId,
  custom: sanitizeThresholds(undefined),
  sensitivity: 0,
  sound: true,
  graceSeconds: 3,
  cooldownSeconds: 20,
  theme: 'system',
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
    theme: themes.includes(stored.theme as Theme) ? (stored.theme as Theme) : defaultSettings.theme,
  }
}

function clamp(value: number | undefined, or: number, min: number, max: number) {
  return Number.isFinite(value) ? Math.max(min, Math.min(max, value as number)) : or
}

function read(raw: string | null): Settings {
  try {
    return raw ? migrate(JSON.parse(raw)) : defaultSettings
  } catch {
    return defaultSettings
  }
}


export function useSettings() {
  return usePersistentState(STORAGE_KEY, defaultSettings, { read })
}
