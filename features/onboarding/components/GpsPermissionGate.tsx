"use client"

import * as React from "react"

import { usePWAInstall } from "@/app/MVP/usePWAInstall"
import { useGpsPermission } from "@/features/onboarding/hooks/useGpsPermission"
import {
	getInstallOnboardingSeenFlag,
	setInstallOnboardingSeenFlag,
} from "@/lib/storage"

import { GpsDeniedScreen } from "./GpsDeniedScreen"
import { GpsPermissionScreen } from "./GpsPermissionScreen"
import { InstallPromptScreen } from "./InstallPromptScreen"

/**
 * Blocks children until GPS permission is granted.
 *
 * Flow (PRD §2 Onboarding):
 *  - `unknown` / `prompt` → show request screen
 *  - `granted`            → render children
 *  - `denied`             → show blocking screen with Try again
 *  - `denied-permanent`   → show blocking screen with settings instructions
 *  - `unsupported`        → show blocking screen without a retry CTA
 */
export function GpsPermissionGate({ children }: { children: React.ReactNode }) {
	const { state, request, refresh } = useGpsPermission()
	const pwa = usePWAInstall()
	const [isRequesting, setIsRequesting] = React.useState(false)
	const [isInstalling, setIsInstalling] = React.useState(false)
	const [installOnboardingSeen, setInstallOnboardingSeen] = React.useState(
		getInstallOnboardingSeenFlag
	)

	const handleRequest = React.useCallback(async () => {
		setIsRequesting(true)
		try {
			await request()
		} finally {
			setIsRequesting(false)
		}
	}, [request])

	const handleRetry = React.useCallback(async () => {
		setIsRequesting(true)
		try {
			await refresh()
			await request()
			// Gate will re-render based on the new state from useGpsPermission.
		} finally {
			setIsRequesting(false)
		}
	}, [refresh, request])

	const finishInstallOnboarding = React.useCallback(() => {
		setInstallOnboardingSeenFlag(true)
		setInstallOnboardingSeen(true)
	}, [])

	const handleInstall = React.useCallback(async () => {
		setIsInstalling(true)
		try {
			const result = await pwa.install()
			if (result === "accepted") {
				finishInstallOnboarding()
			}
		} finally {
			setIsInstalling(false)
		}
	}, [finishInstallOnboarding, pwa])

	React.useEffect(() => {
		if (state !== "granted" || installOnboardingSeen || !pwa.ready) {
			return
		}

		if (pwa.state === "installed") {
			finishInstallOnboarding()
		}
	}, [
		finishInstallOnboarding,
		installOnboardingSeen,
		pwa.ready,
		pwa.state,
		state,
	])

	if (state === "granted") {
		if (!installOnboardingSeen) {
			if (!pwa.ready) {
				return null
			}

			return (
				<InstallPromptScreen
					canInstall={pwa.state === "available"}
					isIOS={pwa.isIOS}
					isInstalling={isInstalling}
					onInstall={() => void handleInstall()}
					onContinue={finishInstallOnboarding}
				/>
			)
		}

		return <>{children}</>
	}

	if (
		state === "denied" ||
		state === "denied-permanent" ||
		state === "unsupported"
	) {
		return (
			<GpsDeniedScreen
				permanent={state === "denied-permanent" || state === "unsupported"}
				// "unsupported" means the device has no GPS — retrying is pointless.
				onRetry={state === "unsupported" ? undefined : handleRetry}
			/>
		)
	}

	return (
		<GpsPermissionScreen
			onRequest={handleRequest}
			isRequesting={isRequesting}
		/>
	)
}
