import { useCallback, useEffect, useRef, useState } from 'react'
import { builtInPresets } from '@/lib/presets'
import type { ResolvedTheme } from '@/hooks/useAppliedTheme'
import { Tab, Tabs } from './PresetPicker.styled'

type PresetPickerProps = {
  presetId: string
  theme: ResolvedTheme
  onChange: (id: string) => void
}

/**
 * The activity, as a row of tabs. It is the control a teacher actually reaches for
 * mid-lesson, so it sits on the front screen rather than behind the settings drawer —
 * "we are moving to group work" should be one tap, not four.
 *
 * It calls itself a radio group, so it behaves like one: a single tab stop, and the
 * arrow keys move the selection. Five separate stops and inert arrow keys was the sort
 * of gap a screen reader announces and then walks straight into.
 */
export function PresetPicker({ presetId, theme, onChange }: PresetPickerProps) {
  const tabs = useRef<HTMLDivElement>(null)
  const selected = Math.max(
    0,
    builtInPresets.findIndex((preset) => preset.id === presetId),
  )
  const fade = useOverflow(tabs)

  const moveTo = (index: number) => {
    const next = builtInPresets[(index + builtInPresets.length) % builtInPresets.length]
    if (!next) return
    onChange(next.id)
    // The selection carries focus with it, which is what a radio group does and what
    // makes the row usable without a pointer.
    tabs.current?.querySelector<HTMLButtonElement>(`[data-preset='${next.id}']`)?.focus()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
    if (delta) {
      e.preventDefault()
      // Relative to whatever is focused rather than to what is selected. The two are the
      // same in normal use — the group has one tab stop and it is the selected chip — but
      // they part company if focus is moved any other way, and the arrow key should
      // answer to where the user can see the ring.
      const from = builtInPresets.findIndex(
        (preset) => preset.id === (e.target as HTMLElement).dataset.preset,
      )
      moveTo((from === -1 ? selected : from) + delta)
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault()
      moveTo(e.key === 'Home' ? 0 : builtInPresets.length - 1)
    }
  }

  // Switching activity from the keyboard, or from the digit shortcuts, has to bring the
  // chosen one into view — on a phone two of the five start out past the edge.
  useEffect(() => {
    const el = tabs.current?.querySelector<HTMLElement>(`[data-preset='${presetId}']`)
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [presetId])

  return (
    <Tabs
      ref={tabs}
      role="radiogroup"
      aria-label="Activity"
      onKeyDown={onKeyDown}
      style={fade as React.CSSProperties}
    >
      {builtInPresets.map((preset, i) => (
        <Tab
          key={preset.id}
          data-preset={preset.id}
          role="radio"
          aria-checked={preset.id === presetId}
          tabIndex={i === selected ? 0 : -1}
          onClick={() => onChange(preset.id)}
          title={preset.hint}
          style={{ '--chip': preset.ink[theme] } as React.CSSProperties}
        >
          {preset.name}
        </Tab>
      ))}
    </Tabs>
  )
}

/** How much of each end is masked away while there is something past it. */
const FADE = '30px'

/**
 * How wide the fade at each end of a scroller should be. CSS has no way to ask where a
 * scroller is, and the answer changes with the viewport, the scroll position and the
 * length of the labels.
 */
function useOverflow(ref: React.RefObject<HTMLElement | null>) {
  const [fade, setFade] = useState<Record<string, string>>({})

  const measure = useCallback(() => {
    const el = ref.current
    if (!el) return
    const left = el.scrollLeft
    const right = el.scrollWidth - el.clientWidth - left
    // Slack wide enough to swallow the row's own padding, which scrollIntoView leaves
    // behind — otherwise the last chip is in full view under a fade promising more.
    const past = (gap: number) => (gap > 8 ? FADE : '0px')
    setFade({ '--fade-start': past(left), '--fade-end': past(right) })
  }, [ref])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    measure()
    el.addEventListener('scroll', measure, { passive: true })
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => {
      el.removeEventListener('scroll', measure)
      observer.disconnect()
    }
  }, [measure, ref])

  return fade
}
