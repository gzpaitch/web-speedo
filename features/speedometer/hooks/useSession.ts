"use client"

import * as React from "react"

import { AUTO_PAUSE_DELAY_MS, AUTO_START_SPEED_MPS } from "@/constants"
import type {
	SessionDraft,
	SessionState,
	SpeedReading,
} from "@/features/speedometer/types"
import { haversineDistanceMeters } from "@/features/speedometer/utils/haversine"
import { mpsToKmh } from "@/features/speedometer/utils/speed"
import { estimateCalories } from "@/lib/calories"

export type SessionSnapshot = {
	state: SessionState
	/** Epoch ms the session was first started (null while IDLE). */
	startedAt: number | null
	/** Cumulative movement time in ms. */
	movementMs: number
	/** Cumulative distance in meters. */
	distanceMeters: number
	/** Fastest m/s seen this session. */
	maxSpeedMps: number
	/** Cumulative elevation gain (altitude increases only). */
	elevationGainMeters: number
	/** Last altitude value seen, for elevation-gain tracking. */
	lastAltitude: number | null
	/** Latest raw speed in m/s. */
	currentSpeedMps: number
	/** Last latitude/longitude, or `null`. */
	lastLatitude: number | null
	lastLongitude: number | null
	/** Epoch ms at the last applied reading, for movement-time accounting. */
	lastTickAt: number | null
}

const INITIAL_SNAPSHOT: SessionSnapshot = {
	state: "IDLE",
	startedAt: null,
	movementMs: 0,
	distanceMeters: 0,
	maxSpeedMps: 0,
	elevationGainMeters: 0,
	lastAltitude: null,
	currentSpeedMps: 0,
	lastLatitude: null,
	lastLongitude: null,
	lastTickAt: null,
}

type ReadingAction = {
	type: "reading"
	reading: SpeedReading
	now: number
}
type Action =
	| ReadingAction
	| { type: "manualPause"; now: number }
	| { type: "autoPause"; now: number }
	| { type: "manualResume"; now: number }
	| { type: "end" }
	| { type: "hydrate"; draft: SessionDraft }

function handleReading(
	state: SessionSnapshot,
	action: ReadingAction
): SessionSnapshot {
	const { reading, now } = action
	const speed = reading.speedMps ?? 0

	let {
		state: phase,
		startedAt,
		movementMs,
		distanceMeters,
		maxSpeedMps,
		elevationGainMeters,
		lastAltitude,
		lastLatitude,
		lastLongitude,
		lastTickAt,
	} = state

	// Max speed is always tracked.
	if (speed > maxSpeedMps) {
		maxSpeedMps = speed
	}

	// Elevation gain.
	if (reading.altitude !== null) {
		if (lastAltitude !== null && reading.altitude > lastAltitude) {
			elevationGainMeters += reading.altitude - lastAltitude
		}
		lastAltitude = reading.altitude
	}

	// Phase transitions.
	if (phase === "IDLE") {
		if (speed >= AUTO_START_SPEED_MPS) {
			phase = "RUNNING"
			startedAt = now
			lastTickAt = now
			lastLatitude = reading.latitude
			lastLongitude = reading.longitude
		}
	} else if (phase === "RUNNING") {
		const prevTick = lastTickAt ?? now
		const dt = Math.max(0, now - prevTick)

		if (speed >= AUTO_START_SPEED_MPS) {
			movementMs += dt
			// Distance integration.
			if (lastLatitude !== null && lastLongitude !== null) {
				const distance = haversineDistanceMeters(
					lastLatitude,
					lastLongitude,
					reading.latitude,
					reading.longitude
				)
				if (Number.isFinite(distance) && distance >= 0) {
					distanceMeters += distance
				}
			}
		}

		lastLatitude = reading.latitude
		lastLongitude = reading.longitude
		lastTickAt = now
	} else if (phase === "AUTO_PAUSED") {
		if (speed >= AUTO_START_SPEED_MPS) {
			phase = "RUNNING"
		}
		lastLatitude = reading.latitude
		lastLongitude = reading.longitude
		lastTickAt = now
	} else {
		// MANUALLY_PAUSED — keep coords fresh, no accumulation.
		lastLatitude = reading.latitude
		lastLongitude = reading.longitude
		lastTickAt = now
	}

	return {
		state: phase,
		startedAt,
		movementMs,
		distanceMeters,
		maxSpeedMps,
		elevationGainMeters,
		lastAltitude,
		currentSpeedMps: speed,
		lastLatitude,
		lastLongitude,
		lastTickAt,
	}
}

