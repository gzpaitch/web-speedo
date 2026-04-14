"use client"

import { useTranslations } from "next-intl"

import { Separator } from "@/components/ui/separator"
import { useActiveMetrics } from "@/features/speedometer/hooks/useActiveMetrics"
import type { Language } from "@/features/speedometer/types"
import { useWakeLock } from "@/hooks/useWakeLock"
import { useLanguage } from "@/i18n/IntlProvider"
import { cn } from "@/lib/utils"
import { useTheme } from "@/providers/ThemeProvider"

import { useSettings } from "../hooks/useSettings"
import { LanguageSelector } from "./LanguageSelector"
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
				"h-full min-h-dvh w-full overflow-y-auto bg-background px-6 text-foreground",
				"pt-[max(env(safe-area-inset-top),1.5rem)] pb-[max(env(safe-area-inset-bottom),1.5rem)]"
			)}
			aria-labelledby="settings-title"
		>
			<header className="mb-4">
				<h1
					id="settings-title"
					className="text-2xl font-semibold tracking-tight"
				>
					{t("title")}
				</h1>
			</header>

			<div className="flex flex-col landscape:grid landscape:grid-cols-2 landscape:gap-6">
				{/* Left column — toggles */}
				<div className="flex flex-col">
					<ToggleRow
						label={t("theme")}
						description={t("themeHint")}
						checked={isDark}
						onCheckedChange={(value) => setTheme(value ? "dark" : "light")}
					/>
					<Separator />
					<ToggleRow
						label={t("units")}
						description={
							settings.units === "metric"
								? t("unitsMetric")
								: t("unitsImperial")
						}
						checked={settings.units === "imperial"}
						onCheckedChange={(value) =>
							updateSettings({ units: value ? "imperial" : "metric" })
						}
					/>
					<Separator />
					<ToggleRow
						label={t("keepScreenOn")}
						description={
							wakeLock.isSupported
								? t("keepScreenOnHint")
								: t("wakeLockUnsupported")
						}
						checked={settings.keepScreenOn}
						onCheckedChange={(value) => updateSettings({ keepScreenOn: value })}
						disabled={!wakeLock.isSupported}
					/>
					<Separator />
					<LanguageSelector
						value={settings.language}
						onChange={(next: Language) => {
							updateSettings({ language: next })
							setLanguage(next)
						}}
					/>
				</div>

				{/* Right column — numeric inputs + metrics */}
				<div className="flex flex-col">
					<NumberInputRow
						label={t("weight")}
						description={t("weightHint")}
						value={settings.weightKg}
						min={20}
						max={250}
						step={1}
						placeholder="—"
						onChange={(value) => updateSettings({ weightKg: value })}
					/>
					<Separator />
					<NumberInputRow
						label={t("speedAlert")}
						description={t("speedAlertHint")}
						value={settings.speedAlertKmh > 0 ? settings.speedAlertKmh : null}
						min={0}
						max={200}
						step={1}
						placeholder="0"
						onChange={(value) => updateSettings({ speedAlertKmh: value ?? 0 })}
					/>
					<Separator />
					<div className="py-2">
						<p className="text-base text-foreground">{t("metricsGroup")}</p>
						<p className="mb-1 text-sm text-muted-foreground opacity-80">
							{t("metricsGroupHint")}
						</p>
						<MetricsToggleList activeIds={activeIds} onToggle={toggle} />
					</div>
				</div>
			</div>

			{!hydrated ? (
				<p className="sr-only" aria-live="polite">
					loading settings
				</p>
			) : null}
		</section>
	)
}
