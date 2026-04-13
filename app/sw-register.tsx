"use client"

import { useEffect } from "react"

const appVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev"
const serviceWorkerUrl = `/sw.js?v=${encodeURIComponent(appVersion)}`

export function ServiceWorkerRegister() {
	useEffect(() => {
		if (
			!("serviceWorker" in navigator) ||
			process.env.NODE_ENV !== "production"
		)
			return

		let hasReloaded = false
		const reloadOnControllerChange = () => {
			if (hasReloaded) return
			hasReloaded = true
			window.location.reload()
		}

		navigator.serviceWorker.addEventListener(
			"controllerchange",
			reloadOnControllerChange
		)

		navigator.serviceWorker
			.register(serviceWorkerUrl, { scope: "/" })
			.catch((err) => console.error("[SW] Registration failed:", err))

		return () => {
			navigator.serviceWorker.removeEventListener(
				"controllerchange",
				reloadOnControllerChange
			)
		}
	}, [])

	return null
}
