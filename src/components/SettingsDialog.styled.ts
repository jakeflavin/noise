import { styled } from 'styled-components'

import { Swatch } from './buttons.styled'

/** A sheet pinned to the right, inset to match the app's own padding. */
export const Drawer = styled.dialog`
  position: fixed;
  inset: max(12px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right))
    max(12px, env(safe-area-inset-bottom)) auto;
  margin: 0;
  width: min(430px, calc(100vw - 24px));
  /* The UA stylesheet's height: fit-content would ignore the bottom inset. */
  height: auto;
  max-width: none;
  max-height: none;
  /* No padding at the top: the sticky head supplies its own, so that when the sheet
     scrolls there is no strip of padding above it for content to show through. */
  padding: 0 24px 22px;
  overflow-y: auto;
  color: var(--text);
  background: var(--surface);
  border: none;
  border-radius: 28px;
  box-shadow: 0 24px 60px -20px var(--drop-lg);

  &::backdrop {
    background: var(--scrim);
  }
`

export const Head = styled.div`
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* Full-bleed to the sheet's edges, so content scrolling under it is covered. */
  margin: 0 -24px 4px;
  padding: 20px 20px 14px 24px;
  background: var(--surface);
  border-bottom: 2px solid var(--line);
  border-radius: 28px 28px 0 0;

  h2 {
    margin: 0;
    font-family: 'Fredoka', 'Nunito', sans-serif;
    font-size: 24px;
    font-weight: 600;
  }
`

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px 0;
  border-top: 2px solid var(--line);

  &:first-of-type {
    padding-top: 12px;
    border-top: none;
  }

  h3 {
    margin: 0;
    color: var(--dim);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
`

/** A note the section ends on, set off from the controls above it. */
export const Note = styled.p`
  display: flex;
  align-items: baseline;
  margin: 0;
  padding: 10px 14px;
  color: var(--dim);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.45;
  background: var(--sunken);
  border-radius: 14px;

  /* The swatch sits beside a line of prose here, rather than on a row of its own. */
  ${Swatch} {
    align-self: center;
  }
`

export const ShortcutList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  font-size: 14px;
  list-style: none;

  li {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
  }
`

export const Keys = styled.span`
  display: flex;
  gap: 4px;

  kbd {
    padding: 3px 8px;
    color: var(--dim);
    font-family: inherit;
    font-size: 12px;
    font-weight: 800;
    background: var(--sunken);
    border-radius: 8px;
  }
`

/**
 * The theme control. Smaller than the activity tabs it borrows its shape from, because
 * this one is set once and the activity tabs are pressed every lesson.
 */
export const Segmented = styled.div`
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 999px;
`

export const Segment = styled.button`
  padding: 7px 16px;
  color: var(--dim);
  font-family: 'Fredoka', 'Nunito', sans-serif;
  font-size: 15px;
  font-weight: 500;
  background: transparent;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition:
    color 160ms ease,
    background 160ms ease;

  &[aria-checked='true'] {
    color: var(--surface);
    background: var(--text);
  }

  &:focus-visible {
    outline: 2px solid var(--text);
    outline-offset: 2px;
  }
`
