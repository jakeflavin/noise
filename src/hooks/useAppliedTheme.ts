import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

/**
 * Writes the resolved theme to `<html data-theme>`, so CSS switches tokens without a
 * re-render and every app in the set keys off the same attribute.
 *
 * `system` stays live: the OS preference is watched rather than read once, so a room that
 * flips to dark at sunset follows without a reload.
 *
 * The resolved value is returned as well as written, because the zone colours have a
 * light and a dark form and the choice between them is made in JavaScript — a colour
 * handed to an SVG attribute cannot be a custom property that CSS swaps underneath it.
 */
export function useAppliedTheme(theme: Theme): ResolvedTheme {
  const [resolved, setResolved] = useState<ResolvedTheme>(() =>
    theme === 'system' ? systemTheme() : theme,
  )

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const next = theme === 'system' ? (media.matches ? 'dark' : 'light') : theme
      document.documentElement.dataset.theme = next
      setResolved(next)
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])

  return resolved
}

function systemTheme(): ResolvedTheme {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
