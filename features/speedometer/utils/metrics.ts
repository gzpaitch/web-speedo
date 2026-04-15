import type { Units } from "@/features/speedometer/types"

import { metersToKilometers, metersToMiles, mpsToKmh, mpsToMph } from "./speed"

/**
 * Format a speed value (m/s) for display. Returns value + unit label as
 * separate strings so the UI can style them independently.
 */
export function formatSpeed(
	mps: number | null,
	units: Units
): { value: string; unit: string } {
	const unit = units === "metric" ? "km/h" : "mph"
	if (mps === null || !Number.isFinite(mps) || mps < 0) {
		return { value: "0", unit }
	}
	const converted = units === "metric" ? mpsToKmh(mps) : mpsToMph(mps)
	const maximumFractionDigits = converted >= 10 ? 0 : 1
	return {
		value: converted.toLocaleString("en-US", {
			maximumFractionDigits,
			minimumFractionDigits: maximumFractionDigits,
		}),
		unit,
	}
}

export function formatDistance(
	meters: number | null,
	units: Units
): { value: string; unit: string } {
	if (meters === null || !Number.isFinite(meters) || meters < 0) {
		return { value: "0", unit: units === "metric" ? "km" : "mi" }
	}

	if (units === "metric") {
		if (meters < 1000) {
			return {
				value: Math.round(meters).toString(),
				unit: "m",
			}
		}
		const km = metersToKilometers(meters)
		return {
			value: km.toLocaleString("en-US", {
				maximumFractionDigits: km >= 10 ? 1 : 2,
				minimumFractionDigits: km >= 10 ? 1 : 2,
			}),
			unit: "km",
		}
	}

	const mi = metersToMiles(meters)
	return {
		value: mi.toLocaleString("en-US", {
			maximumFractionDigits: mi >= 10 ? 1 : 2,
			minimumFractionDigits: mi >= 10 ? 1 : 2,
		}),
		unit: "mi",
	}
}

/** Format a duration in ms as `HH:MM:SS` (or `MM:SS` when under 1 hour). */
export function formatDuration(ms: number | null): string {
	if (ms === null || !Number.isFinite(ms) || ms < 0) {
		return "00:00"
	}
	const totalSeconds = Math.floor(ms / 1000)
	const hours = Math.floor(totalSeconds / 3600)
	const minutes = Math.floor((totalSeconds % 3600) / 60)
	const seconds = totalSeconds % 60
	const pad = (n: number) => n.toString().padStart(2, "0")
	if (hours > 0) {
		return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
	}
	return `${pad(minutes)}:${pad(seconds)}`
}

export function formatAltitude(meters: number | null): {
	value: string
	unit: string
} {
	if (meters === null || !Number.isFinite(meters)) {
		return { value: "—", unit: "m" }
	}
	return { value: Math.round(meters).toString(), unit: "m" }
}

export function formatElevationGain(meters: number | null): {
	value: string
	unit: string
} {
	if (meters === null || !Number.isFinite(meters) || meters < 0) {
		return { value: "0", unit: "m" }
	}
	return { value: Math.round(meters).toString(), unit: "m" }
}

export function formatCalories(kcal: number | null): {
	value: string
	unit: string
} {
	if (kcal === null || !Number.isFinite(kcal) || kcal <= 0) {
		return { value: "—", unit: "kcal" }
	}
	return { value: Math.round(kcal).toString(), unit: "kcal" }
}

export function formatCoords(
	lat: number | null,
	lon: number | null
): { value: string; unit: string } {
	if (
		lat === null ||
		lon === null ||
		!Number.isFinite(lat) ||
		!Number.isFinite(lon)
	) {
		return { value: "—", unit: "" }
	}
	return {
		value: `${lat.toFixed(4)},\n${lon.toFixed(4)}`,
		unit: "",
	}
}

export function formatClockTime(
	timestamp: number,
	locale?: string
): { value: string; unit: string } {
	const formatter = new Intl.DateTimeFormat(locale, {
		hour: "2-digit",
		minute: "2-digit",
	})
	const parts = formatter.formatToParts(timestamp)

	let value = ""
	let unit = ""

	for (const part of parts) {
		if (part.type === "dayPeriod") {
			unit = part.value
		} else {
			value += part.value
		}
	}

	return { value: value.trim(), unit: unit.trim() }
}
