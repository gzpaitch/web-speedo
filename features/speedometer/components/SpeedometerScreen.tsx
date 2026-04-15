"use client"

import { Maximize2, Minimize2, Moon, Sun } from "lucide-react"
import { useTranslations } from "next-intl"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { useSettings } from "@/features/settings/hooks/useSettings"
import { useActiveMetrics } from "@/features/speedometer/hooks/useActiveMetrics"
import { useFocusMode } from "@/features/speedometer/hooks/useFocusMode"
import { useGeolocation } from "@/features/speedometer/hooks/useGeolocation"
import { useMetrics } from "@/features/speedometer/hooks/useMetrics"
import {
	type SessionFinalSummary,
	useSession,
} from "@/features/speedometer/hooks/useSession"
import { useSessionDraft } from "@/features/speedometer/hooks/useSessionDraft"
import type { SessionDraft } from "@/features/speedometer/types"
import { formatSpeed } from "@/features/speedometer/utils/metrics"
import { mpsToKmh } from "@/features/speedometer/utils/speed"
import { cn } from "@/lib/utils"
import { useTheme } from "@/providers/ThemeProvider"

import { DigitalDisplay } from "./DigitalDisplay"
import { GpsStatus } from "./GpsStatus"
import { MetricsCarousel } from "./MetricsCarousel"
import { MetricsEditMode } from "./MetricsEditMode"
import { SessionControls } from "./SessionControls"

type Props = {
	onSessionEnd?: (summary: SessionFinalSummary) => void
	recoveryDraft?: SessionDraft | null
	onRecoveryApplied?: () => void
}

