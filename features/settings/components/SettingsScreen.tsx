"use client"

import {
	BellRing,
	Download,
	MoonStar,
	RotateCw,
	Ruler,
	Scale,
	Share,
	Smartphone,
} from "lucide-react"
import { useTranslations } from "next-intl"
import type { ReactNode } from "react"

import { usePWAInstall } from "@/app/MVP/usePWAInstall"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useActiveMetrics } from "@/features/speedometer/hooks/useActiveMetrics"
import type { Language } from "@/features/speedometer/types"
import { useWakeLock } from "@/hooks/useWakeLock"
import { useLanguage } from "@/i18n/IntlProvider"
import { cn } from "@/lib/utils"
import pkg from "@/package.json"
import { useTheme } from "@/providers/ThemeProvider"

import { useSettings } from "../hooks/useSettings"
import { LanguageSelector, OrientationSelector } from "./LanguageSelector"
import { MetricsToggleList } from "./MetricsToggleList"
import { NumberInputRow } from "./NumberInputRow"
import { ToggleRow } from "./ToggleRow"

type SettingsSectionProps = {
	title: string
	description: string
	children: ReactNode
}

function SettingsSection({
	title,
	description,
	children,
}: SettingsSectionProps) {
	return (
		<section className="rounded-[2rem] border border-border/70 bg-card/75 p-3 shadow-[0_24px_70px_-48px_hsl(var(--foreground)/0.5)] backdrop-blur">
			<div className="px-3 pt-2 pb-3">
				<p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground/80">
					{title}
				</p>
				<p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
					{description}
				</p>
			</div>
			<div className="rounded-[1.6rem] border border-border/60 bg-background/70 p-1">
				{children}
			</div>
		</section>
	)
}

export function SettingsScreen() {
	const t = useTranslations("settings")
	const { settings, updateSettings, hydrated } = useSettings()
	const { activeIds, toggle } = useActiveMetrics()
	const { resolvedTheme, setTheme } = useTheme()
	const { setLanguage } = useLanguage()
	const wakeLock = useWakeLock(settings.keepScreenOn)
	const pwa = usePWAInstall()

	const isDark = resolvedTheme === "dark"
	const showInstallCard = pwa.state === "available"

	return (
		<section
			className={cn(
				"relative h-full min-h-dvh w-full overflow-y-auto bg-background px-6 text-foreground",
				"pt-[max(env(safe-area-inset-top),2.25rem)] pb-[max(env(safe-area-inset-bottom),7rem)] sm:pt-[max(env(safe-area-inset-top),2.75rem)]"
			)}
			aria-labelledby="settings-title"
		>
			<div className="flex min-h-full flex-col">
				<div className="flex-1">
					<header className="mb-6 sm:mb-7">
						<div className="max-w-3xl">
							<h1
								id="settings-title"
								className="text-[2.1rem] font-semibold tracking-[-0.03em] sm:text-3xl lg:text-[3.25rem]"
							>
								{t("title")}
							</h1>
							<div className="mt-3 h-1 w-20 rounded-full bg-[linear-gradient(90deg,hsl(var(--primary)),hsl(var(--primary)/0.2))] lg:mt-4 lg:w-24" />
						</div>
					</header>

					{showInstallCard ? (
						<div className="relative mb-5 rounded-[2rem] border border-border/70 bg-card/80 p-4 shadow-[0_20px_60px_-32px_hsl(var(--foreground)/0.45)] backdrop-blur">
							<div className="flex items-start gap-3">
								<div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-background/75 text-primary shadow-sm">
									<Smartphone className="size-5" />
								</div>
								<div className="min-w-0 flex-1">
									<div className="flex flex-wrap items-center gap-2">
										<p className="text-[0.98rem] font-medium tracking-tight text-foreground">
											{t("installTitle")}
										</p>
									</div>
									<p className="mt-1 text-sm leading-5 text-muted-foreground/85">
										{pwa.isIOS
											? t("installIosDescription")
											: t("installDescription")}
									</p>
									{pwa.isIOS ? (
										<div className="mt-3 inline-flex min-h-12 items-center gap-2 rounded-full border border-border/70 bg-background/65 px-5 py-2 text-sm text-foreground">
											<Share className="size-4 text-primary" />
											<span>{t("installIosCta")}</span>
										</div>
									) : (
										<Button
											type="button"
											size="lg"
											className="mt-3 min-h-12 rounded-full px-6"
											onClick={() => void pwa.install()}
										>
											<Download className="size-4" />
											{t("installAction")}
										</Button>
									)}
								</div>
							</div>
						</div>
					) : null}

					<div className="relative grid gap-5 xl:grid-cols-2 xl:gap-6">
						<div className="grid gap-5">
							<SettingsSection
								title={t("appearanceSectionTitle")}
								description={t("appearanceSectionHint")}
							>
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
									onCheckedChange={(value) =>
										updateSettings({ keepScreenOn: value })
									}
									disabled={!wakeLock.isSupported}
								/>
							</SettingsSection>

							<SettingsSection
								title={t("displaySectionTitle")}
								description={t("displaySectionHint")}
							>
								<OrientationSelector
									icon={<RotateCw className="size-5" />}
									label={t("orientation")}
									options={[
										{
											value: "portrait",
											label: t("orientationPortrait"),
											icon: <Smartphone className="size-4" />,
										},
										{
											value: "landscape",
											label: t("orientationLandscape"),
											icon: <Smartphone className="size-4 -rotate-90" />,
										},
										{
											value: "responsive",
											label: t("orientationResponsive"),
											icon: <RotateCw className="size-4" />,
										},
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
							</SettingsSection>
						</div>

						<div className="grid gap-5">
							<SettingsSection
								title={t("sessionSectionTitle")}
								description={t("sessionSectionHint")}
							>
								<NumberInputRow
									label={t("weight")}
									description={t("weightHint")}
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
									description={t("speedAlertHint")}
									value={
										settings.speedAlertKmh > 0 ? settings.speedAlertKmh : null
									}
									icon={<BellRing className="size-5" />}
									min={0}
									max={200}
									step={1}
									placeholder="0"
									onChange={(value) =>
										updateSettings({ speedAlertKmh: value ?? 0 })
									}
								/>
							</SettingsSection>

							<SettingsSection
								title={t("metricsSectionTitle")}
								description={t("metricsGroupHint")}
							>
								<div className="py-2">
									<div className="mb-4 px-2">
										<p className="text-base font-medium tracking-tight text-foreground">
											{t("metricsGroup")}
										</p>
									</div>
									<MetricsToggleList activeIds={activeIds} onToggle={toggle} />
								</div>
							</SettingsSection>
						</div>
					</div>
				</div>

				<footer className="flex justify-center pt-8 pb-3">
					<div className="inline-flex min-h-11 items-center rounded-full border border-border/70 bg-card/80 px-5 text-center text-[0.76rem] font-semibold tracking-[0.28em] text-muted-foreground shadow-sm backdrop-blur">
						v{pkg.version}
					</div>
				</footer>
			</div>

			{!hydrated ? (
				<p className="sr-only" aria-live="polite">
					{t("loading")}
				</p>
			) : null}
		</section>
	)
}
