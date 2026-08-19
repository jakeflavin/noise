# Hush

A classroom noise meter: a colourful dial at the front of the room that shows a class
how loud it is, and says something when it stays too loud.

The microphone is measured in the browser, frame by frame, and thrown away. Nothing is
recorded, stored or sent anywhere.

## What it does

- **A live dial.** One thick arc, banded green through red at this activity's limits
  and filled to the room's current level, with a peak mark that slides back down.
- **Activities.** Silent, Independent, Partners, Groups and a Custom set — each with
  its own idea of where calm ends and too loud begins. One tap, or keys `1`–`5`.
- **An alert.** When the room stays over its limit for longer than the set patience,
  the dial beats, the page washes over in the zone's colour and an optional chime
  sounds — then it holds its tongue for the cooldown rather than nagging.
- **Projector mode.** Fullscreen, chrome out of the way, screen held awake (`P`).
- **Calibration.** A sensitivity trim, and a one-tap calibrate that takes the room's
  current hush as its baseline.

## Running it

```
npm install
npm run dev
```

`npm test` runs the unit tests, `npm run lint` and `npm run typecheck` the checks CI
runs, and `npm run icons` regenerates the PNG app icons after a change to the mark.

## Standards

Code in this repo follows the [shared standards](https://github.com/jakeflavin/portfolio/blob/main/docs/STANDARDS.md) and [layout](https://github.com/jakeflavin/portfolio/blob/main/docs/LAYOUT.md) used across the directory.
