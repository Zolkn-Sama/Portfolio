import { useLang } from '../i18n/LangContext'
import { useTheme } from './ThemeContext'

export function Toolbar() {
  const { lang, setLang, t } = useLang()
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className="flex items-center gap-2">
      <div
        className="join border border-base-300"
        role="group"
        aria-label={t.lang}
      >
        {(['fr', 'en'] as const).map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            aria-pressed={lang === code}
            className={`join-item btn btn-xs sm:btn-sm font-mono uppercase ${
              lang === code ? 'btn-primary' : 'btn-ghost'
            }`}
          >
            {code}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={toggleTheme}
        className="btn btn-xs sm:btn-sm btn-ghost border border-base-300 gap-2 font-mono"
        aria-label={`${t.theme} — ${isDark ? t.themeLight : t.themeDark}`}
        title={t.theme}
      >
        <span aria-hidden="true">{isDark ? '☀' : '☾'}</span>
        <span className="hidden sm:inline">
          {isDark ? t.themeLight : t.themeDark}
        </span>
      </button>
    </div>
  )
}
