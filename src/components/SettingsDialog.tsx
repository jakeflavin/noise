import { Play, SlidersHorizontal, X } from 'lucide-react'
import { customPresetId, resolvePreset } from '@/lib/presets'
import { levelFromDb, sensitivityFor } from '@/lib/levels'
import { playChime } from '@/lib/chime'
import { shortcuts } from '@/lib/shortcuts'
import { useDialog } from '@/hooks/useDialog'
import type { Settings } from '@/hooks/useSettings'
import { Setting } from './Setting'
import { Controls } from './Setting.styled'
import { IconButton, OutlineButton } from './buttons.styled'
import {
  Drawer,
  Head,
  Keys,
  Note,
  Section,
  Segment,
  Segmented,
  ShortcutList,
} from './SettingsDialog.styled'
import { Slider } from './Slider'
import { ThresholdEditor } from './ThresholdEditor'
import { Toggle } from './Toggle'

type SettingsDialogProps = {
  open: boolean
  onClose: () => void
  settings: Settings
  onChange: (next: Settings) => void
  listening: boolean
  /** The room's raw reading, read at the moment calibration is asked for. */
  rawDbRef: React.RefObject<number>
}

/** What a calibrated room should read while it is quiet. */
const CALIBRATION_TARGET = 8

const themes = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
] as const

export function SettingsDialog({
  open,
  onClose,
  settings,
  onChange,
  listening,
  rawDbRef,
}: SettingsDialogProps) {
  const { ref, onBackdropClick } = useDialog(open, onClose)
  const preset = resolvePreset(settings.presetId, settings.custom)
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    onChange({ ...settings, [key]: value })

  return (
    <Drawer ref={ref} onClose={onClose} onClick={onBackdropClick}>
      {/* The head stays put while the drawer scrolls, so the way out is always to hand. */}
      <Head>
        <h2>Settings</h2>
        <IconButton $quiet onClick={onClose} aria-label="Close settings">
          <X size={20} />
        </IconButton>
      </Head>

      <Section>
        <h3>{preset.name} limits</h3>
        <ThresholdEditor
          thresholds={preset.thresholds}
          editable={preset.id === customPresetId}
          onChange={(custom) => onChange({ ...settings, custom })}
        />
        {preset.id !== customPresetId && (
          <OutlineButton
            onClick={() =>
              onChange({ ...settings, presetId: customPresetId, custom: preset.thresholds })
            }
          >
            <SlidersHorizontal size={17} />
            Copy into Custom to edit
          </OutlineButton>
        )}
      </Section>

      <Section>
        <h3>Microphone</h3>
        <Setting
          label="Sensitivity"
          hint="Raise it in a big room, lower it if the meter never settles."
          value={`${settings.sensitivity > 0 ? '+' : ''}${settings.sensitivity} dB`}
        >
          <Slider
            min={-24}
            max={24}
            value={settings.sensitivity}
            ariaLabel="Sensitivity"
            onChange={(value) => set('sensitivity', value)}
          />
        </Setting>
        <OutlineButton
          disabled={!listening}
          onClick={() => set('sensitivity', sensitivityFor(rawDbRef.current, CALIBRATION_TARGET))}
        >
          {listening ? 'Calibrate to the room right now' : 'Start listening to calibrate'}
        </OutlineButton>
        <Note>
          {listening
            ? `The room is reading ${Math.round(levelFromDb(rawDbRef.current, settings.sensitivity))}.
               Calibrate while it is quiet, and quiet becomes about ${CALIBRATION_TARGET}.`
            : `Calibrating while the room is quiet makes quiet read about ${CALIBRATION_TARGET}
               here, whatever the microphone and the room are like.`}
        </Note>
      </Section>

      <Section>
        <h3>Alert</h3>
        <Setting
          label="Patience"
          hint="How long the room can be over the limit before the alert counts it."
          value={`${settings.graceSeconds}s`}
        >
          <Slider
            min={0}
            max={30}
            value={settings.graceSeconds}
            ariaLabel="Patience"
            onChange={(value) => set('graceSeconds', value)}
          />
        </Setting>
        <Setting
          label="Quiet after"
          hint="How long the alert waits before it is willing to speak up again."
          value={formatSeconds(settings.cooldownSeconds)}
        >
          <Slider
            min={5}
            max={300}
            step={5}
            value={settings.cooldownSeconds}
            ariaLabel="Quiet after"
            onChange={(value) => set('cooldownSeconds', value)}
          />
        </Setting>
        <Setting label="Chime" hint="The alert always shows on screen; this gives it a sound too.">
          <Controls>
            <OutlineButton $small onClick={() => playChime()}>
              <Play size={15} />
              Hear it
            </OutlineButton>
            <Toggle
              checked={settings.sound}
              label="Play a chime with the alert"
              onChange={(checked) => set('sound', checked)}
            />
          </Controls>
        </Setting>
      </Section>

      <Section>
        <h3>Appearance</h3>
        <Setting
          label="Theme"
          hint="System follows the device, and keeps following it if it changes."
        >
          <Segmented role="radiogroup" aria-label="Theme">
            {themes.map(({ value, label }) => (
              <Segment
                key={value}
                role="radio"
                aria-checked={settings.theme === value}
                onClick={() => set('theme', value)}
              >
                {label}
              </Segment>
            ))}
          </Segmented>
        </Setting>
      </Section>

      <Section>
        <h3>Shortcuts</h3>
        <ShortcutList>
          {shortcuts.map((shortcut) => (
            <li key={shortcut.label}>
              <span>{shortcut.label}</span>
              <Keys>
                {shortcut.keys.map((key) => (
                  <kbd key={key}>{key}</kbd>
                ))}
              </Keys>
            </li>
          ))}
        </ShortcutList>
      </Section>

      <Note>
        Nothing is recorded or sent anywhere. The audio is measured in this browser and thrown away
        frame by frame.
      </Note>
    </Drawer>
  )
}

/** Past a minute, seconds stop being a length anyone can picture. */
function formatSeconds(seconds: number) {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return rest ? `${minutes}m ${rest}s` : `${minutes}m`
}
