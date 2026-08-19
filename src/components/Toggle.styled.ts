import { styled } from 'styled-components'

/** The visible switch. Sits under the real checkbox, which is invisible but still the control. */
export const Track = styled.span`
  grid-area: 1 / 1;
  width: 54px;
  height: 32px;
  padding: 4px;
  background: var(--sunken-2);
  border-radius: 999px;
  transition: background 200ms ease;

  /* The knob. */
  &::after {
    content: '';
    display: block;
    width: 24px;
    height: 24px;
    background: var(--surface);
    border-radius: 999px;
    box-shadow: 0 1px 3px var(--drop);
    transition: transform 200ms cubic-bezier(0.2, 0.8, 0.3, 1.2);
  }
`

export const Wrapper = styled.label`
  flex: 0 0 auto;
  display: inline-grid;
  cursor: pointer;

  /*
   * Stacked on the track rather than hidden, so the checkbox is still the thing that gets
   * clicked and focused — the appearance is the only part this app supplies.
   */
  input {
    grid-area: 1 / 1;
    width: 100%;
    height: 100%;
    margin: 0;
    opacity: 0;
    cursor: pointer;
  }

  input:checked + ${Track} {
    background: var(--zone);
  }

  input:checked + ${Track}::after {
    transform: translateX(22px);
  }

  input:focus-visible + ${Track} {
    outline: 2px solid var(--text);
    outline-offset: 2px;
  }
`
