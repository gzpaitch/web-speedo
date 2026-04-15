"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type PermissionStateValue =
	| "unsupported"
	| "idle"
	| "prompt"
	| "granted"
	| "denied"
type SignalState = "waiting" | "weak" | "ok"

type PositionSnapshot = {
	lat: number
	lon: number
	timestamp: number
}

type SpeedSample = {
	speedKmh: number
}

type ChromeSpeedometerState = {
	permission: PermissionStateValue
	isRequesting: boolean
	signal: SignalState
	isWatching: boolean
	currentSpeedKmh: number
	maxSpeedKmh: number
	averageSpeedKmh: number
	accuracyMeters: number | null
	latitude: number | null
	longitude: number | null
	lastUpdatedAt: number | null
	source: "coords.speed" | "haversine" | "waiting"
	errorMessage: string | null
	browserDetails: string
	networkDetails: string
	requestAccess: () => void
	stop: () => void
	resetStats: () => void
}

const STORAGE_KEY_MAX_SPEED = "speedo_max_speed_kmh"

function readPersistedMaxSpeed(): number {
	if (typeof window === "undefined") return 0
	const raw = localStorage.getItem(STORAGE_KEY_MAX_SPEED)
	if (raw === null) return 0
	const parsed = parseFloat(raw)
	return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

const EARTH_RADIUS_METERS = 6371000

function toRadians(value: number) {
	return (value * Math.PI) / 180
}

function haversineMeters(from: PositionSnapshot, to: PositionSnapshot) {
	const dLat = toRadians(to.lat - from.lat)
	const dLon = toRadians(to.lon - from.lon)
	const lat1 = toRadians(from.lat)
	const lat2 = toRadians(to.lat)

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

	return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function metersPerSecondToKmh(speed: number) {
	return speed * 3.6
}

function resolveSignal(
	accuracy: number | null,
	hasCoordinates: boolean
): SignalState {
	if (!hasCoordinates || accuracy === null) {
		return "waiting"
	}

	if (accuracy > 25) {
		return "weak"
	}

	return "ok"
}

function resolveErrorMessage(error: GeolocationPositionError) {
	switch (error.code) {
		case error.PERMISSION_DENIED:
			return "GPS access was denied in Chrome."
		case error.POSITION_UNAVAILABLE:
			return "Chrome could not obtain a valid position."
		case error.TIMEOUT:
			return "GPS took longer than expected to respond."
		default:
			return "Failed to read Chrome geolocation."
	}
}

function readBrowserDetails() {
	if (typeof window === "undefined") {
		return "SSR"
	}

	return navigator.userAgent.includes("Chrome")
		? "Chrome detected"
		: navigator.userAgent
}

function readNetworkDetails() {
	if (typeof window === "undefined") {
		return "offline"
	}

	type ConnectionLike = {
		effectiveType?: string
		downlink?: number
		rtt?: number
	}

	const connection = (
		navigator as Navigator & {
			connection?: ConnectionLike
			mozConnection?: ConnectionLike
			webkitConnection?: ConnectionLike
		}
	).connection

	if (!connection) {
		return navigator.onLine ? "Connection API unavailable" : "Offline"
	}

	const parts = [
		connection.effectiveType ? `type ${connection.effectiveType}` : null,
		typeof connection.downlink === "number"
			? `downlink ${connection.downlink}Mb/s`
			: null,
		typeof connection.rtt === "number" ? `rtt ${connection.rtt}ms` : null,
	].filter(Boolean)

	return parts.join(" • ") || "Connection API unavailable"
}

export function useChromeSpeedometer(): ChromeSpeedometerState {
	const [permission, setPermission] = useState<PermissionStateValue>("idle")
	const [isRequesting, setIsRequesting] = useState(false)
	const [signal, setSignal] = useState<SignalState>("waiting")
	const [isWatching, setIsWatching] = useState(false)
	const [currentSpeedKmh, setCurrentSpeedKmh] = useState(0)
	const [maxSpeedKmh, setMaxSpeedKmh] = useState(() => readPersistedMaxSpeed())
	const [averageSpeedKmh, setAverageSpeedKmh] = useState(0)
	const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null)
	const [latitude, setLatitude] = useState<number | null>(null)
	const [longitude, setLongitude] = useState<number | null>(null)
	const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null)
	const [source, setSource] = useState<
		"coords.speed" | "haversine" | "waiting"
	>("waiting")
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	const watchIdRef = useRef<number | null>(null)
	const previousPositionRef = useRef<PositionSnapshot | null>(null)
	const samplesRef = useRef<SpeedSample[]>([])

	useEffect(() => {
		if (typeof window === "undefined" || !("geolocation" in navigator)) {
			setPermission("unsupported")
			setErrorMessage("Geolocation is not supported in this browser.")
			return
		}

		if (
			!("permissions" in navigator) ||
			typeof navigator.permissions.query !== "function"
		) {
			return
		}

		let isMounted = true
		let permissionStatus: PermissionStatus | null = null

		const handlePermissionChange = () => {
			if (isMounted && permissionStatus) {
				setPermission(permissionStatus.state as PermissionStateValue)
			}
		}

		navigator.permissions
			.query({ name: "geolocation" })
			.then((status) => {
				if (!isMounted) {
					return
				}

				permissionStatus = status
				setPermission(status.state as PermissionStateValue)
				status.addEventListener("change", handlePermissionChange)
			})
			.catch(() => {
				setPermission("idle")
			})

		return () => {
			isMounted = false
			permissionStatus?.removeEventListener("change", handlePermissionChange)
		}
	}, [])

	const startWatching = useCallback(() => {
		if (
			typeof window === "undefined" ||
			!("geolocation" in navigator) ||
			watchIdRef.current !== null
		) {
			return
		}

		setErrorMessage(null)
		setIsWatching(true)

		watchIdRef.current = navigator.geolocation.watchPosition(
			(position) => {
				const nextSnapshot: PositionSnapshot = {
					lat: position.coords.latitude,
					lon: position.coords.longitude,
					timestamp: position.timestamp,
				}

				if (
					previousPositionRef.current !== null &&
					nextSnapshot.timestamp <= previousPositionRef.current.timestamp
				) {
					return
				}

				const rawSpeed = position.coords.speed
				let nextSpeedKmh = 0
				let nextSource: "coords.speed" | "haversine" | "waiting" = "waiting"

				if (
					typeof rawSpeed === "number" &&
					Number.isFinite(rawSpeed) &&
					rawSpeed >= 0
				) {
					nextSpeedKmh = metersPerSecondToKmh(rawSpeed)
					nextSource = "coords.speed"
				} else if (previousPositionRef.current) {
					const elapsedSeconds =
						(nextSnapshot.timestamp - previousPositionRef.current.timestamp) /
						1000

					if (elapsedSeconds > 0) {
						const distanceMeters = haversineMeters(
							previousPositionRef.current,
							nextSnapshot
						)
						nextSpeedKmh = metersPerSecondToKmh(distanceMeters / elapsedSeconds)
						nextSource = "haversine"
					}
				}

				previousPositionRef.current = nextSnapshot
				samplesRef.current.push({ speedKmh: nextSpeedKmh })
				if (samplesRef.current.length > 120) {
					samplesRef.current.shift()
				}

				const validSamples = samplesRef.current.filter(
					(sample) => sample.speedKmh > 0.3
				)
				const nextAverage =
					validSamples.length > 0
						? validSamples.reduce(
								(total, sample) => total + sample.speedKmh,
								0
							) / validSamples.length
						: 0

				setCurrentSpeedKmh(nextSpeedKmh)
				setMaxSpeedKmh((currentMax) => {
					const next = Math.max(currentMax, nextSpeedKmh)
					if (next > currentMax) {
						localStorage.setItem(STORAGE_KEY_MAX_SPEED, String(next))
					}
					return next
				})
				setAverageSpeedKmh(nextAverage)
				setAccuracyMeters(position.coords.accuracy)
				setLatitude(position.coords.latitude)
				setLongitude(position.coords.longitude)
				setLastUpdatedAt(position.timestamp)
				setSource(nextSource)
				setSignal(resolveSignal(position.coords.accuracy, true))
				setErrorMessage(null)
			},
			(error) => {
				if (watchIdRef.current !== null) {
					navigator.geolocation.clearWatch(watchIdRef.current)
					watchIdRef.current = null
				}

				setErrorMessage(resolveErrorMessage(error))
				setIsWatching(false)
				setSignal("waiting")

				if (error.code === error.PERMISSION_DENIED) {
					setPermission("denied")
				}
			},
			{
				enableHighAccuracy: true,
				maximumAge: 1000,
				timeout: 10000,
			}
		)
	}, [])

	useEffect(() => {
		if (permission !== "granted") {
			return
		}

		startWatching()

		return () => {
			if (watchIdRef.current !== null) {
				navigator.geolocation.clearWatch(watchIdRef.current)
				watchIdRef.current = null
			}

			setIsWatching(false)
		}
	}, [permission, startWatching])

	const requestAccess = () => {
		if (typeof window === "undefined" || !("geolocation" in navigator)) {
			setPermission("unsupported")
			return
		}

		if (permission === "granted") {
			startWatching()
			return
		}

		setIsRequesting(true)
		setErrorMessage(null)

		navigator.geolocation.getCurrentPosition(
			(position) => {
				setIsRequesting(false)
				setPermission("granted")
				previousPositionRef.current = {
					lat: position.coords.latitude,
					lon: position.coords.longitude,
					timestamp: position.timestamp,
				}
				setAccuracyMeters(position.coords.accuracy)
				setLatitude(position.coords.latitude)
				setLongitude(position.coords.longitude)
				setLastUpdatedAt(position.timestamp)
				setSignal(resolveSignal(position.coords.accuracy, true))
			},
			(error) => {
				setIsRequesting(false)
				setErrorMessage(resolveErrorMessage(error))
				setPermission(
					error.code === error.PERMISSION_DENIED ? "denied" : "idle"
				)
			},
			{
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 0,
			}
		)
	}

	const stop = () => {
		if (typeof window !== "undefined" && watchIdRef.current !== null) {
			navigator.geolocation.clearWatch(watchIdRef.current)
			watchIdRef.current = null
		}

		previousPositionRef.current = null
		samplesRef.current = []
		setIsWatching(false)
		setSignal("waiting")
		setSource("waiting")
	}

	const resetStats = () => {
		samplesRef.current = []
		setMaxSpeedKmh(0)
		setAverageSpeedKmh(0)
		if (typeof window !== "undefined") {
			localStorage.removeItem(STORAGE_KEY_MAX_SPEED)
		}
	}

	const [browserDetails, setBrowserDetails] = useState("SSR")
	const [networkDetails, setNetworkDetails] = useState("offline")

	useEffect(() => {
		setBrowserDetails(readBrowserDetails())
		setNetworkDetails(readNetworkDetails())
	}, [])

	return {
		permission,
		isRequesting,
		signal,
		isWatching,
		currentSpeedKmh,
		maxSpeedKmh,
		averageSpeedKmh,
		accuracyMeters,
		latitude,
		longitude,
		lastUpdatedAt,
		source,
		errorMessage,
		browserDetails,
		networkDetails,
		requestAccess,
		stop,
		resetStats,
	}
}
