"use client"

import * as React from "react"
import {
	averageSpeedMpsFromSnapshot,
	type SessionSnapshot,
} from "@/features/speedometer/hooks/useSession"
import type {
	MetricId,
	SessionState,
	SpeedReading,
	Units,
} from "@/features/speedometer/types"
import {
	formatAltitude,
	formatCalories,
	formatClockTime,
	formatCoords,
	formatDistance,
	formatDuration,
	formatElevationGain,
	formatSpeed,
} from "@/features/speedometer/utils/metrics"
import { estimateCalories } from "@/lib/calories"

export type MetricValue = {
	id: MetricId
	value: string
	unit: string
}

type Options = {
	snapshot: SessionSnapshot
	reading: SpeedReading | null
	units: Units
	weightKg: number | null
	sessionState: SessionState
	activeIds: readonly MetricId[]
}

/**
 * Derives display values for every metric the user can enable.
 *
 * Returns only the metrics currently active, in the order configured by the
 * user, so the carousel can render them directly.
 */
export function useMetrics({
	snapshot,
	reading,
	units,
	weightKg,
	sessionState: _sessionState,
	activeIds,
}: Options): MetricValue[] {
	const [clockTick, setClockTick] = React.useState(() => Date.now())

	// Tick the clock every second so the `currentTime` metric updates.
	React.useEffect(() => {
		if (!activeIds.includes("currentTime")) {
			return
		}
		const id = setInterval(() => setClockTick(Date.now()), 1_000)
		return () => clearInterval(id)
	}, [activeIds])

	return React.useMemo(() => {
		const avgMps = averageSpeedMpsFromSnapshot(snapshot)
		const maxMps = snapshot.maxSpeedMps
		const totalMs = snapshot.startedAt ? Date.now() - snapshot.startedAt : 0
		const calories = estimateCalories(weightKg, snapshot.movementMs)

		const byId: Record<MetricId, MetricValue> = {
			maxSpeed: { id: "maxSpeed", ...formatSpeed(maxMps, units) },
			avgSpeed: { id: "avgSpeed", ...formatSpeed(avgMps, units) },
			movementTime: {
				id: "movementTime",
				value: formatDuration(snapshot.movementMs),
				unit: "",
			},
			totalTime: {
				id: "totalTime",
				value: formatDuration(totalMs),
				unit: "",
			},
			currentTime: {
				id: "currentTime",
				value: formatClockTime(clockTick),
				unit: "",
			},
			distance: {
				id: "distance",
				...formatDistance(snapshot.distanceMeters, units),
			},
			altitude: {
				id: "altitude",
				...formatAltitude(reading?.altitude ?? null),
			},
			elevationGain: {
				id: "elevationGain",
				...formatElevationGain(snapshot.elevationGainMeters),
			},
			calories: { id: "calories", ...formatCalories(calories) },
			coords: {
				id: "coords",
				...formatCoords(reading?.latitude ?? null, reading?.longitude ?? null),
			},
		}

		return activeIds.map((id) => byId[id])
	}, [snapshot, reading, units, weightKg, activeIds, clockTick])
}
