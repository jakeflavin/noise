import { styled } from 'styled-components'

export const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const Head = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
`

export const Label = styled.span`
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 700;
`

/**
 * The value as a pill in the row's own colour: legible at a glance while dragging, and it
 * keeps its width as the number changes.
 *
 * --accent is set inline by the caller, so a row can take the colour of the zone it edits.
 */
export const Value = styled.span`
  flex: 0 0 auto;
  min-width: 4ch;
  padding: 3px 11px;
  color: var(--accent, var(--zone));
  font-size: 14px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  text-align: center;
  background: color-mix(in srgb, var(--accent, var(--zone)) 14%, transparent);
  border-radius: 999px;
`

export const Hint = styled.p`
  margin: -2px 0 2px;
  color: var(--dim);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
`

/** A row's control and whatever sits beside it — a button, a switch. */
export const Controls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
`
