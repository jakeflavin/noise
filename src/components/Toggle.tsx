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
    <label className="toggle">
      <input
        type="checkbox"
        checked={checked}
        aria-label={label}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="toggle-track" aria-hidden="true" />
    </label>
  )
}