function reducer(state: SessionSnapshot, action: Action): SessionSnapshot {
	switch (action.type) {
		case "reading":
			return handleReading(state, action)

		case "manualPause":
			if (state.state === "IDLE") {
				return state
			}
			return { ...state, state: "MANUALLY_PAUSED", lastTickAt: action.now }

		case "autoPause":
			if (state.state !== "RUNNING") {
				return state
			}
			return { ...state, state: "AUTO_PAUSED", lastTickAt: action.now }

		case "manualResume":
			if (state.state === "MANUALLY_PAUSED" || state.state === "AUTO_PAUSED") {
				return { ...state, state: "RUNNING", lastTickAt: action.now }
			}
			return state

		case "end":
			return { ...INITIAL_SNAPSHOT }

		case "hydrate": {
			const { draft } = action
			return {
				...INITIAL_SNAPSHOT,
				state: "MANUALLY_PAUSED",
				startedAt: draft.startedAt,
				movementMs: draft.movementMs,
				distanceMeters: draft.distanceMeters,
				maxSpeedMps: draft.maxSpeedMps,
				elevationGainMeters: draft.elevationGainMeters,
				lastAltitude: draft.lastAltitude,
			}
		}

		default:
			return state
	}
}

export type SessionFinalSummary = {
	snapshot: SessionSnapshot
	/** Final average speed in m/s (distance ÷ movementMs). */
	averageSpeedMps: number
	/** Estimated calories, or `null` if no weight configured. */
	calories: number | null
}

export type SessionHook = {
	snapshot: SessionSnapshot
	applyReading: (reading: SpeedReading) => void
	pause: () => void
	resume: () => void
	end: () => SessionFinalSummary | null
	hydrate: (draft: SessionDraft) => void
	reset: () => void
}

type Options = {
	weightKg?: number | null
	onSessionEnd?: (summary: SessionFinalSummary) => void
}

/**
 * Session state machine (PRD §2 Speedometer).
 *
 * State graph:
 *   IDLE → RUNNING → AUTO_PAUSED ↔ RUNNING → IDLE
 *                  ↘ MANUALLY_PAUSED ↗
 *
 * Transitions:
 *  - Auto-start when speed ≥ AUTO_START_SPEED_MPS (first time).
 *  - Auto-pause after AUTO_PAUSE_DELAY_MS of continuous ~0 speed.
 *  - Manual pause/resume via the UI buttons.
 *  - `end()` returns a final summary and resets to IDLE.
 */
export function useSession(options: Options = {}): SessionHook {
	const { weightKg, onSessionEnd } = options
	const [snapshot, dispatch] = React.useReducer(reducer, INITIAL_SNAPSHOT)
	const snapshotRef = React.useRef(snapshot)
	snapshotRef.current = snapshot

	const autoPauseTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
		null
	)

	const clearAutoPauseTimer = React.useCallback(() => {
		if (autoPauseTimerRef.current) {
			clearTimeout(autoPauseTimerRef.current)
			autoPauseTimerRef.current = null
		}
	}, [])

	const applyReading = React.useCallback(
		(reading: SpeedReading) => {
			const now = Date.now()
			dispatch({ type: "reading", reading, now })

			const speed = reading.speedMps ?? 0
			const phase = snapshotRef.current.state

			if (speed >= AUTO_START_SPEED_MPS) {
				clearAutoPauseTimer()
			} else if (phase === "RUNNING" && !autoPauseTimerRef.current) {
				autoPauseTimerRef.current = setTimeout(() => {
					autoPauseTimerRef.current = null
					dispatch({ type: "autoPause", now: Date.now() })
				}, AUTO_PAUSE_DELAY_MS)
			}
		},
		[clearAutoPauseTimer]
	)

	const pause = React.useCallback(() => {
		clearAutoPauseTimer()
		dispatch({ type: "manualPause", now: Date.now() })
	}, [clearAutoPauseTimer])

	const resume = React.useCallback(() => {
		clearAutoPauseTimer()
		dispatch({ type: "manualResume", now: Date.now() })
	}, [clearAutoPauseTimer])

	const end = React.useCallback((): SessionFinalSummary | null => {
		clearAutoPauseTimer()
		const final = snapshotRef.current
		if (final.state === "IDLE" || !final.startedAt) {
			dispatch({ type: "end" })
			return null
		}

		const averageSpeedMps =
			final.movementMs > 0
				? final.distanceMeters / (final.movementMs / 1000)
				: 0
		const calories = estimateCalories(weightKg, final.movementMs)

		const summary: SessionFinalSummary = {
			snapshot: final,
			averageSpeedMps,
			calories,
		}
		onSessionEnd?.(summary)
		dispatch({ type: "end" })
		return summary
	}, [clearAutoPauseTimer, onSessionEnd, weightKg])

	const hydrate = React.useCallback((draft: SessionDraft) => {
		dispatch({ type: "hydrate", draft })
	}, [])

	const reset = React.useCallback(() => {
		clearAutoPauseTimer()
		dispatch({ type: "end" })
	}, [clearAutoPauseTimer])

	React.useEffect(() => {
		return clearAutoPauseTimer
	}, [clearAutoPauseTimer])

	return { snapshot, applyReading, pause, resume, end, hydrate, reset }
}

/** Compute average speed (m/s) live from a snapshot. */
export function averageSpeedMpsFromSnapshot(snapshot: SessionSnapshot): number {
	if (snapshot.movementMs <= 0) {
		return 0
	}
	return snapshot.distanceMeters / (snapshot.movementMs / 1000)
}

export function maxSpeedKmhFromSnapshot(snapshot: SessionSnapshot): number {
	return mpsToKmh(snapshot.maxSpeedMps)
}
