import { styled } from 'styled-components'

export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

/** The footer is only as wide as the activity track, and its children stretch to it — which
 *  is what puts the microphone button on exactly the track's width. */
export const Footer = styled.footer`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: stretch;
  width: fit-content;
  max-width: 100%;
  margin: 0 auto;
`

export const Message = styled.p`
  margin: 0;
  max-width: 46ch;
  color: var(--dim);
  font-size: 15px;
  line-height: 1.45;
  text-align: center;
  text-wrap: balance;
`

export const Shell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: 100%;
  /* Installed on a phone or projected from a tablet, the app runs under the status bar and
     the home indicator, so each edge takes whichever is larger. */
  padding: max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right))
    max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
  transition: background 300ms ease;

  /* The alert washes the paper rather than only the dial, so a room that is not looking at
     the board still notices the screen change colour. */
  &[data-alerting] {
    background: color-mix(in srgb, var(--zone) 10%, var(--bg));
  }

  &[data-alerting] ${Message} {
    color: var(--zone);
    font-weight: 800;
  }

  /*
   * Projector mode: the dial takes the room, and the chrome a teacher only needs between
   * activities gets out of its way until the pointer comes back.
   *
   * Written from the shell rather than on each piece because the condition belongs to the
   * shell — the header does not know the app is being projected.
   */
  &[data-projector] ${Header},
  &[data-projector] ${Footer},
  &[data-projector] ${Message} {
    opacity: 0;
    transition: opacity 400ms ease;
  }

  &[data-projector]:hover ${Header},
  &[data-projector]:hover ${Footer},
  &[data-projector]:hover ${Message},
  &[data-projector]:focus-within ${Header},
  &[data-projector]:focus-within ${Footer} {
    opacity: 1;
  }

  /* Nothing hovers on a touch screen, so there the chrome stays put and projector mode is
     only the larger dial. */
  @media (hover: none) {
    &[data-projector] ${Header},
    &[data-projector] ${Footer},
    &[data-projector] ${Message} {
      opacity: 1;
    }
  }
`

export const Title = styled.h1`
  margin: 0;
  font-family: 'Fredoka', 'Nunito', sans-serif;
  font-size: 26px;
  font-weight: 600;
  letter-spacing: -0.01em;

  /* The wordmark carries the app's one flourish: a dot that holds the room's colour. */
  &::after {
    content: '';
    display: inline-block;
    width: 9px;
    height: 9px;
    margin-left: 3px;
    vertical-align: 0.1em;
    background: var(--zone);
    border-radius: 999px;
    transition: background 300ms ease;
  }
`

export const Tools = styled.div`
  display: flex;
  gap: 8px;
`

export const Main = styled.main`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 0;
`
