"use client"

import { useEffect, useState } from "react"

interface BeforeInstallPromptEvent extends Event {
	prompt(): Promise<void>
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export type PWAInstallState = "idle" | "available" | "installed" | "dismissed"

export function usePWAInstall() {
	const [state, setState] = useState<PWAInstallState>("idle")
	const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
	const [isIOS, setIsIOS] = useState(false)

	useEffect(() => {
		const standalone =
			window.matchMedia("(display-mode: standalone)").matches ||
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(navigator as any).standalone === true
		if (standalone) {
			setState("installed")
			return
		}

		const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
		setIsIOS(ios)
		if (ios) {
			setState("available")
			return
		}

		const handler = (e: Event) => {
			e.preventDefault()
			setPrompt(e as BeforeInstallPromptEvent)
			setState("available")
		}

		window.addEventListener("beforeinstallprompt", handler)
		window.addEventListener("appinstalled", () => setState("installed"))

		return () => {
			window.removeEventListener("beforeinstallprompt", handler)
		}
	}, [])

	const install = async () => {
		if (!prompt) return
		await prompt.prompt()
		const { outcome } = await prompt.userChoice
		setPrompt(null)
		setState(outcome === "accepted" ? "installed" : "dismissed")
	}

	return { state, install, isIOS }
}
