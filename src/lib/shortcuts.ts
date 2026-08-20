/**
 * `keys` are real keys and get drawn as keycaps. `through` says the pair is a range
 * rather than two separate keys — the dash between them is punctuation, and setting it
 * as a third keycap said there was a key marked "–".
 */
export type Shortcut = { keys: string[]; label: string; through?: boolean }

export const shortcuts: Shortcut[] = [
  { keys: ['Space'], label: 'Start or stop listening' },
  { keys: ['1', '5'], label: 'Switch activity', through: true },
  { keys: ['←', '→'], label: 'Move through the activities' },
  { keys: ['P'], label: 'Projector mode' },
  { keys: ['S'], label: 'Open settings' },
  { keys: ['?'], label: 'Show these shortcuts' },
  { keys: ['Esc'], label: 'Close the drawer' },
]

/** Narrows an event target to an element; keydown can also target window or document,
 *  which have none of the element methods a guard would want to call. */
export function targetElement(target: EventTarget | null) {
  return target instanceof HTMLElement ? target : null
}

/** True while the keystroke belongs to something the user is typing into. */
export function isTypingTarget(target: EventTarget | null) {
  const el = targetElement(target)
  if (!el) return false
  return (
    el.isContentEditable ||
    el.tagName === 'INPUT' ||
    el.tagName === 'TEXTAREA' ||
    el.tagName === 'SELECT'
  )
}

/** A modal drawer takes over the keyboard; shortcuts behind it would act unseen. */
export function isDrawerOpen() {
  return document.querySelector('dialog[open]') !== null
}
