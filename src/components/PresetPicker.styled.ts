import { styled } from 'styled-components'

/**
 * Scrolls sideways rather than wrapping: the row of activities stays one line on a phone.
 *
 * A hidden scrollbar on a row that ends in a clean rounded cap reads as a complete row,
 * not a clipped one — on a phone that quietly hid Custom, the only activity whose limits
 * can be edited. So whichever end still has something past it is masked away: the pill
 * itself dissolves into the paper, which is a thing only a scroller does. Masking rather
 * than painting a fade over the top, because a white fade over the selected chip washed
 * half of it out.
 *
 * Which ends those are is the app's to say — CSS cannot read a scroll offset — and it
 * arrives as --fade-start and --fade-end on the element.
 */
export const Tabs = styled.div`
  display: flex;
  gap: 4px;
  max-width: 100%;
  padding: 5px;
  overflow-x: auto;
  background: var(--surface);
  border-radius: 999px;
  box-shadow: var(--shadow);
  scroll-behavior: smooth;
  scrollbar-width: none;
  mask-image: linear-gradient(
    to right,
    transparent 0,
    #000 var(--fade-start, 0px),
    #000 calc(100% - var(--fade-end, 0px)),
    transparent 100%
  );

  &::-webkit-scrollbar {
    display: none;
  }

  @media (prefers-reduced-motion: reduce) {
    scroll-behavior: auto;
  }
`

/** --chip is the activity's own ink, set inline from the preset for the current theme —
 *  the band colour it used to take put white on yellow at 1.64:1. */
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
    color: var(--on-zone);
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
