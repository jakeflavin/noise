import { styled } from 'styled-components'

/** Scrolls sideways rather than wrapping: the row of activities stays one line on a phone. */
export const Tabs = styled.div`
  display: flex;
  gap: 4px;
  max-width: 100%;
  padding: 5px;
  overflow-x: auto;
  background: var(--surface);
  border-radius: 999px;
  box-shadow: var(--shadow);
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`

/** --chip is the activity's own colour, set inline from the preset. */
export const Tab = styled.button`
  flex: 0 0 auto;
  padding: 11px 22px;
  color: var(--dim);
  font-family: 'Fredoka', 'Nunito', sans-serif;
  font-size: 17px;
  font-weight: 500;
  background: transparent;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition:
    color 160ms ease,
    background 160ms ease;

  &:hover {
    color: var(--text);
    background: var(--sunken);
  }

  &[aria-checked='true'] {
    color: #fff;
    background: var(--chip);
  }

  /*
   * Has to travel with the base rule rather than stay in the stylesheet. Both are one
   * class deep, so source order decides — and styled-components injects into <head> at
   * runtime, which is after index.css. Left behind, this override silently stopped
   * applying.
   */
  @media (max-height: 760px), (max-width: 620px) {
    padding: 10px 14px;
    font-size: 15px;
  }
`
