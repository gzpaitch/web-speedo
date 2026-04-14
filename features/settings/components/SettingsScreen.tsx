"use client"

import {
	BellRing,
	CheckCircle2,
	Download,
	MoonStar,
	RotateCw,
	Ruler,
	Scale,
	Share,
	Smartphone,
} from "lucide-react"
import { useTranslations } from "next-intl"

import { usePWAInstall } from "@/app/MVP/usePWAInstall"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
	const pwa = usePWAInstall()

	const isDark = resolvedTheme === "dark"
	const showInstallCard = pwa.state === "available" || pwa.state === "installed"

	return (
		<section
			className={cn(
				"relative h-full min-h-dvh w-full overflow-y-auto bg-background px-6 text-foreground",
				"pt-[max(env(safe-area-inset-top),1.5rem)] pb-[max(env(safe-area-inset-bottom),1.5rem)]"
			)}
			aria-labelledby="settings-title"
		>
			<header className="relative mb-6">
				<h1
					id="settings-title"
					className="text-3xl font-semibold tracking-[-0.03em]"
				>
					{t("title")}
				</h1>
				<div className="mt-3 h-1 w-20 rounded-full bg-primary/20" />
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
								{pwa.state === "installed" ? (
									<Badge variant="secondary">
										<CheckCircle2 className="size-3.5" />
										{t("installInstalled")}
									</Badge>
								) : null}
							</div>
							<p className="mt-1 text-sm leading-5 text-muted-foreground/85">
								{pwa.isIOS
									? t("installIosDescription")
									: pwa.state === "installed"
										? t("installInstalledDescription")
										: t("installDescription")}
							</p>
							{pwa.state === "available" ? (
								pwa.isIOS ? (
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
								)
							) : null}
						</div>
					</div>
				</div>
			) : null}

			<div className="relative flex flex-col gap-5 xl:grid xl:grid-cols-2 xl:gap-6">
				{/* Left column — toggles */}
				<div className="flex flex-col py-2">
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
				</div>

				{/* Right column — numeric inputs + metrics */}
				<div className="flex flex-col py-2">
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
					<div className="py-2">
						<div className="mb-4 px-2">
							<p className="text-base font-medium tracking-tight text-foreground">
								{t("metricsGroup")}
							</p>
							<p className="mt-1 text-sm text-muted-foreground">
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
