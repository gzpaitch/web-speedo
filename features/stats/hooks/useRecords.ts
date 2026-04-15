"use client"

import * as React from "react"
import type { SessionFinalSummary } from "@/features/speedometer/hooks/useSession"
import type { Records } from "@/features/speedometer/types"
import { mpsToKmh } from "@/features/speedometer/utils/speed"
import {
	clearRecords,
	DEFAULT_RECORDS,
	getRecords,
	saveRecords,
} from "@/lib/storage"

type RecordsHook = {
	records: Records
	/** Merge-update the stored records with any new bests from a finished session. */
	applySession: (summary: SessionFinalSummary) => void
	reset: () => void
	hydrated: boolean
}

function mergeRecords(
	prev: Records,
	summary: SessionFinalSummary
): { next: Records; didUpdate: boolean } {
	const { snapshot, calories } = summary
	const maxSpeedKmh = mpsToKmh(snapshot.maxSpeedMps)
	const distance = snapshot.distanceMeters
	const movement = snapshot.movementMs

	let didUpdate = false
	const next: Records = { ...prev }

	if (
		maxSpeedKmh > 0 &&
		(prev.maxSpeedKmh === null || maxSpeedKmh > prev.maxSpeedKmh)
	) {
		next.maxSpeedKmh = maxSpeedKmh
		didUpdate = true
	}
	if (
		distance > 0 &&
		(prev.longestDistanceMeters === null ||
			distance > prev.longestDistanceMeters)
	) {
		next.longestDistanceMeters = distance
		didUpdate = true
	}
	if (
		movement > 0 &&
		(prev.longestMovementMs === null || movement > prev.longestMovementMs)
	) {
		next.longestMovementMs = movement
		didUpdate = true
	}
	if (
		calories !== null &&
		calories > 0 &&
		(prev.highestCalories === null || calories > prev.highestCalories)
	) {
		next.highestCalories = calories
		didUpdate = true
	}

	if (didUpdate) {
		next.lastRecordAt = Date.now()
	}

	return { next, didUpdate }
}

export function useRecords(): RecordsHook {
	const [records, setRecords] = React.useState<Records>(DEFAULT_RECORDS)
	const [hydrated, setHydrated] = React.useState(false)

	React.useEffect(() => {
		setRecords(getRecords())
		setHydrated(true)
	}, [])

	const applySession = React.useCallback((summary: SessionFinalSummary) => {
		setRecords((prev) => {
			const { next, didUpdate } = mergeRecords(prev, summary)
			if (didUpdate) {
				saveRecords(next)
				return next
			}
			return prev
		})
	}, [])

	const reset = React.useCallback(() => {
		clearRecords()
		setRecords(DEFAULT_RECORDS)
	}, [])

	return React.useMemo(
		() => ({ records, applySession, reset, hydrated }),
		[records, applySession, reset, hydrated]
	)
}
