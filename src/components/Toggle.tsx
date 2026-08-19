import { Track, Wrapper } from './Toggle.styled'

type ToggleProps = {
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
}

/**
 * A switch, built on a real checkbox so it keeps the keyboard and screen-reader
 * behaviour a checkbox already has; only its appearance is the app's.
 */
export function Toggle({ checked, label, onChange }: ToggleProps) {
  return (
    <Wrapper>
      <input
        type="checkbox"
        checked={checked}
        aria-label={label}
        onChange={(e) => onChange(e.target.checked)}
      />
      <Track aria-hidden="true" />
    </Wrapper>
  )
}
