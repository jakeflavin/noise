import { styled } from 'styled-components'

export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const Message = styled.p`
  margin: 0;
  max-width: 46ch;
  color: var(--dim);
  font-size: 15px;
  line-height: 1.45;
  text-align: center;
  text-wrap: balance;

  /* A microphone that will not start is not an aside. It takes the zone's ink, which is
     the alert's red at the moment it is shown, so a failure never reads as reassurance. */
  &[data-error] {
    color: var(--zone-ink);
    font-weight: 800;
  }
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

/**
 * What the dial is not: the line of prose and the controls, kept together as one thing.
 *
 * They travel together in every layout the app has — beside the dial on a phone held
 * sideways, out of the way in projector mode — and grouping them is what lets the dial
 * be the only thing left in the flow when the chrome goes, so it centres on the board
 * rather than sitting above centre by the height of a footer nobody can see.
 */
export const Base = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  min-width: 0;
`

export const Shell = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: 100%;
  /* Installed on a phone or projected from a tablet, the app runs under the status bar and
     the home indicator, so each edge takes whichever is larger. */
  padding: max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right))
    max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
  transition:
    background 300ms ease,
    padding 300ms ease;

  /* The alert washes the paper rather than only the dial, so a room that is not looking at
     the board still notices the screen change colour. */
  &[data-alerting] {
    background: color-mix(in srgb, var(--zone) 10%, var(--bg));
  }

  /* The instruction is the only line in the app that says what to *do*, so it is set in
     the zone's ink rather than the band colour — the band and the wash it is printed on
     are drawn from the same value, which left the two of them a shade apart. */
  &[data-alerting] ${Message} {
    color: var(--zone-ink);
    font-weight: 800;
  }

  /*
   * Projector mode: the dial takes the room, and the chrome a teacher only needs between
   * activities gets out of its way.
   *
   * The chrome is taken out of the flow as well as out of sight. Left in it, the base went
   * on holding its height while invisible, which pushed the dial a fixed 68px above the
   * centre of the board — an offset that only made sense while the controls were there to
   * justify it. The page's own padding goes too: on a portrait screen the dial is capped
   * by the width, so the margin is the only width there is left to give it.
   */
  &[data-projector] {
    padding: max(6px, env(safe-area-inset-top)) max(6px, env(safe-area-inset-right))
      max(6px, env(safe-area-inset-bottom)) max(6px, env(safe-area-inset-left));
  }

  &[data-projector] ${Header}, &[data-projector] ${Base} {
    position: absolute;
    z-index: 2;
    transition: opacity 400ms ease;
  }

  &[data-projector] ${Header} {
    top: max(10px, env(safe-area-inset-top));
    right: max(10px, env(safe-area-inset-right));
    left: max(10px, env(safe-area-inset-left));
  }

  &[data-projector] ${Base} {
    bottom: max(10px, env(safe-area-inset-bottom));
    left: 50%;
    max-width: calc(100% - 24px);
    transform: translateX(-50%);
  }

  /* Hidden by the app once the room has been left alone for a moment — see
     hooks/useProjector.ts, which decides this from idleness rather than from hover. */
  &[data-projector][data-chrome='off'] ${Header}, &[data-projector][data-chrome='off'] ${Base} {
    opacity: 0;
    pointer-events: none;
  }

  /* A keyboard is not idle. Anything focused this way holds the controls open however
     long the pointer sits still; :focus-visible rather than :focus-within so that
     clicking the projector button does not pin them open for the rest of the lesson. */
  &[data-projector]:has(:focus-visible) ${Header}, &[data-projector]:has(:focus-visible) ${Base} {
    opacity: 1;
    pointer-events: auto;
  }

  /*
   * A phone or tablet on its side. The dial was capped by the short axis and left two
   * thirds of the width empty, so turning the device made the meter smaller than it was
   * in portrait. Here the controls move alongside the dial and the height is the dial's.
   */
  @media (orientation: landscape) and (max-height: 560px) {
    display: grid;
    grid-template-columns: minmax(0, 1fr) min(300px, 34vw);
    grid-template-rows: auto minmax(0, 1fr);
    grid-template-areas:
      'head head'
      'dial base';
    align-items: center;
    column-gap: 18px;

    ${Header} {
      grid-area: head;
    }

    ${Base} {
      grid-area: base;
      width: 100%;
    }

    ${Footer} {
      width: 100%;
    }
  }
`

export const Title = styled.h1`
  margin: 0;
  font-family: 'Fredoka', 'Nunito', sans-serif;
  font-size: 26px;
  font-weight: 600;
  letter-spacing: -0.01em;

  /* The wordmark carries the app's one flourish: a dot that holds the room's colour —
     and holds the paper's own grey while there is no room being listened to, since a
     green dot on a stopped meter is the same picture a quiet class makes. */
  &::after {
    content: '';
    display: inline-block;
    width: 9px;
    height: 9px;
    margin-left: 3px;
    vertical-align: 0.1em;
    background: var(--dim);
    border-radius: 999px;
    transition: background 300ms ease;
  }

  [data-live] &::after {
    background: var(--zone);
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
  min-height: 0;

  @media (orientation: landscape) and (max-height: 560px) {
    grid-area: dial;
  }
`
