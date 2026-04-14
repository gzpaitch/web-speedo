"use client"

import * as React from "react"

import { GPS_ACCURACY } from "@/constants"
import type { GpsStatus, SpeedReading } from "@/features/speedometer/types"
import { haversineDistanceMeters } from "@/features/speedometer/utils/haversine"

export type GeolocationState = {
	/** The most recent reading, or `null` before the first fix. */
	reading: SpeedReading | null
	/** GPS signal quality. `"waiting"` until we have a usable fix. */
	status: GpsStatus
	/** Browser error message, if any. */
	error: string | null
	/** `true` between `start()` and `stop()`. */
	isWatching: boolean
	start: () => void
	stop: () => void
}

/**
 * Subscribes to `navigator.geolocation.watchPosition` with high accuracy and
 * exposes normalised speed readings.
 *
 * Fallback: when `coords.speed === null`, the hook derives speed from the
 * Haversine distance between consecutive positions divided by Δt.
 */
export function useGeolocation(): GeolocationState {
	const [reading, setReading] = React.useState<SpeedReading | null>(null)
	const [status, setStatus] = React.useState<GpsStatus>("waiting")
	const [error, setError] = React.useState<string | null>(null)
	const [isWatching, setIsWatching] = React.useState(false)

	const watchIdRef = React.useRef<number | null>(null)
	const lastPositionRef = React.useRef<{
		lat: number
		lon: number
		timestamp: number
	} | null>(null)

	const handlePosition = React.useCallback((position: GeolocationPosition) => {
		const { coords, timestamp } = position
		let speedMps = coords.speed

		if (speedMps === null || Number.isNaN(speedMps)) {
			const previous = lastPositionRef.current
			if (previous) {
				const distance = haversineDistanceMeters(
					previous.lat,
					previous.lon,
					coords.latitude,
					coords.longitude
				)
				const dtSeconds = (timestamp - previous.timestamp) / 1000
				if (dtSeconds > 0 && Number.isFinite(distance)) {
					speedMps = distance / dtSeconds
				}
			}
		}

		lastPositionRef.current = {
			lat: coords.latitude,
			lon: coords.longitude,
			timestamp,
		}

		setReading({
			speedMps: speedMps ?? null,
			latitude: coords.latitude,
			longitude: coords.longitude,
			altitude: coords.altitude ?? null,
			accuracy: coords.accuracy ?? null,
			heading: coords.heading ?? null,
			timestamp,
		})

		const accuracy = coords.accuracy ?? Number.POSITIVE_INFINITY
		if (accuracy <= GPS_ACCURACY.okMax) {
			setStatus("ok")
		} else if (accuracy <= GPS_ACCURACY.weakMax) {
			setStatus("weak")
		} else {
			setStatus("weak")
		}
		setError(null)
	}, [])

	const handleError = React.useCallback((err: GeolocationPositionError) => {
		setError(err.message || "GPS error")
		setStatus("waiting")
	}, [])

	const start = React.useCallback(() => {
		if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
			setError("Geolocation unsupported")
			return
		}
		if (watchIdRef.current !== null) {
			return
		}
		setIsWatching(true)
		setStatus("waiting")
		setError(null)
		lastPositionRef.current = null
		watchIdRef.current = navigator.geolocation.watchPosition(
			handlePosition,
			handleError,
			{ enableHighAccuracy: true, maximumAge: 0, timeout: 20_000 }
		)
	}, [handlePosition, handleError])

	const stop = React.useCallback(() => {
		if (watchIdRef.current !== null) {
			navigator.geolocation.clearWatch(watchIdRef.current)
			watchIdRef.current = null
		}
		setIsWatching(false)
		setStatus("waiting")
		lastPositionRef.current = null
	}, [])

	React.useEffect(() => {
		return () => {
			if (watchIdRef.current !== null) {
				navigator.geolocation.clearWatch(watchIdRef.current)
				watchIdRef.current = null
			}
		}
	}, [])

	return { reading, status, error, isWatching, start, stop }
}
