"use client"

import * as React from "react"

import { getGpsGrantedFlag, setGpsGrantedFlag } from "@/lib/storage"

export type GpsPermissionState =
	| "unknown"
	| "prompt"
	| "granted"
	| "denied"
	| "denied-permanent"
	| "unsupported"

type QueryResult = {
	state: GpsPermissionState
	/**
	 * Triggers the native permission prompt. Resolves with the final state
	 * after the browser responds.
	 */
	request: () => Promise<GpsPermissionState>
	/** Re-checks the permission state (e.g. after the user changes browser settings). */
	refresh: () => Promise<void>
}

function hasGeolocation(): boolean {
	return typeof navigator !== "undefined" && "geolocation" in navigator
}

async function queryPermission(): Promise<GpsPermissionState> {
	if (!hasGeolocation()) {
		return "unsupported"
	}

	// Permissions API is best-effort.
	if (typeof navigator !== "undefined" && "permissions" in navigator) {
		try {
			const status = await navigator.permissions.query({
				name: "geolocation" as PermissionName,
			})
			if (status.state === "granted") {
				return "granted"
			}
			if (status.state === "denied") {
				// We can't cleanly distinguish "temporarily denied" from
				// "permanently blocked" via the API. The caller can treat
				// repeated denies as permanent.
				return "denied"
			}
			return "prompt"
		} catch {
			// Fall through to unknown.
		}
	}

	return "unknown"
}

export function useGpsPermission(): QueryResult {
	const [state, setState] = React.useState<GpsPermissionState>("unknown")
	const deniedAttemptsRef = React.useRef(0)

	// Fast path: if we've previously stored the flag, start as `granted` and
	// still verify against the live API.
	React.useEffect(() => {
		if (getGpsGrantedFlag()) {
			setState("granted")
		}
		void queryPermission().then((next) => setState(next))
	}, [])

	// Keep state in sync with live permission changes, e.g. when the user
	// allows location in browser settings.
	React.useEffect(() => {
		if (typeof navigator === "undefined" || !("permissions" in navigator)) {
			return
		}
		let cancelled = false
		let cleanup: (() => void) | null = null

		navigator.permissions
			.query({ name: "geolocation" as PermissionName })
			.then((status) => {
				if (cancelled) {
					return
				}
				const onChange = () => {
					if (status.state === "granted") {
						setGpsGrantedFlag(true)
						setState("granted")
					} else if (status.state === "denied") {
						setGpsGrantedFlag(false)
						setState("denied")
					} else {
						setState("prompt")
					}
				}
				status.addEventListener("change", onChange)
				cleanup = () => status.removeEventListener("change", onChange)
			})
			.catch(() => {
				// ignore
			})

		return () => {
			cancelled = true
			cleanup?.()
		}
	}, [])

	const request = React.useCallback<QueryResult["request"]>(() => {
		return new Promise((resolve) => {
			if (!hasGeolocation()) {
				setState("unsupported")
				resolve("unsupported")
				return
			}

			navigator.geolocation.getCurrentPosition(
				() => {
					setGpsGrantedFlag(true)
					deniedAttemptsRef.current = 0
					setState("granted")
					resolve("granted")
				},
				(error) => {
					setGpsGrantedFlag(false)
					if (error.code === error.PERMISSION_DENIED) {
						deniedAttemptsRef.current += 1
						const next: GpsPermissionState =
							deniedAttemptsRef.current >= 2 ? "denied-permanent" : "denied"
						setState(next)
						resolve(next)
						return
					}
					setState("denied")
					resolve("denied")
				},
				{ enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 }
			)
		})
	}, [])

	const refresh = React.useCallback(async () => {
		const next = await queryPermission()
		setState(next)
		if (next === "granted") {
			setGpsGrantedFlag(true)
		} else if (next === "denied") {
			setGpsGrantedFlag(false)
		}
	}, [])

	return { state, request, refresh }
}
