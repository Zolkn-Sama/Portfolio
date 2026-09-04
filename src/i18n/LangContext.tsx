import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { readLangParam, writeLangParam } from '../routing'
import { browserLanguages, preferredLang } from './detect'
import { ui, type Lang, type Ui } from './dict'

const STORAGE_KEY = 'portfolio.lang.v2'

function storedLang(): Lang | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'fr' || value === 'en' ? value : null
  } catch {
    return null
  }
}

/**
 * `?lang=` d'abord — un lien partagé impose la langue dans laquelle il a été
 * copié —, puis un choix explicite antérieur, et enfin le navigateur.
 */
function initialLang(): Lang {
  return readLangParam() ?? storedLang() ?? preferredLang(browserLanguages())
}

type LangValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  toggleLang: () => void
  t: Ui
  /** Résout un objet { fr, en } dans la langue courante. */
  L: <T>(value: { fr: T; en: T }) => T
}

const LangCtx = createContext<LangValue | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)
  const [chosen, setChosen] = useState(
    () => readLangParam() !== null || storedLang() !== null,
  )

  // L'attribut `lang` du document suit toujours la langue affichée.
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  // Tant que le visiteur n'a rien choisi, un changement de langue du navigateur
  // est répercuté ; après un choix explicite, il ne l'est plus.
  useEffect(() => {
    if (chosen) return
    const onChange = () => setLangState(preferredLang(browserLanguages()))
    window.addEventListener('languagechange', onChange)
    return () => window.removeEventListener('languagechange', onChange)
  }, [chosen])

  /**
   * Seul un choix explicite est mémorisé et inscrit dans l'URL. Écrire dès le
   * montage figerait la langue au premier passage et empêcherait à jamais de
   * suivre le navigateur.
   */
  const commit = useCallback((next: Lang) => {
    setLangState(next)
    setChosen(true)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Stockage refusé : le choix ne survivra pas à la session.
    }
    writeLangParam(next)
  }, [])

  const setLang = commit
  const toggleLang = useCallback(
    () => commit(lang === 'fr' ? 'en' : 'fr'),
    [commit, lang],
  )

  const value = useMemo<LangValue>(
    () => ({
      lang,
      setLang,
      toggleLang,
      t: ui[lang],
      L: <T,>(v: { fr: T; en: T }) => v[lang],
    }),
    [lang, setLang, toggleLang],
  )

  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang() {
  const ctx = useContext(LangCtx)
  if (!ctx) throw new Error('useLang doit être utilisé dans <LangProvider>')
  return ctx
}
