/**
 * Typed wrappers around `localStorage` for Speedo.
 *
 * All functions are SSR-safe — they no-op or return defaults when `window`
 * is undefined. Reads tolerate malformed JSON by resetting to defaults.
 */

import { STORAGE_KEYS } from "@/constants"
import {
	ALL_METRIC_IDS,
	type AppSettings,
	DEFAULT_ACTIVE_METRICS,
	type MetricId,
	type Records,
	type SessionDraft,
} from "@/features/speedometer/types"

/* -------------------------------------------------------------------------- */
/* Defaults                                                                   */
/* -------------------------------------------------------------------------- */

export const DEFAULT_SETTINGS: AppSettings = {
	units: "metric",
	language: "en",
	keepScreenOn: false,
	weightKg: null,
	speedAlertKmh: 0,
	activeMetrics: [...DEFAULT_ACTIVE_METRICS],
}

export const DEFAULT_RECORDS: Records = {
	maxSpeedKmh: null,
	longestDistanceMeters: null,
	longestMovementMs: null,
	highestCalories: null,
	lastRecordAt: null,
}

/* -------------------------------------------------------------------------- */
/* Low-level helpers                                                          */
/* -------------------------------------------------------------------------- */

function isBrowser(): boolean {
	return typeof window !== "undefined" && typeof localStorage !== "undefined"
}

function readJson<T>(key: string, fallback: T): T {
	if (!isBrowser()) {
		return fallback
	}

	try {
		const raw = localStorage.getItem(key)
		if (raw === null) {
			return fallback
		}
		return JSON.parse(raw) as T
	} catch {
		return fallback
	}
}

function writeJson<T>(key: string, value: T): void {
	if (!isBrowser()) {
		return
	}

	try {
		localStorage.setItem(key, JSON.stringify(value))
	} catch {
		// Quota exceeded or storage disabled — silently ignore.
	}
}

function removeKey(key: string): void {
	if (!isBrowser()) {
		return
	}

	try {
		localStorage.removeItem(key)
	} catch {
		// ignore
	}
}

/* -------------------------------------------------------------------------- */
/* Settings                                                                   */
/* -------------------------------------------------------------------------- */

function sanitizeMetrics(value: unknown): MetricId[] {
	if (!Array.isArray(value)) {
		return [...DEFAULT_ACTIVE_METRICS]
	}

	const allowed = new Set<MetricId>(ALL_METRIC_IDS)
	const seen = new Set<MetricId>()
	const out: MetricId[] = []

	for (const item of value) {
		if (typeof item === "string" && allowed.has(item as MetricId)) {
			const id = item as MetricId
			if (!seen.has(id)) {
				seen.add(id)
				out.push(id)
			}
		}
	}

	return out
}

function sanitizeSettings(raw: unknown): AppSettings {
	if (!raw || typeof raw !== "object") {
		return { ...DEFAULT_SETTINGS }
	}

	const partial = raw as Partial<AppSettings>

	return {
		units: partial.units === "imperial" ? "imperial" : "metric",
		language: partial.language === "pt" ? "pt" : "en",
		keepScreenOn: Boolean(partial.keepScreenOn),
		weightKg:
			typeof partial.weightKg === "number" && partial.weightKg > 0
				? partial.weightKg
				: null,
		speedAlertKmh:
			typeof partial.speedAlertKmh === "number" && partial.speedAlertKmh >= 0
				? partial.speedAlertKmh
				: 0,
		activeMetrics: sanitizeMetrics(partial.activeMetrics),
	}
}

export function getSettings(): AppSettings {
	return sanitizeSettings(readJson(STORAGE_KEYS.settings, DEFAULT_SETTINGS))
}

export function saveSettings(settings: AppSettings): void {
	writeJson(STORAGE_KEYS.settings, settings)
}

/* -------------------------------------------------------------------------- */
/* Records                                                                    */
/* -------------------------------------------------------------------------- */

function sanitizeRecords(raw: unknown): Records {
	if (!raw || typeof raw !== "object") {
		return { ...DEFAULT_RECORDS }
	}

	const partial = raw as Partial<Records>
	const positiveOrNull = (v: unknown): number | null =>
		typeof v === "number" && Number.isFinite(v) && v > 0 ? v : null

	return {
		maxSpeedKmh: positiveOrNull(partial.maxSpeedKmh),
		longestDistanceMeters: positiveOrNull(partial.longestDistanceMeters),
		longestMovementMs: positiveOrNull(partial.longestMovementMs),
		highestCalories: positiveOrNull(partial.highestCalories),
		lastRecordAt:
			typeof partial.lastRecordAt === "number" && partial.lastRecordAt > 0
				? partial.lastRecordAt
				: null,
	}
}

export function getRecords(): Records {
	return sanitizeRecords(readJson(STORAGE_KEYS.records, DEFAULT_RECORDS))
}

export function saveRecords(records: Records): void {
	writeJson(STORAGE_KEYS.records, records)
}

export function clearRecords(): void {
	writeJson(STORAGE_KEYS.records, DEFAULT_RECORDS)
}

/* -------------------------------------------------------------------------- */
/* Session draft                                                              */
/* -------------------------------------------------------------------------- */

export function getSessionDraft(): SessionDraft | null {
	const raw = readJson<SessionDraft | null>(STORAGE_KEYS.sessionDraft, null)
	if (!raw || typeof raw !== "object") {
		return null
	}
	return raw
}

export function saveSessionDraft(draft: SessionDraft): void {
	writeJson(STORAGE_KEYS.sessionDraft, draft)
}

export function clearSessionDraft(): void {
	removeKey(STORAGE_KEYS.sessionDraft)
}

/* -------------------------------------------------------------------------- */
/* GPS permission flag                                                        */
/* -------------------------------------------------------------------------- */

export function getGpsGrantedFlag(): boolean {
	if (!isBrowser()) {
		return false
	}
	return localStorage.getItem(STORAGE_KEYS.gpsGranted) === "1"
}

export function setGpsGrantedFlag(granted: boolean): void {
	if (!isBrowser()) {
		return
	}
	if (granted) {
		localStorage.setItem(STORAGE_KEYS.gpsGranted, "1")
	} else {
		localStorage.removeItem(STORAGE_KEYS.gpsGranted)
	}
}
