/**
 * Application-wide constants per PRD v1.0.
 *
 * Time values are in milliseconds unless suffixed with `_SEC`.
 */

/** Auto-pause threshold: session pauses after this many ms at ~0 speed. */
export const AUTO_PAUSE_DELAY_MS = 10_000

/** Interval between `speedo:session_draft` writes while a session is active. */
export const SESSION_DRAFT_INTERVAL_MS = 5_000

/** Speed above which the session auto-starts (m/s). ≈ 1.8 km/h. */
export const AUTO_START_SPEED_MPS = 0.5

/** Speed below which we consider the user stopped (m/s). */
export const STOPPED_SPEED_MPS = 0.5

/** MET value used for calorie estimation (moderate cycling ≈ 20 km/h). */
export const MET_CYCLING = 8.0

/** localStorage keys. */
export const STORAGE_KEYS = {
	settings: "speedo:settings",
	records: "speedo:records",
	sessionDraft: "speedo:session_draft",
	gpsGranted: "speedo:gps_granted",
} as const

/** GPS accuracy thresholds (meters). */
export const GPS_ACCURACY = {
	/** Considered OK signal at or below this accuracy. */
	okMax: 20,
	/** Considered weak signal between `okMax` and `weakMax`. */
	weakMax: 50,
} as const
