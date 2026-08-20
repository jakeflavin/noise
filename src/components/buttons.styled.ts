import { styled } from 'styled-components'

/**
 * The three button shapes this app uses, shared because they appear in more than one
 * component — the front screen and the settings drawer both reach for them.
 *
 * Variants are transient props rather than modifier classes: styled-components keeps a
 * `$`-prefixed prop out of the DOM, and it puts the choice in the type system.
 */

/**
 * The one thing a teacher presses mid-lesson, sized to be hit without looking.
 *
 * It still answers to the room, but in the zone's ink rather than its band colour:
 * white on the band measured 2.38:1 on green and 1.64:1 on yellow, and this is the
 * app's largest, most-pressed control. The ink is dark enough on paper that --on-zone
 * clears 4.5:1 in both themes.
 */
export const ListenButton = styled.button`
  display: inline-flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 62px;
  padding: 0 34px;
  color: var(--on-zone);
  font-family: 'Fredoka', 'Nunito', sans-serif;
  font-size: 21px;
  font-weight: 500;
  background: var(--zone-ink);
  border: none;
  /* The solid ledge under the button is what makes it feel like something to press. */
  border-radius: 999px;
  box-shadow: 0 5px 0 color-mix(in srgb, var(--zone-ink) 72%, #000);
  cursor: pointer;
  transition:
    background 300ms ease,
    box-shadow 120ms ease,
    transform 120ms ease;

  /* Pressing squashes the ledge rather than moving the button away from the finger. */
  &:active {
    transform: translateY(4px);
    box-shadow: 0 1px 0 color-mix(in srgb, var(--zone-ink) 72%, #000);
  }

  &:disabled {
    opacity: 0.65;
    cursor: default;
  }
`

export const IconButton = styled.button<{ $quiet?: boolean }>`
  display: grid;
  place-items: center;
  width: ${(props) => (props.$quiet ? '38px' : '46px')};
  height: ${(props) => (props.$quiet ? '38px' : '46px')};
  color: var(--dim);
  background: ${(props) => (props.$quiet ? 'transparent' : 'var(--surface)')};
  border: none;
  border-radius: 999px;
  box-shadow: ${(props) => (props.$quiet ? 'none' : 'var(--shadow)')};
  cursor: pointer;
  transition:
    color 160ms ease,
    transform 120ms ease;

  &:hover {
    color: var(--text);
    ${(props) => props.$quiet && 'background: var(--sunken);'}
  }

  &:active {
    transform: translateY(2px);
  }
`

export const OutlineButton = styled.button<{ $small?: boolean }>`
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-height: ${(props) => (props.$small ? '38px' : '46px')};
  padding: ${(props) => (props.$small ? '0 14px' : '0 18px')};
  color: var(--text);
  font-family: 'Fredoka', 'Nunito', sans-serif;
  font-size: ${(props) => (props.$small ? '15px' : '16px')};
  font-weight: 500;
  background: var(--sunken);
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition: background 160ms ease;

  &:hover:not(:disabled) {
    background: var(--sunken-2);
  }

  &:disabled {
    color: var(--dim);
    opacity: 0.7;
    cursor: default;
  }
`

/** The zone a threshold belongs to, named by its colour now that the faces are gone. */
export const Swatch = styled.span`
  flex: 0 0 auto;
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 9px;
  border-radius: 999px;
`
