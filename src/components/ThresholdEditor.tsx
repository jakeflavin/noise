import { sanitizeThresholds, zones, type Thresholds } from '@/lib/presets'
import { Swatch } from './buttons.styled'
import { Note } from './SettingsDialog.styled'
import { Setting } from './Setting'
import { Slider } from './Slider'

type ThresholdEditorProps = {
  thresholds: Thresholds
  /** Built-in presets show their limits but do not let them be dragged. */
  editable: boolean
  onChange: (next: Thresholds) => void
}

const ROWS = [
  { key: 'calm', label: 'Calm up to', zone: zones.calm },
  { key: 'working', label: 'Working up to', zone: zones.working },
  { key: 'loud', label: 'Getting loud up to', zone: zones.loud },
] as const

/**
 * The three points where the dial changes its mind. Each slider is free to be dragged
 * anywhere; ordering is restored on the way out rather than by pinning the handles,
 * which made the middle one feel stuck between its neighbours.
 */
export function ThresholdEditor({ thresholds, editable, onChange }: ThresholdEditorProps) {
  return (
    <>
      {ROWS.map((row) => (
        <Setting
          key={row.key}
          accent={row.zone.color}
          value={thresholds[row.key]}
          label={
            <>
              <Swatch style={{ background: row.zone.color }} aria-hidden="true" />
              {row.label}
            </>
          }
        >
          <Slider
            min={0}
            max={100}
            value={thresholds[row.key]}
            disabled={!editable}
            accent={row.zone.color}
            ariaLabel={row.label}
            onChange={(value) => onChange(sanitizeThresholds({ ...thresholds, [row.key]: value }))}
          />
        </Setting>
      ))}
      <Note style={{ '--accent': zones.over.color } as React.CSSProperties}>
        <Swatch style={{ background: zones.over.color }} aria-hidden="true" />
        Anything above {thresholds.loud} is over the limit, and starts the alert’s clock.
      </Note>
    </>
  )
}
