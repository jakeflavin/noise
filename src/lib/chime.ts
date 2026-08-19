/**
 * The alert's sound: two soft descending notes, near enough to a doorbell that a class
 * learns what it means, and quiet enough that it does not itself become the loudest
 * thing in the room.
 *
 * Synthesised rather than shipped as a file — it is two oscillators, and an audio file
 * would need loading, decoding and a licence.
 */
let context: AudioContext | null = null

type AudioWindow = typeof globalThis & { webkitAudioContext?: typeof AudioContext }

/** Created on the first play, which is by then safely inside a user gesture's wake. */
function audioContext(): AudioContext | null {
  const AudioContextCtor = window.AudioContext ?? (window as AudioWindow).webkitAudioContext
  if (!AudioContextCtor) return null
  context ??= new AudioContextCtor()
  void context.resume()
  return context
}

const NOTES = [
  { hz: 880, at: 0, length: 0.42 },
  { hz: 587.33, at: 0.16, length: 0.5 },
]

export function playChime(volume = 0.5) {
  const ctx = audioContext()
  if (!ctx) return

  for (const note of NOTES) {
    const start = ctx.currentTime + note.at
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.value = note.hz

    // An instant start clicks, so the note is given an edge to rise and fall on.
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(volume * 0.3, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + note.length)

    oscillator.connect(gain).connect(ctx.destination)
    oscillator.start(start)
    oscillator.stop(start + note.length + 0.05)
  }
}
