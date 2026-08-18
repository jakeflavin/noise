import { useCallback, useEffect, useRef, useState } from 'react'
import { dbOf, levelFromDb, rmsOf, smoothLevel } from './levels'

export type MeterStatus = 'idle' | 'starting' | 'listening' | 'error'

type AudioWindow = typeof globalThis & { webkitAudioContext?: typeof AudioContext }

/**
 * The live reading, and the microphone behind it.
 *
 * Audio is sampled on an animation frame rather than in state: a frame's worth of
 * samples only matters as the number it produces, and the raw decibels are kept in a
 * ref so calibration can ask what the room sounds like right now without the reading
 * itself causing a render. The trim is read the same way, so moving the sensitivity
 * slider retunes the meter instead of tearing the stream down and asking again.
 */
export function useMeter(sensitivity: number) {
  const [level, setLevel] = useState(0)
  const [status, setStatus] = useState<MeterStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const contextRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const frameRef = useRef<number | null>(null)
  const rawDbRef = useRef(-Infinity)
  const sensitivityRef = useRef(sensitivity)
  sensitivityRef.current = sensitivity

  const stop = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    frameRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    void contextRef.current?.close()
    contextRef.current = null
    rawDbRef.current = -Infinity
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
      setError('This browser will not give a web page microphone access.')
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
        const db = dbOf(rmsOf(samples))
        rawDbRef.current = db

        const target = levelFromDb(db, sensitivityRef.current)
        setLevel((previous) => smoothLevel(previous, target, dt))
        frameRef.current = requestAnimationFrame(tick)
      }

      frameRef.current = requestAnimationFrame(tick)
    } catch (e) {
      const denied = e instanceof DOMException && e.name === 'NotAllowedError'
      setError(
        denied
          ? 'Microphone access was blocked. Allow it in the address bar, then start again.'
          : e instanceof Error
            ? e.message
            : 'The microphone could not be started.',
      )
      stop()
      setStatus('error')
    }
  }, [stop])

  const listening = status === 'listening'
  const toggle = useCallback(() => {
    if (listening) stop()
    else void start()
  }, [listening, start, stop])

  return { level, status, listening, error, rawDbRef, start, stop, toggle }
}
