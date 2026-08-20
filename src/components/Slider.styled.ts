import { styled } from 'styled-components'

/*
 * The two custom properties this reads — --fill and --accent — are set inline per render
 * from the value, so they stay as CSS variables rather than becoming props: the browser
 * repaints the gradient without React re-rendering the rule.
 */
export const Range = styled.input`
  width: 100%;
  height: 26px;
  margin: 0;
  background: linear-gradient(
      to right,
      var(--accent, var(--control)) var(--fill),
      var(--sunken) var(--fill)
    )
    center / 100% 10px no-repeat;
  border-radius: 999px;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    width: 24px;
    height: 24px;
    background: var(--accent, var(--control));
    border: 4px solid var(--surface);
    border-radius: 999px;
    box-shadow: 0 1px 4px var(--drop);
    appearance: none;
    -webkit-appearance: none;
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: var(--accent, var(--control));
    border: 4px solid var(--surface);
    border-radius: 999px;
    box-shadow: 0 1px 4px var(--drop);
  }

  /* A built-in activity shows its limits but does not hand them over to be dragged. */
  &:disabled {
    cursor: default;
    opacity: 0.45;
  }
`
