/** Core domain types shared across the speedometer feature. */

export type SessionState =
	| "IDLE"
	| "RUNNING"
	| "AUTO_PAUSED"
	| "MANUALLY_PAUSED"

export type GpsStatus = "waiting" | "weak" | "ok"

export type Units = "metric" | "imperial"

export type Language = "en" | "pt"

export type ThemeMode = "system" | "light" | "dark"

export type OrientationMode = "portrait" | "landscape" | "responsive"

/** All available metric ids the user can toggle in the UI. */
export type MetricId =
	| "maxSpeed"
	| "avgSpeed"
	| "movementTime"
	| "totalTime"
	| "currentTime"
	| "distance"
	| "altitude"
	| "elevationGain"
	| "calories"
	| "coords"

export const ALL_METRIC_IDS: readonly MetricId[] = [
	"maxSpeed",
	"avgSpeed",
	"movementTime",
	"totalTime",
	"currentTime",
	"distance",
	"altitude",
	"elevationGain",
	"calories",
	"coords",
] as const

export const DEFAULT_ACTIVE_METRICS: readonly MetricId[] = [
	"maxSpeed",
	"avgSpeed",
] as const

/** A single GPS reading. */
export type SpeedReading = {
	/** Speed in m/s. `null` when unavailable. */
	speedMps: number | null
	latitude: number
	longitude: number
	altitude: number | null
	accuracy: number | null
	heading: number | null
	/** Epoch ms. */
	timestamp: number
}

/** User settings persisted to `localStorage`. */
export type AppSettings = {
	units: Units
	language: Language
	orientationMode: OrientationMode
	keepScreenOn: boolean
	/** kg. `null` when not configured. */
	weightKg: number | null
	/** km/h threshold. `0` disables the alert. */
	speedAlertKmh: number
	/** Ordered list of metric ids currently active in the carousel. */
	activeMetrics: MetricId[]
}

/** Global historical records, updated on session end. */
export type Records = {
	maxSpeedKmh: number | null
	longestDistanceMeters: number | null
	longestMovementMs: number | null
	highestCalories: number | null
	/** Epoch ms of the most recent session that updated any record. */
	lastRecordAt: number | null
}

/** Draft of an active session, serialized every 5 s. */
export type SessionDraft = {
	state: SessionState
	startedAt: number
	/** Epoch ms the session was last updated. */
	updatedAt: number
	/** Accumulated movement time in ms. */
	movementMs: number
	/** Accumulated distance in meters. */
	distanceMeters: number
	maxSpeedMps: number
	/** Cumulative elevation gain in meters. */
	elevationGainMeters: number
	/** Last known altitude in meters. */
	lastAltitude: number | null
}
