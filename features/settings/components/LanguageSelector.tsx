"use client"

import { Languages } from "lucide-react"
import { useTranslations } from "next-intl"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import type { Language, OrientationMode } from "@/features/speedometer/types"
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES } from "@/i18n/config"
import { cn } from "@/lib/utils"

type SegmentedSelectorProps<T extends string> = {
	label: string
	value: T
	onChange: (value: T) => void
	options: readonly { value: T; label: string; icon?: ReactNode }[]
	icon?: ReactNode
}

function SegmentedSelector<T extends string>({
	label,
	value,
	onChange,
	options,
	icon,
}: SegmentedSelectorProps<T>) {
	return (
		<div className="flex flex-col gap-4 rounded-2xl px-2 py-4 transition-colors hover:bg-muted/35">
			<div className="flex w-full items-center gap-3">
				{icon ? (
					<div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-background/75 text-muted-foreground shadow-sm">
						{icon}
					</div>
				) : null}
				<p className="text-[0.98rem] font-medium tracking-tight text-foreground">
					{label}
				</p>
			</div>
			<div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap">
				{options.map((option) => (
					<Button
						key={option.value}
						type="button"
						size="lg"
						variant={value === option.value ? "default" : "outline"}
						onClick={() => onChange(option.value)}
						className={cn(
							"min-h-14 flex-1 rounded-full px-6 text-base font-medium tracking-tight sm:flex-none",
						)}
						aria-pressed={value === option.value}
					>
						{option.icon ? (
							<span className="mr-2 flex shrink-0 items-center justify-center">
								{option.icon}
							</span>
						) : null}
						{option.label}
					</Button>
				))}
			</div>
		</div>
	)
}

type LanguageSelectorProps = {
	value: Language
	onChange: (language: Language) => void
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
	const t = useTranslations("settings")
	return (
		<SegmentedSelector
			label={t("language")}
			value={value}
			onChange={onChange}
			icon={<Languages className="size-5" />}
			options={SUPPORTED_LANGUAGES.map((lang) => ({
				value: lang,
				label: LANGUAGE_LABELS[lang],
			}))}
		/>
	)
}

type OrientationSelectorProps = {
	value: OrientationMode
	onChange: (mode: OrientationMode) => void
	label: string
	options: readonly { value: OrientationMode; label: string; icon?: ReactNode }[]
	icon?: ReactNode
}

export function OrientationSelector({
	value,
	onChange,
	label,
	options,
	icon,
}: OrientationSelectorProps) {
	return (
		<SegmentedSelector
			label={label}
			value={value}
			onChange={onChange}
			options={options}
			icon={icon}
		/>
	)
}
