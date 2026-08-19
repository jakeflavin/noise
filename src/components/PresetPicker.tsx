import { builtInPresets } from '../lib/presets'

type Props = {
  presetId: string
  onChange: (id: string) => void
}

/**
 * The activity, as a row of tabs. It is the control a teacher actually reaches for
 * mid-lesson, so it sits on the front screen rather than behind the settings drawer —
 * "we are moving to group work" should be one tap, not four.
 */
export function PresetPicker({ presetId, onChange }: Props) {
  return (
    <div className="presets" role="radiogroup" aria-label="Activity">
      {builtInPresets.map((preset) => (
        <button
          key={preset.id}
          className="preset"
          role="radio"
          aria-checked={preset.id === presetId}
          onClick={() => onChange(preset.id)}
          title={preset.hint}
          style={{ '--chip': preset.color } as React.CSSProperties}
        >
          {preset.name}
        </button>
      ))}
    </div>
  )
}
