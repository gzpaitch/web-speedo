"use client"

import { NextIntlClientProvider } from "next-intl"
import * as React from "react"

import type { Language } from "@/features/speedometer/types"
import { DEFAULT_LANGUAGE } from "@/i18n/config"
import en from "@/i18n/locales/en.json"
import pt from "@/i18n/locales/pt.json"
import { getSettings } from "@/lib/storage"

type Messages = typeof en

const MESSAGES: Record<Language, Messages> = { en, pt }

type LanguageContextValue = {
	language: Language
	setLanguage: (language: Language) => void
}

const LanguageContext = React.createContext<LanguageContextValue | null>(null)

export function IntlProvider({ children }: { children: React.ReactNode }) {
	// Default to `en` on first render to keep SSR deterministic; the real
	// language comes from localStorage after mount.
	const [language, setLanguageState] =
		React.useState<Language>(DEFAULT_LANGUAGE)

	React.useEffect(() => {
		// Read the persisted language once on mount. Subsequent updates flow
		// through the public `setLanguage` below.
		setLanguageState(getSettings().language)
	}, [])

	const setLanguage = React.useCallback((next: Language) => {
		setLanguageState(next)
	}, [])

	// Keep <html lang> in sync with the active language so screen readers
	// announce content in the correct language (fixes hardcoded lang="en").
	React.useEffect(() => {
		if (typeof document !== "undefined") {
			document.documentElement.lang = language
		}
	}, [language])

	const value = React.useMemo<LanguageContextValue>(
		() => ({ language, setLanguage }),
		[language, setLanguage]
	)

	return (
		<LanguageContext.Provider value={value}>
			<NextIntlClientProvider
				locale={language}
				messages={MESSAGES[language]}
				timeZone="UTC"
			>
				{children}
			</NextIntlClientProvider>
		</LanguageContext.Provider>
	)
}

export function useLanguage(): LanguageContextValue {
	const ctx = React.useContext(LanguageContext)
	if (!ctx) {
		throw new Error("useLanguage must be used inside <IntlProvider>")
	}
	return ctx
}