export function SpeedometerScreen({
	onSessionEnd,
	recoveryDraft = null,
	onRecoveryApplied,
}: Props) {
	const t = useTranslations("session")
	const tCommon = useTranslations("common")
	const { settings } = useSettings()
	const { activeIds, toggle, set: setMetricOrder } = useActiveMetrics()
	const { reading, status, isWatching, start } = useGeolocation()
	const { resolvedTheme, setTheme } = useTheme()
	const isDark = resolvedTheme === "dark"
	const toggleTheme = React.useCallback(() => {
		setTheme(isDark ? "light" : "dark")
	}, [isDark, setTheme])

	const session = useSession({
		weightKg: settings.weightKg,
		onSessionEnd,
	})
	const focus = useFocusMode()
	const hydrateSession = session.hydrate

	React.useEffect(() => {
		if (!recoveryDraft) {
			return
		}
		hydrateSession(recoveryDraft)
		onRecoveryApplied?.()
	}, [recoveryDraft, hydrateSession, onRecoveryApplied])

	// Start the GPS watch as soon as the screen mounts (permission is guaranteed
	// by the upstream gate).
	React.useEffect(() => {
		if (!isWatching) {
			start()
		}
	}, [isWatching, start])

	// Feed GPS readings into the session reducer. `applyReading` is stable
	// (wrapped in useCallback), so depending on it is safe.
	const applyReading = session.applyReading
	React.useEffect(() => {
		if (reading) {
			applyReading(reading)
		}
	}, [reading, applyReading])

	// Enter fullscreen automatically when the session starts running and exit
	// when it pauses or ends. We read `focus.isFocused` from a ref so the
	// effect stays keyed on the session phase alone.
	const focusRef = React.useRef(focus)
	focusRef.current = focus
	const sessionPhase = session.snapshot.state
	React.useEffect(() => {
		const f = focusRef.current
		if (sessionPhase === "RUNNING" && !f.isFocused) {
			f.enter()
		}
		if (sessionPhase !== "RUNNING" && f.isFocused) {
			f.exit()
		}
	}, [sessionPhase])

	// Draft-save the session while active.
	useSessionDraft(session.snapshot)

	const metrics = useMetrics({
		snapshot: session.snapshot,
		reading,
		units: settings.units,
		weightKg: settings.weightKg,
		activeIds,
	})

	const speedDisplay = formatSpeed(
		session.snapshot.currentSpeedMps,
		settings.units
	)
	// Use the raw m/s value converted to the display unit to avoid locale-
	// sensitive string parsing (e.g. ".replace(',','.')" breaks in some locales).
	const speedValueNumber =
		settings.units === "imperial"
			? session.snapshot.currentSpeedMps * 2.23694 // m/s → mph
			: session.snapshot.currentSpeedMps * 3.6 // m/s → km/h

	// Alert detection — fires once per threshold crossing.
	const alertThresholdKmh = settings.speedAlertKmh
	const [isAlerting, setIsAlerting] = React.useState(false)
	const wasAboveRef = React.useRef(false)
	React.useEffect(() => {
		if (!alertThresholdKmh || alertThresholdKmh <= 0) {
			wasAboveRef.current = false
			setIsAlerting(false)
			return
		}
		const currentKmh = mpsToKmh(session.snapshot.currentSpeedMps)
		const above = currentKmh >= alertThresholdKmh
		if (above && !wasAboveRef.current) {
			wasAboveRef.current = true
			setIsAlerting(true)
			if (
				typeof navigator !== "undefined" &&
				typeof navigator.vibrate === "function"
			) {
				navigator.vibrate([120, 60, 120])
			}
			window.setTimeout(() => setIsAlerting(false), 1200)
		} else if (!above) {
			wasAboveRef.current = false
		}
	}, [session.snapshot.currentSpeedMps, alertThresholdKmh])

	const dimmed =
		session.snapshot.state === "AUTO_PAUSED" ||
		session.snapshot.state === "MANUALLY_PAUSED"

	const pausedLabel =
		session.snapshot.state === "AUTO_PAUSED"
			? t("autoPaused")
			: session.snapshot.state === "MANUALLY_PAUSED"
				? t("paused")
				: null

	const onTap = React.useCallback(() => {
		if (session.snapshot.state === "RUNNING") {
			focus.toggle()
		}
	}, [session.snapshot.state, focus])

	const onTapKey = React.useCallback(
		(event: React.KeyboardEvent<HTMLElement>) => {
			if (event.key === " " || event.key === "Enter") {
				event.preventDefault()
				onTap()
			}
		},
		[onTap]
	)

	return (
		<section
			className={cn(
				"relative flex h-full min-h-dvh w-full flex-col bg-background text-foreground",
				"px-6 pt-[max(env(safe-area-inset-top),1rem)] pb-[calc(max(env(safe-area-inset-bottom),1rem)+3rem)]"
			)}
			aria-label={t("speedometerLabel")}
		>
			<div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.18),transparent_60%)] opacity-90" />
			<div className="pointer-events-none absolute right-0 bottom-12 size-52 rounded-full bg-[hsl(var(--primary)/0.07)] blur-3xl" />

			{/* Full-screen tap target for focus-mode toggling during a run.
			    Sits below interactive controls in the stacking order. */}
			{session.snapshot.state === "RUNNING" ? (
				<button
					type="button"
					onClick={onTap}
					onKeyDown={onTapKey}
					aria-label={t("toggleFocusMode")}
					className="absolute inset-0 z-0 cursor-default bg-transparent"
				/>
			) : null}
			{/* Portrait layout */}
			<div className="relative z-10 flex h-full flex-col landscape:hidden">
				<div className="flex items-center gap-2 pt-2">
					<GpsStatus status={status} />
				</div>

				{pausedLabel ? (
					<p className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
						{pausedLabel}
					</p>
				) : null}

				<div className="flex flex-1 items-center justify-center py-4">
					<div className="flex w-full items-center justify-center rounded-[2rem] border border-border/70 bg-card/65 px-4 py-8 shadow-[0_20px_60px_-32px_hsl(var(--foreground)/0.45)] backdrop-blur">
						<DigitalDisplay
							value={speedValueNumber}
							unit={speedDisplay.unit}
							dimmed={dimmed}
							alerting={isAlerting}
						/>
					</div>
				</div>

				<div className="space-y-4">
					<div className="rounded-[2rem] border border-border/70 bg-card/65 p-3 shadow-[0_20px_60px_-32px_hsl(var(--foreground)/0.3)] backdrop-blur">
						<MetricsCarousel metrics={metrics} />
					</div>
					{!focus.isFocused ? (
						<div className="flex items-center justify-center gap-3">
							<MetricsEditMode activeIds={activeIds} onToggle={toggle} onReorder={setMetricOrder} />
							<Button
								type="button"
								variant="outline"
								size="icon"
								className="size-11 rounded-full border-border/70 bg-background/80 text-muted-foreground shadow-sm backdrop-blur hover:text-foreground"
								onClick={toggleTheme}
								aria-label={tCommon("theme")}
								title={tCommon("theme")}
							>
								{isDark ? (
									<Sun className="size-5" />
								) : (
									<Moon className="size-5" />
								)}
							</Button>
							<Button
								type="button"
								variant="outline"
								size="icon"
								className="size-11 rounded-full border-border/70 bg-background/80 text-muted-foreground shadow-sm backdrop-blur hover:text-foreground"
								onClick={focus.toggle}
								aria-label={t("toggleFocusMode")}
								title={t("toggleFocusMode")}
							>
								{focus.isFocused ? (
									<Minimize2 className="size-5" />
								) : (
									<Maximize2 className="size-5" />
								)}
							</Button>
						</div>
					) : null}
				</div>

				<div className="mt-6">
					<SessionControls
						sessionState={session.snapshot.state}
						onStart={session.start}
						onPause={session.pause}
						onResume={session.resume}
						onEnd={session.end}
					/>
				</div>
			</div>

			{/* Landscape layout */}
			<div className="relative z-10 hidden h-full flex-row items-stretch gap-4 landscape:flex">
				<div className="flex flex-1 flex-col rounded-[2rem] border border-border/70 bg-card/65 p-4 shadow-[0_20px_60px_-32px_hsl(var(--foreground)/0.45)] backdrop-blur">
					<div className="flex items-center gap-2 pt-2">
						<GpsStatus status={status} />
					</div>
					<div className="flex flex-1 items-center justify-center">
						<DigitalDisplay
							value={speedValueNumber}
							unit={speedDisplay.unit}
							dimmed={dimmed}
							alerting={isAlerting}
							sizeClassName="text-[9rem] leading-none"
						/>
					</div>
				</div>
				<div className="flex w-1/2 min-h-0 flex-col gap-5 py-2">
					<div className="flex min-h-0 flex-1 rounded-[2rem] border border-border/70 bg-card/65 p-3 shadow-[0_20px_60px_-32px_hsl(var(--foreground)/0.3)] backdrop-blur">
						<MetricsCarousel metrics={metrics} className="h-full" />
					</div>
					{!focus.isFocused ? (
						<div className="flex items-center justify-center gap-3 pt-1">
							<MetricsEditMode activeIds={activeIds} onToggle={toggle} onReorder={setMetricOrder} />
							<Button
								type="button"
								variant="outline"
								size="icon"
								className="size-11 rounded-full border-border/70 bg-background/80 text-muted-foreground shadow-sm backdrop-blur hover:text-foreground"
								onClick={toggleTheme}
								aria-label={tCommon("theme")}
								title={tCommon("theme")}
							>
								{isDark ? (
									<Sun className="size-5" />
								) : (
									<Moon className="size-5" />
								)}
							</Button>
							<Button
								type="button"
								variant="outline"
								size="icon"
								className="size-11 rounded-full border-border/70 bg-background/80 text-muted-foreground shadow-sm backdrop-blur hover:text-foreground"
								onClick={focus.toggle}
								aria-label={t("toggleFocusMode")}
								title={t("toggleFocusMode")}
							>
								{focus.isFocused ? (
									<Minimize2 className="size-5" />
								) : (
									<Maximize2 className="size-5" />
								)}
							</Button>
						</div>
					) : null}
					<div className="shrink-0">
						<SessionControls
							sessionState={session.snapshot.state}
							onStart={session.start}
							onPause={session.pause}
							onResume={session.resume}
							onEnd={session.end}
						/>
					</div>
				</div>
			</div>
		</section>
	)
}
