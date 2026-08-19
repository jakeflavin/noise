import { useEffect } from 'react'

export type Theme = 'light' | 'dark' | 'system'

/**
 * Writes the resolved theme to `<html data-theme>`, so CSS switches tokens without a
 * re-render and every app in the set keys off the same attribute.
 *
 * `system` stays live: the OS preference is watched rather than read once, so a room that
 * flips to dark at sunset follows without a reload.
 */
export function useAppliedTheme(theme: Theme) {
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const resolved = theme === 'system' ? (media.matches ? 'dark' : 'light') : theme
      document.documentElement.dataset.theme = resolved
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])
}
