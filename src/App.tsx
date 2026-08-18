import { useEffect, useState } from 'react'
import { Maximize2, Mic, MicOff, Minimize2, Settings as SettingsIcon } from 'lucide-react'
import { Gauge } from './components/Gauge'
import { PresetPicker } from './components/PresetPicker'
import { SettingsDialog } from './components/SettingsDialog'
import { builtInPresets, resolvePreset, zoneFor, zones } from './presets'
import { isDrawerOpen, isTypingTarget } from './shortcuts'
import { useAlert } from './useAlert'
import { useMeter } from './useMeter'
import { useProjector, useWakeLock } from './useProjector'
import { useSettings } from './useSettings'

export default function App() {
  const [settings, setSettings] = useSettings()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const projector = useProjector()

  const { level, listening, status, error, rawDbRef, toggle } = useMeter(settings.sensitivity)
  const preset = resolvePreset(settings.presetId, settings.custom)
  const zone = zoneFor(level, preset.thresholds)

  const alerting = useAlert({
    over: level >= preset.thresholds.loud,
    listening,
    graceSeconds: settings.graceSeconds,
    cooldownSeconds: settings.cooldownSeconds,
    sound: settings.sound,
  })

  useWakeLock(listening)

  // The zone's colour is published to CSS so the button, the card and the alert all
  // answer to the room without each of them being handed the colour as a prop.
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--zone',
      listening ? zone.color : zones.calm.color,
    )
  }, [zone, listening])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (isTypingTarget(e.target) || isDrawerOpen()) return

      const digit = Number(e.key)
      if (digit >= 1 && digit <= builtInPresets.length) {
        e.preventDefault()
        setSettings((current) => ({ ...current, presetId: builtInPresets[digit - 1].id }))
        return
      }

      if (e.key === ' ') {
        e.preventDefault()
        toggle()
      } else if (e.key.toLowerCase() === 'p') {
        e.preventDefault()
        projector.toggle()
      } else if (e.key.toLowerCase() === 's' || e.key === '?') {
        e.preventDefault()
        setSettingsOpen(true)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle, projector, setSettings])

  return (
    <div className="app" data-projector={projector.on || undefined} data-alerting={alerting || undefined}>
      <header className="app-header">
        <h1 className="app-title">Hush</h1>
        <div className="app-tools">
          <button
            className="icon-button"
            onClick={projector.toggle}
            aria-label={projector.on ? 'Leave projector mode' : 'Projector mode'}
          >
            {projector.on ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button
            className="icon-button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Open settings"
          >
            <SettingsIcon size={18} />
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="gauge-card">
          <Gauge
            level={level}
            thresholds={preset.thresholds}
            zone={zone}
            listening={listening}
            alerting={alerting}
          />
        </div>
        <p className="app-message" role="status">
          {error ??
            (alerting
              ? `That is over the ${preset.name.toLowerCase()} limit — quiet voices, please.`
              : listening
                ? preset.hint
                : 'Nothing is recorded. The microphone is measured in this browser and thrown away.')}
        </p>
      </main>

      <footer className="app-footer">
        <PresetPicker
          presetId={settings.presetId}
          onChange={(presetId) => setSettings((current) => ({ ...current, presetId }))}
        />
        <button className="listen-button" onClick={toggle} disabled={status === 'starting'}>
          {listening ? <MicOff size={20} /> : <Mic size={20} />}
          {listening ? 'Stop' : status === 'starting' ? 'Starting…' : 'Start listening'}
        </button>
      </footer>

      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onChange={setSettings}
        listening={listening}
        rawDbRef={rawDbRef}
      />
    </div>
  )
}
