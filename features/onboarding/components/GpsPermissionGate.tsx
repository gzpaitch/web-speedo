"use client"

import * as React from "react"

import { useGpsPermission } from "@/features/onboarding/hooks/useGpsPermission"

import { GpsDeniedScreen } from "./GpsDeniedScreen"
import { GpsPermissionScreen } from "./GpsPermissionScreen"

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
	const [isRequesting, setIsRequesting] = React.useState(false)

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
			const next = await request()
			if (next !== "granted") {
				// leave state as-is; the gate will re-render accordingly
			}
		} finally {
			setIsRequesting(false)
		}
	}, [refresh, request])

	if (state === "granted") {
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
