"use client"

import { useEffect, useState } from "react"

interface BeforeInstallPromptEvent extends Event {
	prompt(): Promise<void>
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

interface NavigatorWithStandalone extends Navigator {
	standalone?: boolean
}

export type PWAInstallState = "idle" | "available" | "installed" | "dismissed"
export type PWAInstallResult = "accepted" | "dismissed" | "unavailable"

export function usePWAInstall() {
	const [state, setState] = useState<PWAInstallState>("idle")
	const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
	const [isIOS, setIsIOS] = useState(false)
	const [ready, setReady] = useState(false)

	useEffect(() => {
		const standalone =
			window.matchMedia("(display-mode: standalone)").matches ||
			(navigator as NavigatorWithStandalone).standalone === true
		if (standalone) {
			setState("installed")
			setReady(true)
			return
		}

		const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
		setIsIOS(ios)
		if (ios) {
			setState("available")
			setReady(true)
			return
		}

		const handler = (e: Event) => {
			e.preventDefault()
			setPrompt(e as BeforeInstallPromptEvent)
			setState("available")
		}

		const appInstalledHandler = () => setState("installed")

		window.addEventListener("beforeinstallprompt", handler)
		window.addEventListener("appinstalled", appInstalledHandler)
		setReady(true)

		return () => {
			window.removeEventListener("beforeinstallprompt", handler)
			window.removeEventListener("appinstalled", appInstalledHandler)
		}
	}, [])

	const install = async (): Promise<PWAInstallResult> => {
		if (!prompt) {
			return "unavailable"
		}

		await prompt.prompt()
		const { outcome } = await prompt.userChoice
		setPrompt(null)
		setState(outcome === "accepted" ? "installed" : "dismissed")
		return outcome
	}

	return { state, install, isIOS, ready }
}
