import { useEffect, useState } from 'react'
import { Maximize2, Mic, MicOff, Minimize2, Settings as SettingsIcon } from 'lucide-react'
import { Gauge } from './components/Gauge'
import { Card as GaugeCard } from './components/Gauge.styled'
import { IconButton, ListenButton } from './components/buttons.styled'
import { Base, Footer, Header, Main, Message, Shell, Title, Tools } from './App.styled'
import { PresetPicker } from './components/PresetPicker'
import { SettingsDialog } from './components/SettingsDialog'
import { builtInPresets, resolvePreset, zoneFor, zones } from './lib/presets'
import { isDrawerOpen, isTypingTarget } from './lib/shortcuts'
import { useAlert } from './hooks/useAlert'
import { useMeter } from './hooks/useMeter'
import { useProjector, useWakeLock } from './hooks/useProjector'
import { useSettings } from './hooks/useSettings'
import { useAppliedTheme } from './hooks/useAppliedTheme'

export default function App() {
  const [settings, setSettings] = useSettings()
  const theme = useAppliedTheme(settings.theme)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const projector = useProjector()

  const { level, listening, status, error, toggle } = useMeter(settings.sensitivity)
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

  /*
   * The zone's colour is published to CSS so the button, the card and the alert all
   * answer to the room without each of them being handed the colour as a prop. Both
   * forms go out: the band colour for anything that is only colour, and the ink for
   * anything that carries type — see lib/presets.ts.
   *
   * A microphone that failed publishes the over colour, so the message it puts on screen
   * is the one thing on the page that is currently red. Otherwise a stopped meter keeps
   * the calm green, which is the "go" on the button rather than a claim about the room —
   * the claim is the dial's, and the dial greys itself while it is not measuring.
   */
  useEffect(() => {
    const showing = listening ? zone : status === 'error' ? zones.over : zones.calm
    const root = document.documentElement.style
    root.setProperty('--zone', showing.color)
    root.setProperty('--zone-ink', showing.ink[theme])
  }, [zone, listening, status, theme])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (isTypingTarget(e.target) || isDrawerOpen()) return

      // Indexed reads are checked now, so the preset is resolved once and the guard is the
      // value itself rather than a bounds test the compiler cannot connect to the lookup.
      const digit = Number(e.key)
      const preset =
        digit >= 1 && digit <= builtInPresets.length ? builtInPresets[digit - 1] : undefined
      if (preset) {
        e.preventDefault()
        setSettings((current) => ({ ...current, presetId: preset.id }))
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
    <Shell
      data-projector={projector.on || undefined}
      data-chrome={projector.on && !projector.chrome ? 'off' : undefined}
      data-live={listening || undefined}
      data-alerting={alerting || undefined}
    >
      <Header>
        <Title>Hush</Title>
        <Tools>
          <IconButton
            onClick={projector.toggle}
            aria-label={projector.on ? 'Leave projector mode' : 'Projector mode'}
          >
            {projector.on ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </IconButton>
          <IconButton onClick={() => setSettingsOpen(true)} aria-label="Open settings">
            <SettingsIcon size={18} />
          </IconButton>
        </Tools>
      </Header>

      <Main>
        <GaugeCard>
          <Gauge
            level={level}
            thresholds={preset.thresholds}
            zone={zone}
            listening={listening}
            alerting={alerting}
            zoneInk={zone.ink[theme]}
          />
        </GaugeCard>
      </Main>

      <Base>
        {/* The activity's name is set rather than lower-cased into the sentence: "over the
            custom limit" named an implementation detail, and "over the partners limit"
            was not a phrase anyone says. */}
        <Message role={error ? 'alert' : 'status'} data-error={error ? '' : undefined}>
          {error ??
            (alerting
              ? `That is over the limit for ${preset.name} — quiet voices, please.`
              : listening
                ? preset.hint
                : 'Nothing is recorded. The microphone is measured in this browser and thrown away.')}
        </Message>

        <Footer>
          <PresetPicker
            presetId={settings.presetId}
            theme={theme}
            onChange={(presetId) => setSettings((current) => ({ ...current, presetId }))}
          />
          <ListenButton onClick={toggle} disabled={status === 'starting'}>
            {listening ? <MicOff size={20} /> : <Mic size={20} />}
            {listening
              ? 'Stop'
              : status === 'starting'
                ? 'Starting…'
                : status === 'error'
                  ? 'Try again'
                  : 'Start listening'}
          </ListenButton>
        </Footer>
      </Base>

      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onChange={setSettings}
        listening={listening}
        level={level}
        theme={theme}
      />
    </Shell>
  )
}
