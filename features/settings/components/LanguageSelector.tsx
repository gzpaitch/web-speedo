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
	options: readonly { value: T; label: string }[]
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
		<div className="flex min-h-18 flex-col gap-3 rounded-[1.4rem] border border-transparent px-3 py-3 transition-colors hover:border-border/70 hover:bg-muted/35">
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
			<div className="flex w-full flex-wrap gap-2 rounded-[1.6rem] border border-border/70 bg-background/75 p-1 shadow-sm">
				{options.map((option) => (
					<Button
						key={option.value}
						type="button"
						size="sm"
						variant={value === option.value ? "default" : "outline"}
						onClick={() => onChange(option.value)}
						className={cn(
							"min-h-11 flex-1 rounded-[1.2rem] px-4 font-medium tracking-tight shadow-none sm:flex-none",
							value !== option.value &&
								"border-transparent bg-transparent hover:border-border/80 hover:bg-muted/55"
						)}
						aria-pressed={value === option.value}
					>
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
	options: readonly { value: OrientationMode; label: string }[]
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
