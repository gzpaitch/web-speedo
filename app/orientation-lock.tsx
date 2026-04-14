"use client"

import { useEffect } from "react"

import { useSettings } from "@/features/settings/hooks/useSettings"

export function OrientationLock() {
	const { settings } = useSettings()
	const { orientationMode } = settings

	useEffect(() => {
		const lock = async () => {
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
				// The CSS @media (orientation: landscape) fallback in globals.css
				// handles the visual rotation in those cases.
			}
		}

		lock()
	}, [orientationMode])

	return null
}
