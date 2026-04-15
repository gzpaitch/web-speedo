import type { Language } from "@/features/speedometer/types"

export const DEFAULT_LANGUAGE: Language = "en"
export const SUPPORTED_LANGUAGES: readonly Language[] = ["en", "pt"] as const

/** Display name for each supported language. */
export const LANGUAGE_LABELS: Record<Language, string> = {
	en: "English",
	pt: "Português",
}

export function isSupportedLanguage(value: unknown): value is Language {
	return (
		typeof value === "string" && SUPPORTED_LANGUAGES.includes(value as Language)
	)
}
