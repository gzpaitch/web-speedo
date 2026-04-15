"use client"

import { Flame, Gauge, Route, Timer, Trophy } from "lucide-react"
import { useTranslations } from "next-intl"
import * as React from "react"

import { useSettings } from "@/features/settings/hooks/useSettings"
import type { Records } from "@/features/speedometer/types"
import {
	formatDistance,
	formatDuration,
	formatSpeed,
} from "@/features/speedometer/utils/metrics"
import { kmhToMps } from "@/features/speedometer/utils/speed"
import { cn } from "@/lib/utils"

import { useRecords } from "../hooks/useRecords"
import { RecordCard } from "./RecordCard"
import { ResetRecordsButton } from "./ResetRecordsButton"

type StatsScreenProps = {
	/** Imperative ref so the shell can push finished sessions in. */
	onHookReady?: (hook: ReturnType<typeof useRecords>) => void
}

export function StatsScreen({ onHookReady }: StatsScreenProps) {
	const t = useTranslations("stats")
	const tCommon = useTranslations("common")
	const { settings } = useSettings()
	const recordsHook = useRecords()
	const { records, reset } = recordsHook
	const recordsHookRef = React.useRef(recordsHook)

	// Expose the hook API to the shell once — `applySession` and `reset` are
	// stable callbacks; there's no need to re-call on every records update.
	const onHookReadyRef = React.useRef(onHookReady)
	onHookReadyRef.current = onHookReady
	React.useEffect(() => {
		onHookReadyRef.current?.(recordsHookRef.current)
	}, [])

	const cards = buildCards(records, settings.units, tCommon("notAvailable"))

	return (
		<section
			className={cn(
				"relative h-full min-h-dvh w-full overflow-y-auto bg-background px-5 text-foreground sm:px-6 lg:px-10 xl:px-12",
				"pt-[max(env(safe-area-inset-top),2.25rem)] pb-[max(env(safe-area-inset-bottom),1.75rem)] sm:pt-[max(env(safe-area-inset-top),2.75rem)] sm:pb-[max(env(safe-area-inset-bottom),2.25rem)]"
			)}
			aria-labelledby="stats-title"
		>
			<div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.14),transparent_58%)] opacity-90" />
			<div className="pointer-events-none absolute left-0 bottom-12 size-48 rounded-full bg-[hsl(var(--primary)/0.07)] blur-3xl" />

			<div className="relative mx-auto flex min-h-full w-full max-w-6xl flex-col">
				<header className="mb-6 sm:mb-7 lg:mb-9">
					<div className="max-w-3xl">
						<h1
							id="stats-title"
							className="text-[2.1rem] font-semibold tracking-[-0.03em] sm:text-3xl lg:text-[3.25rem]"
						>
							{t("title")}
						</h1>
						<div className="mt-3 h-1 w-20 rounded-full bg-[linear-gradient(90deg,hsl(var(--primary)),hsl(var(--primary)/0.2))] lg:mt-4 lg:w-24" />
					</div>
				</header>

				<div className="rounded-[2rem] border border-border/70 bg-card/70 p-4 shadow-[0_20px_60px_-32px_hsl(var(--foreground)/0.45)] backdrop-blur sm:p-5 lg:rounded-[2.25rem] lg:p-6">
					<div className="grid gap-4 sm:gap-5 md:grid-cols-2">
						{cards.map((card, index) => (
							<RecordCard
								key={card.key}
								label={t(card.labelKey)}
								value={card.value}
								unit={card.unit}
								icon={card.icon}
								className={cn(index === cards.length - 1 && "md:col-span-2")}
								valueClassName={cn(
									card.key === "lastRecord" &&
										"text-[1.4rem] sm:text-[1.6rem] lg:text-[1.8rem]"
								)}
							/>
						))}
					</div>
				</div>

				<div className="mt-5 mb-7 rounded-[1.6rem] border border-border/70 bg-card/65 p-3 shadow-[0_18px_45px_-30px_hsl(var(--foreground)/0.3)] backdrop-blur sm:mt-6 sm:mb-8 sm:p-3.5 lg:mt-7">
					<div className="sm:flex sm:justify-end">
						<div className="sm:w-full sm:max-w-sm">
							<ResetRecordsButton onReset={reset} />
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}

type CardDescriptor = {
	key: string
	labelKey:
		| "maxSpeed"
		| "longestDistance"
		| "longestMovement"
		| "highestCalories"
		| "lastRecord"
	value: string
	unit?: string
	icon: typeof Gauge
}

function buildCards(
	records: Records,
	units: "metric" | "imperial",
	placeholder: string
): CardDescriptor[] {
	const maxSpeedCard = (() => {
		if (records.maxSpeedKmh === null) {
			return { value: placeholder, unit: undefined }
		}
		const { value, unit } = formatSpeed(kmhToMps(records.maxSpeedKmh), units)
		return { value, unit }
	})()

	const distanceCard = (() => {
		if (records.longestDistanceMeters === null) {
			return { value: placeholder, unit: undefined }
		}
		const { value, unit } = formatDistance(records.longestDistanceMeters, units)
		return { value, unit }
	})()

	const movementCard =
		records.longestMovementMs === null
			? { value: placeholder, unit: undefined }
			: { value: formatDuration(records.longestMovementMs), unit: undefined }

	const caloriesCard =
		records.highestCalories === null
			? { value: placeholder, unit: undefined }
			: { value: Math.round(records.highestCalories).toString(), unit: "kcal" }

	const lastRecordCard = (() => {
		if (records.lastRecordAt === null) {
			return { value: placeholder, unit: undefined }
		}
		return {
			value: new Intl.DateTimeFormat(undefined, {
				dateStyle: "medium",
			}).format(new Date(records.lastRecordAt)),
			unit: undefined,
		}
	})()

	return [
		{
			key: "maxSpeed",
			labelKey: "maxSpeed",
			value: maxSpeedCard.value,
			unit: maxSpeedCard.unit,
			icon: Gauge,
		},
		{
			key: "longestDistance",
			labelKey: "longestDistance",
			value: distanceCard.value,
			unit: distanceCard.unit,
			icon: Route,
		},
		{
			key: "longestMovement",
			labelKey: "longestMovement",
			value: movementCard.value,
			unit: movementCard.unit,
			icon: Timer,
		},
		{
			key: "highestCalories",
			labelKey: "highestCalories",
			value: caloriesCard.value,
			unit: caloriesCard.unit,
			icon: Flame,
		},
		{
			key: "lastRecord",
			labelKey: "lastRecord",
			value: lastRecordCard.value,
			unit: lastRecordCard.unit,
			icon: Trophy,
		},
	]
}
