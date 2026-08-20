import { useCallback, useEffect, useRef, useState } from 'react'
import { dbOf, levelFromDb, rmsOf, smoothLevel } from '@/lib/levels'

export type MeterStatus = 'idle' | 'starting' | 'listening' | 'error'

/**
 * What to say when the microphone will not start.
 *
 * Every one of these is a thing that actually happens in a classroom — a laptop with
 * no microphone, a headset another tab is already holding, a prompt dismissed rather
 * than answered — and each has a different next step. Falling through to the browser's
 * own `message` gave the user two words ("Not supported") and nothing to do about it.
 */
const FAILURES = {
  NotAllowedError:
    'Microphone access was blocked. Allow it in the address bar, then start listening again.',
  NotFoundError:
    'No microphone was found. Plug one in or pick one in your system sound settings, then try again.',
  NotReadableError:
    'The microphone is busy — another app or tab is using it. Close that one, then try again.',
  OverconstrainedError:
    'This microphone cannot be used the way Hush needs. Pick a different one in your system sound settings.',
  SecurityError: 'This page needs to be served over https before it can use the microphone.',
  AbortError: 'The microphone stopped before it started. Try again.',
  NotSupportedError: 'This browser will not give a web page microphone access.',
} satisfies Record<string, string>

const FALLBACK = 'The microphone could not be started. Try again, or check your sound settings.'

export function failureMessage(e: unknown): string {
  if (!(e instanceof DOMException)) return FALLBACK
  return (FAILURES as Record<string, string | undefined>)[e.name] ?? FALLBACK
}

type AudioWindow = typeof globalThis & { webkitAudioContext?: typeof AudioContext }

/**
 * The live reading, and the microphone behind it.
 *
 * Audio is sampled on an animation frame rather than in state: a frame's worth of
 * samples only matters as the number it produces. The trim is read from a ref, so moving
 * the sensitivity slider retunes the meter instead of tearing the stream down and asking
 * again.
 */
export function useMeter(sensitivity: number) {
  const [level, setLevel] = useState(0)
  const [status, setStatus] = useState<MeterStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const contextRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const frameRef = useRef<number | null>(null)
  const sensitivityRef = useRef(sensitivity)
  sensitivityRef.current = sensitivity

  const stop = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    frameRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    void contextRef.current?.close()
    contextRef.current = null
    setLevel(0)
    setStatus('idle')
  }, [])

  // Whatever ends the page — a tab close, a route away, the component going — has to
  // release the microphone, or the browser keeps showing the recording indicator.
  useEffect(() => stop, [stop])

  const start = useCallback(async () => {
    setError(null)
    setStatus('starting')

    if (!navigator.mediaDevices?.getUserMedia) {
      setError(FAILURES.NotSupportedError)
      setStatus('error')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        // Gain control would fight the meter: it quietly turns a noisy room down until
        // it reads like a quiet one, which is exactly the thing being measured.
        audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false },
      })

      const AudioContextCtor = window.AudioContext ?? (window as AudioWindow).webkitAudioContext!
      const context = new AudioContextCtor()
      const analyser = context.createAnalyser()
      analyser.fftSize = 2048
      context.createMediaStreamSource(stream).connect(analyser)

      streamRef.current = stream
      contextRef.current = context
      setStatus('listening')

      const samples = new Uint8Array(analyser.fftSize)
      let last = performance.now()

      const tick = (now: number) => {
        const dt = Math.min((now - last) / 1000, 0.25)
        last = now

        analyser.getByteTimeDomainData(samples)
        const target = levelFromDb(dbOf(rmsOf(samples)), sensitivityRef.current)
        setLevel((previous) => smoothLevel(previous, target, dt))
        frameRef.current = requestAnimationFrame(tick)
      }

      frameRef.current = requestAnimationFrame(tick)
    } catch (e) {
      setError(failureMessage(e))
      stop()
      setStatus('error')
    }
  }, [stop])

  const listening = status === 'listening'
  const toggle = useCallback(() => {
    if (listening) stop()
    else void start()
  }, [listening, start, stop])

  return { level, status, listening, error, start, stop, toggle }
}
