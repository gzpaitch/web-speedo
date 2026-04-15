"use client"

import { useEffect } from "react"

import { useSettings } from "@/features/settings/hooks/useSettings"

export function OrientationLock() {
	const { settings } = useSettings()
	const { orientationMode } = settings

	useEffect(() => {
		const applyLock = async () => {
			try {
				if (typeof screen === "undefined" || !screen.orientation) {
					return
				}

				if (
					orientationMode === "responsive" &&
					typeof screen.orientation.unlock === "function"
				) {
					screen.orientation.unlock()
					return
				}

				if (
					typeof screen.orientation.lock === "function" &&
					(orientationMode === "portrait" || orientationMode === "landscape")
				) {
					await screen.orientation.lock(orientationMode)
				}
			} catch {
				// API not supported or not allowed (e.g. browser tab without fullscreen).
				// Only works reliably as an installed PWA (standalone/fullscreen display mode).
				// The CSS data-orientation-lock fallback in globals.css handles iOS and browser tabs.
			}
		}

		// Expose the desired lock mode as a data attribute so the CSS fallback
		// in globals.css can apply a transform-based rotation on iOS / browser tabs.
		if (typeof document !== "undefined") {
			if (orientationMode === "responsive") {
				document.documentElement.removeAttribute("data-orientation-lock")
			} else {
				document.documentElement.setAttribute(
					"data-orientation-lock",
					orientationMode
				)
			}
		}

		applyLock()

		// Re-apply when the page becomes visible again (after backgrounding/lock screen).
		const onVisibilityChange = () => {
			if (document.visibilityState === "visible") {
				void applyLock()
			}
		}

		// Re-apply after every device rotation so the OS cannot override the lock.
		const onOrientationChange = () => {
			void applyLock()
		}

		document.addEventListener("visibilitychange", onVisibilityChange)
		screen.orientation?.addEventListener("change", onOrientationChange)

		return () => {
			document.removeEventListener("visibilitychange", onVisibilityChange)
			screen.orientation?.removeEventListener("change", onOrientationChange)
		}
	}, [orientationMode])

	return null
}
