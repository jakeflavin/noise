/**
 * Writes the app icons as PNGs.
 *
 * Home-screen icons have to be PNG — iOS ignores an SVG apple-touch-icon — so they are
 * generated here rather than hand-drawn, and committed. Run `npm run icons` after
 * changing the mark. PNG is written directly: the alternative was a build-time image
 * dependency for three small files.
 */
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'

const OUT = new URL('../public/', import.meta.url)

/** The paper the app sits on, and the four zones of the dial, from src/presets.ts. */
const PAPER = [251, 247, 240]
const BANDS = [
  [47, 191, 113],
  [255, 192, 46],
  [255, 138, 43],
  [239, 65, 54],
]

/** The arc, matching src/geometry.ts: 270 degrees, opening at the bottom. */
const START_ANGLE = 135
const SWEEP = 270
const RING = { outer: 0.4, inner: 0.28 }
/** The white slots between bands, in degrees, as on the dial itself. */
const SLOT = 6

const lerp = (a, b, t) => a + (b - a) * t
const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n)

function crc32(buf) {
  const table = []
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  let crc = 0xffffffff
  for (const byte of buf) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, crc])
}

function png(size, pixels) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // truecolour, no alpha: an icon is opaque
  // Each scanline carries a leading filter byte; 0 means "store as is".
  const raw = Buffer.alloc(size * (size * 3 + 1))
  let at = 0
  for (let y = 0; y < size; y++) {
    raw[at++] = 0
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixels[y * size + x]
      raw[at++] = r
      raw[at++] = g
      raw[at++] = b
    }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function render(size) {
  const pixels = new Array(size * size)
  const edge = 1.5 / size

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / (size - 1) - 0.5
      const v = y / (size - 1) - 0.54 // the dial sits high, over its own open bottom

      let rgb = [...PAPER]

      const radius = Math.hypot(u, v)
      const degrees = (Math.atan2(v, u) * 180) / Math.PI
      const along = (((degrees - START_ANGLE) % 360) + 360) % 360

      if (along <= SWEEP) {
        // Inside the ring, and clear of the slot cut between two bands.
        const band = Math.min(
          clamp01((RING.outer - radius) / edge),
          clamp01((radius - RING.inner) / edge),
        )
        const toSlot = Math.min(
          ...[0.25, 0.5, 0.75].map((at) => Math.abs(along - at * SWEEP)),
        )
        const cover = Math.min(band, clamp01((toSlot - SLOT / 2) / (edge * 90)))
        if (cover > 0) {
          const color = BANDS[Math.min(BANDS.length - 1, Math.floor((along / SWEEP) * BANDS.length))]
          rgb = rgb.map((c, i) => lerp(c, color[i], cover))
        }
      }

      // The dial's two ends are rounded, so each gets a disc the width of the ring.
      for (const [at, color] of [
        [0, BANDS[0]],
        [1, BANDS[BANDS.length - 1]],
      ]) {
        const angle = ((START_ANGLE + at * SWEEP) * Math.PI) / 180
        const mid = (RING.outer + RING.inner) / 2
        const away = Math.hypot(u - Math.cos(angle) * mid, v - Math.sin(angle) * mid)
        const cover = clamp01(((RING.outer - RING.inner) / 2 - away) / edge)
        if (cover > 0) rgb = rgb.map((c, i) => lerp(c, color[i], cover))
      }

      pixels[y * size + x] = rgb.map((c) => Math.round(clamp01(c / 255) * 255))
    }
  }

  return png(size, pixels)
}

// 180 is what iOS asks for; 192 and 512 are what a manifest wants.
for (const size of [180, 192, 512]) {
  writeFileSync(new URL(`icon-${size}.png`, OUT), render(size))
  console.log(`wrote public/icon-${size}.png`)
}
