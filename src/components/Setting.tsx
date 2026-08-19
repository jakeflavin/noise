import type { ReactNode } from 'react'

type SettingProps = {
  label: ReactNode
  /** What the setting does, in a sentence, under its name. */
  hint?: ReactNode
  /** The current value, shown as a pill beside the label rather than after the control. */
  value?: ReactNode
  /** The pill's colour; the room's own zone colour when nothing else is given. */
  accent?: string
  children: ReactNode
}

/**
 * One row of the settings drawer: name and value on a line, the reason underneath, the
 * control below that.
 *
 * The value sits next to the label rather than at the end of the slider, because that
 * is where it is read — a number tucked under the right-hand end of a track is a long
 * way from the word that says what it means.
 */
export function Setting({ label, hint, value, accent, children }: SettingProps) {
  return (
    <div className="setting">
      <div className="setting-head">
        <span className="setting-label">{label}</span>
        {value !== undefined && (
          <span
            className="setting-value"
            style={accent ? ({ '--accent': accent } as React.CSSProperties) : undefined}
          >
            {value}
          </span>
        )}
      </div>
      {hint && <p className="setting-hint">{hint}</p>}
      {children}
    </div>
  )
}
