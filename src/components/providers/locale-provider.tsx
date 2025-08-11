"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { Locale, defaultLocale, locales, getTranslations, Translations } from "@/lib/i18n"

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Translations
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)
  const [translations, setTranslations] = useState<Translations>(getTranslations(defaultLocale))

  // 从 localStorage 加载语言设置
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('locale') as Locale
      if (savedLocale && locales.includes(savedLocale)) {
        setLocaleState(savedLocale)
        setTranslations(getTranslations(savedLocale))
      }
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    if (locales.includes(newLocale)) {
      setLocaleState(newLocale)
      setTranslations(getTranslations(newLocale))
      
      // 保存到 localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('locale', newLocale)
      }
    }
  }

  const value: LocaleContextType = {
    locale,
    setLocale,
    t: translations
  }

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}