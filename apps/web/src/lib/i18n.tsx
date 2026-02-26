import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { en, type TranslationKey } from '../locales/en'
import { ja } from '../locales/ja'

type Language = 'en' | 'ja'
type Translations = Record<TranslationKey, string>

const dictionaries: Record<Language, Translations> = { en, ja }

interface I18nContextType {
    lang: Language
    setLang: (lang: Language) => void
    t: (key: TranslationKey) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = useState<Language>(() => {
        const stored = localStorage.getItem('tf-lang')
        return (stored === 'ja' || stored === 'en') ? stored : 'ja'
    })

    const setLang = useCallback((l: Language) => {
        setLangState(l)
        localStorage.setItem('tf-lang', l)
        document.documentElement.lang = l
    }, [])

    useEffect(() => {
        document.documentElement.lang = lang
    }, [lang])

    const t = useCallback((key: TranslationKey): string => {
        return dictionaries[lang]?.[key] ?? dictionaries.en[key] ?? key
    }, [lang])

    return (
        <I18nContext.Provider value={{ lang, setLang, t }}>
            {children}
        </I18nContext.Provider>
    )
}

export function useTranslation() {
    const ctx = useContext(I18nContext)
    if (!ctx) throw new Error('useTranslation must be used within LanguageProvider')
    return ctx
}

export function LanguageToggle() {
    const { lang, setLang, t } = useTranslation()
    return (
        <div className="lang-toggle">
            <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>{t('lang.en')}</button>
            <button className={lang === 'ja' ? 'active' : ''} onClick={() => setLang('ja')}>{t('lang.ja')}</button>
        </div>
    )
}
