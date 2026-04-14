"use client"

import {
	BellRing,
	MoonStar,
	RotateCw,
	Ruler,
	Scale,
	Smartphone,
} from "lucide-react"
import { useTranslations } from "next-intl"

import { Separator } from "@/components/ui/separator"
import { useActiveMetrics } from "@/features/speedometer/hooks/useActiveMetrics"
import type { Language } from "@/features/speedometer/types"
import { useWakeLock } from "@/hooks/useWakeLock"
import { useLanguage } from "@/i18n/IntlProvider"
import { cn } from "@/lib/utils"
import { useTheme } from "@/providers/ThemeProvider"

import { useSettings } from "../hooks/useSettings"
import { LanguageSelector, OrientationSelector } from "./LanguageSelector"
import { MetricsToggleList } from "./MetricsToggleList"
import { NumberInputRow } from "./NumberInputRow"
import { ToggleRow } from "./ToggleRow"

export function SettingsScreen() {
	const t = useTranslations("settings")
	const { settings, updateSettings, hydrated } = useSettings()
	const { activeIds, toggle } = useActiveMetrics()
	const { resolvedTheme, setTheme } = useTheme()
	const { setLanguage } = useLanguage()
	const wakeLock = useWakeLock(settings.keepScreenOn)

	const isDark = resolvedTheme === "dark"

	return (
		<section
			className={cn(
				"relative h-full min-h-dvh w-full overflow-y-auto bg-background px-6 text-foreground",
				"pt-[max(env(safe-area-inset-top),1.5rem)] pb-[max(env(safe-area-inset-bottom),1.5rem)]"
			)}
			aria-labelledby="settings-title"
		>
			<div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.16),_transparent_58%)] opacity-90" />
			<div className="pointer-events-none absolute right-0 bottom-24 size-44 rounded-full bg-[hsl(var(--primary)/0.08)] blur-3xl" />

			<header className="relative mb-6">
				<h1
					id="settings-title"
					className="text-3xl font-semibold tracking-[-0.03em]"
				>
					{t("title")}
				</h1>
				<div className="mt-3 h-1 w-20 rounded-full bg-[linear-gradient(90deg,hsl(var(--primary)),hsl(var(--primary)/0.2))]" />
			</header>

			<div className="relative flex flex-col gap-5 xl:grid xl:grid-cols-2 xl:gap-6">
				{/* Left column — toggles */}
				<div className="rounded-[2rem] border border-border/70 bg-card/70 p-3 shadow-[0_20px_60px_-32px_hsl(var(--foreground)/0.45)] backdrop-blur">
					<ToggleRow
						label={t("theme")}
						checked={isDark}
						icon={<MoonStar className="size-5" />}
						onCheckedChange={(value) => {
							const desired = value ? "dark" : "light"
							setTheme(desired)
						}}
					/>
					<Separator className="mx-3 bg-border/60" />
					<ToggleRow
						label={t("units")}
						description={
							settings.units === "metric"
								? t("unitsMetric")
								: t("unitsImperial")
						}
						checked={settings.units === "imperial"}
						icon={<Ruler className="size-5" />}
						onCheckedChange={(value) =>
							updateSettings({ units: value ? "imperial" : "metric" })
						}
					/>
					<Separator className="mx-3 bg-border/60" />
					<ToggleRow
						label={t("keepScreenOn")}
						description={
							!wakeLock.isSupported ? t("wakeLockUnsupported") : undefined
						}
						checked={settings.keepScreenOn}
						icon={<Smartphone className="size-5" />}
						onCheckedChange={(value) => updateSettings({ keepScreenOn: value })}
						disabled={!wakeLock.isSupported}
					/>
					<Separator className="mx-3 bg-border/60" />
					<OrientationSelector
						icon={<RotateCw className="size-5" />}
						label={t("orientation")}
						options={[
							{ value: "portrait", label: t("orientationPortrait") },
							{ value: "landscape", label: t("orientationLandscape") },
							{ value: "responsive", label: t("orientationResponsive") },
						]}
						value={settings.orientationMode}
						onChange={(next) => updateSettings({ orientationMode: next })}
					/>
					<Separator className="mx-3 bg-border/60" />
					<LanguageSelector
						value={settings.language}
						onChange={(next: Language) => {
							updateSettings({ language: next })
							setLanguage(next)
						}}
					/>
				</div>

				{/* Right column — numeric inputs + metrics */}
				<div className="rounded-[2rem] border border-border/70 bg-card/70 p-3 shadow-[0_20px_60px_-32px_hsl(var(--foreground)/0.45)] backdrop-blur">
					<NumberInputRow
						label={t("weight")}
						value={settings.weightKg}
						icon={<Scale className="size-5" />}
						min={20}
						max={250}
						step={1}
						placeholder="—"
						onChange={(value) => updateSettings({ weightKg: value })}
					/>
					<Separator className="mx-3 bg-border/60" />
					<NumberInputRow
						label={t("speedAlert")}
						value={settings.speedAlertKmh > 0 ? settings.speedAlertKmh : null}
						icon={<BellRing className="size-5" />}
						min={0}
						max={200}
						step={1}
						placeholder="0"
						onChange={(value) => updateSettings({ speedAlertKmh: value ?? 0 })}
					/>
					<Separator className="mx-3 bg-border/60" />
					<div className="px-3 py-3">
						<div className="mb-4 rounded-[1.4rem] border border-border/70 bg-background/65 px-4 py-3">
							<p className="text-[0.98rem] font-medium tracking-tight text-foreground">
								{t("metricsGroup")}
							</p>
							<p className="mt-1 text-sm leading-5 text-muted-foreground/85">
								{t("metricsGroupHint")}
							</p>
						</div>
						<MetricsToggleList activeIds={activeIds} onToggle={toggle} />
					</div>
				</div>
			</div>

			{!hydrated ? (
				<p className="sr-only" aria-live="polite">
					{t("loading")}
				</p>
			) : null}
		</section>
	)
}
