type SliderProps = {
  value: number
  min: number
  max: number
  step?: number
  disabled?: boolean
  /** The colour of the filled part and the handle; defaults to the room's zone. */
  accent?: string
  /** Named for a screen reader, since the row's label is not tied to the input. */
  ariaLabel?: string
  onChange: (value: number) => void
}

/**
 * A range input the app draws itself.
 *
 * `accent-color` alone leaves the empty half of the track to the browser, which paints
 * it near-black next to this design's paper. The fill is a background gradient cut at
 * the value, which is the one way to colour both halves in every engine.
 */
export function Slider({
  value,
  min,
  max,
  step = 1,
  disabled,
  accent,
  ariaLabel,
  onChange,
}: SliderProps) {
  const filled = ((value - min) / (max - min)) * 100

  return (
    <input
      className="slider"
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.valueAsNumber)}
      style={
        {
          '--fill': `${filled}%`,
          ...(accent ? { '--accent': accent } : {}),
        } as React.CSSProperties
      }
    />
  )
}
