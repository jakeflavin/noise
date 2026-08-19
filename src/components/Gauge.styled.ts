import { styled } from 'styled-components'

/**
 * The card the dial sits in.
 *
 * It takes its width from whichever runs out first, the screen's width or its height, and
 * the dial's own proportions give it its height from there. Sizing it by height alone left
 * the card letterboxed around the dial on a phone.
 */
export const Card = styled.div`
  display: flex;
  flex: 0 1 auto;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: min(100%, 72vh);
  padding: 18px 26px;
  background: var(--surface);
  border-radius: 32px;
  box-shadow: var(--shadow);

  /* Travels with the rule it overrides — see docs/STANDARDS.md. */
  @media (max-height: 760px), (max-width: 620px) {
    padding: 12px 16px;
  }

  /*
   * Projector mode hands the room's screen over to the dial, so the card is allowed to
   * grow past the height cap it takes on a desk. Written as an ancestor condition because
   * the attribute is on the app shell, which is not this component's to know about
   * otherwise.
   */
  [data-projector] & {
    max-width: min(100%, 96vh);
  }
`

/**
 * The dial. Styled as an element rather than through attributes because the alert
 * animation and the sizing are CSS; the colours stay as SVG attributes, since they are
 * per-band and come from the activity.
 */
export const Dial = styled.svg`
  width: 100%;
  height: auto;

  /* The alert beats the dial rather than fading it: a fill that dims halfway through
     every cycle reads as a rendering fault, not as a warning. */
  &[data-alerting] {
    animation: alert-beat 900ms ease-in-out infinite;
    transform-origin: center;
  }

  @keyframes alert-beat {
    50% {
      transform: scale(1.03);
    }
  }
`

export const Fill = styled.path`
  /* The fill is redrawn every frame from the reading itself, so it must not also be
     animated by CSS — the two would fight and the dial would lag the room. Only the
     colour is given a transition, because a zone change is a step, not a sweep. */
  transition: stroke 300ms ease;
`

export const Reading = styled.text`
  font-family: 'Fredoka', 'Nunito', sans-serif;
  font-size: 116px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.04em;
  fill: var(--text);
`

export const Zone = styled.text`
  font-family: 'Fredoka', 'Nunito', sans-serif;
  font-size: 32px;
  font-weight: 500;
`
