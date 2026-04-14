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
				"relative h-full min-h-dvh w-full overflow-y-auto bg-background px-6 text-foreground",
				"pt-[max(env(safe-area-inset-top),1.5rem)] pb-[max(env(safe-area-inset-bottom),1.5rem)]"
			)}
			aria-labelledby="stats-title"
		>
			<div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.14),transparent_58%)] opacity-90" />
			<div className="pointer-events-none absolute left-0 bottom-12 size-48 rounded-full bg-[hsl(var(--primary)/0.07)] blur-3xl" />

			<header className="relative mb-6">
				<h1
					id="stats-title"
					className="text-3xl font-semibold tracking-[-0.03em]"
				>
					{t("title")}
				</h1>
				<div className="mt-3 h-1 w-20 rounded-full bg-[linear-gradient(90deg,hsl(var(--primary)),hsl(var(--primary)/0.2))]" />
			</header>

			<div className="relative rounded-[2rem] border border-border/70 bg-card/70 p-4 shadow-[0_20px_60px_-32px_hsl(var(--foreground)/0.45)] backdrop-blur">
				<div className="flex flex-col gap-3 landscape:grid landscape:grid-cols-2">
					{cards.map((card) => (
						<RecordCard
							key={card.key}
							label={t(card.labelKey)}
							value={card.value}
							unit={card.unit}
							icon={card.icon}
						/>
					))}
				</div>
			</div>

			<div className="relative mt-5 mb-8 rounded-[1.6rem] border border-border/70 bg-card/65 p-3 shadow-[0_18px_45px_-30px_hsl(var(--foreground)/0.3)] backdrop-blur">
				<ResetRecordsButton onReset={reset} />
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
