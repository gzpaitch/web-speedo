"use client"

import { useEffect } from "react"

export function OrientationLock() {
	useEffect(() => {
		const lock = async () => {
			try {
				if (
					typeof screen !== "undefined" &&
					screen.orientation &&
					typeof screen.orientation.lock === "function"
				) {
					await screen.orientation.lock("portrait")
				}
			} catch {
				// API not supported or not allowed (e.g. browser tab without fullscreen).
				// The CSS @media (orientation: landscape) fallback in globals.css
				// handles the visual rotation in those cases.
			}
		}

		lock()
	}, [])

	return null
}
