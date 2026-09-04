import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { DARK_QUERY, resolveTheme, type Theme, type ThemePreference } from './theme'

export type { Theme, ThemePreference }

const STORAGE_KEY = 'portfolio.theme.v2'

function storedPreference(): ThemePreference {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : 'system'
  } catch {
    return 'system'
  }
}

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(DARK_QUERY).matches
}

type ThemeValue = {
  theme: Theme
  preference: ThemePreference
  toggleTheme: () => void
  isDark: boolean
}

const ThemeCtx = createContext<ThemeValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>(storedPreference)
  const [prefersDark, setPrefersDark] = useState(systemPrefersDark)

  // Suit la préférence du navigateur tant qu'aucun choix n'a été fait, et même
  // après : le thème résolu doit rester juste si l'OS bascule en cours de route.
  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY)
    const onChange = (event: MediaQueryListEvent) => setPrefersDark(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const theme = resolveTheme(preference, prefersDark)

  useEffect(() => {
    // Sans choix explicite, on retire l'attribut : le CSS reprend la main et
    // `prefers-color-scheme` s'applique, y compris si JavaScript est absent.
    if (preference === 'system') delete document.documentElement.dataset.theme
    else document.documentElement.dataset.theme = theme

    try {
      if (preference === 'system') localStorage.removeItem(STORAGE_KEY)
      else localStorage.setItem(STORAGE_KEY, preference)
    } catch {
      // Stockage refusé : le choix ne survivra pas à la session.
    }
  }, [preference, theme])

  const toggleTheme = useCallback(
    () => setPreference(resolveTheme(preference, prefersDark) === 'hackerdark' ? 'light' : 'dark'),
    [preference, prefersDark],
  )

  const value = useMemo<ThemeValue>(
    () => ({ theme, preference, toggleTheme, isDark: theme === 'hackerdark' }),
    [theme, preference, toggleTheme],
  )

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeCtx)
  if (!ctx) throw new Error('useTheme doit être utilisé dans <ThemeProvider>')
  return ctx
}
