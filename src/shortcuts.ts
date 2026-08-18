export type Shortcut = { keys: string[]; label: string }

export const shortcuts: Shortcut[] = [
  { keys: ['Space'], label: 'Start or stop listening' },
  { keys: ['1', '–', '5'], label: 'Switch activity' },
  { keys: ['P'], label: 'Projector mode' },
  { keys: ['S'], label: 'Open settings' },
  { keys: ['?'], label: 'Show these shortcuts' },
  { keys: ['Esc'], label: 'Close the drawer' },
]

/** True while the keystroke belongs to something the user is typing into. */
export function isTypingTarget(target: EventTarget | null) {
  const el = target instanceof Element ? target : null
  if (!el) return false
  const tag = el.tagName
  return (
    tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (el as HTMLElement).isContentEditable
  )
}

/** A modal drawer takes over the keyboard; shortcuts behind it would act unseen. */
export function isDrawerOpen() {
  return document.querySelector('dialog[open]') !== null
}
