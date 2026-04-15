"use client"

import { Languages } from "lucide-react"
import { useTranslations } from "next-intl"
import type { ReactNode } from "react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
	const columnsClass =
		options.length === 2
			? "grid-cols-2"
			: options.length === 3
				? "grid-cols-3"
				: "grid-cols-1"

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
			<Tabs
				value={value}
				onValueChange={(next) => onChange(next as T)}
				className="w-full"
			>
				<TabsList
					className={cn(
						"grid h-auto w-full gap-2 rounded-[1.5rem] bg-muted/55 p-1.5",
						columnsClass
					)}
				>
					{options.map((option) => (
						<TabsTrigger
							key={option.value}
							value={option.value}
							className={cn(
								"min-h-13 h-auto w-full rounded-[1.15rem] px-3 py-3 text-center text-sm font-medium tracking-tight whitespace-normal text-foreground/70 data-[state=active]:bg-background data-[state=active]:text-foreground dark:data-[state=active]:bg-background/80",
								options.length > 2 && "text-[0.92rem]"
							)}
						>
							{option.icon ? (
								<span className="flex shrink-0 items-center justify-center">
									{option.icon}
								</span>
							) : null}
							{option.label}
						</TabsTrigger>
					))}
				</TabsList>
			</Tabs>
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
	options: readonly {
		value: OrientationMode
		label: string
		icon?: ReactNode
	}[]
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
