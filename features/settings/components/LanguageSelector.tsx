"use client"

import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import type { Language } from "@/features/speedometer/types"
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES } from "@/i18n/config"
import { cn } from "@/lib/utils"

type Props = {
	value: Language
	onChange: (language: Language) => void
}

export function LanguageSelector({ value, onChange }: Props) {
	const t = useTranslations("settings")
	return (
		<div className="flex min-h-14 items-center justify-between gap-4 px-1 py-2">
			<p className="text-base text-foreground">{t("language")}</p>
			<div className="flex gap-2">
				{SUPPORTED_LANGUAGES.map((lang) => (
					<Button
						key={lang}
						type="button"
						size="sm"
						variant={value === lang ? "default" : "outline"}
						onClick={() => onChange(lang)}
						className={cn("min-h-12 px-4")}
					>
						{LANGUAGE_LABELS[lang]}
					</Button>
				))}
			</div>
		</div>
	)
}
