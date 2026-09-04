export type Theme = 'hackerdark' | 'hackerlight'

/** `system` suit la préférence du navigateur ; les deux autres la remplacent. */
export type ThemePreference = 'system' | 'light' | 'dark'

export const DARK_QUERY = '(prefers-color-scheme: dark)'

/** Thème effectivement appliqué, préférence stockée et système combinés. */
export function resolveTheme(
  preference: ThemePreference,
  prefersDark: boolean,
): Theme {
  if (preference === 'dark') return 'hackerdark'
  if (preference === 'light') return 'hackerlight'
  return prefersDark ? 'hackerdark' : 'hackerlight'
}
