"use client"

import * as React from "react"

type WakeLockState = {
	/** `true` when a wake lock is currently held. */
	isActive: boolean
	/** `true` when the Wake Lock API exists on this browser. */
	isSupported: boolean
	/** Last error message, if any. */
	error: string | null
}

type WakeLockHook = WakeLockState & {
	enable: () => Promise<void>
	disable: () => Promise<void>
}

type WakeLockSentinel = {
	released: boolean
	release(): Promise<void>
	addEventListener(type: "release", listener: () => void): void
	removeEventListener(type: "release", listener: () => void): void
}

type WakeLockNavigator = Navigator & {
	wakeLock?: {
		request: (type: "screen") => Promise<WakeLockSentinel>
	}
}

function getWakeLock(): WakeLockNavigator["wakeLock"] | undefined {
	if (typeof navigator === "undefined") {
		return undefined
	}
	return (navigator as WakeLockNavigator).wakeLock
}

/**
 * Screen Wake Lock integration (PRD §2 Settings).
 *
 * The sentinel is automatically released by the browser when the page loses
 * visibility; we re-acquire it on `visibilitychange` while the feature is
 * enabled.
 */
export function useWakeLock(enabled: boolean): WakeLockHook {
	const [state, setState] = React.useState<WakeLockState>(() => ({
		isActive: false,
		isSupported: typeof navigator !== "undefined" && "wakeLock" in navigator,
		error: null,
	}))
	const sentinelRef = React.useRef<WakeLockSentinel | null>(null)

	const enable = React.useCallback(async () => {
		const api = getWakeLock()
		if (!api) {
			setState((prev) => ({ ...prev, isSupported: false }))
			return
		}
		try {
			const sentinel = await api.request("screen")
			sentinelRef.current = sentinel
			sentinel.addEventListener("release", () => {
				// Only clear the ref if this is still the current sentinel;
				// a stale release event must not overwrite a newer lock.
				if (sentinelRef.current === sentinel) {
					sentinelRef.current = null
				}
				setState((prev) => ({ ...prev, isActive: false }))
			})
			setState({ isActive: true, isSupported: true, error: null })
		} catch (err) {
			setState({
				isActive: false,
				isSupported: true,
				error: err instanceof Error ? err.message : "wake lock error",
			})
		}
	}, [])

	const disable = React.useCallback(async () => {
		const sentinel = sentinelRef.current
		sentinelRef.current = null
		if (sentinel && !sentinel.released) {
			try {
				await sentinel.release()
			} catch {
				// ignore
			}
		}
		setState((prev) => ({ ...prev, isActive: false }))
	}, [])

	// Acquire / release whenever `enabled` changes.
	React.useEffect(() => {
		if (enabled) {
			void enable()
		} else {
			void disable()
		}
		return () => {
			void disable()
		}
		// `enable` and `disable` are stable (useCallback with empty deps)
	}, [enabled, enable, disable])

	// Re-acquire when the tab becomes visible again.
	React.useEffect(() => {
		if (!enabled) {
			return
		}
		const onVisibilityChange = () => {
			if (document.visibilityState === "visible" && !sentinelRef.current) {
				void enable()
			}
		}
		document.addEventListener("visibilitychange", onVisibilityChange)
		return () => {
			document.removeEventListener("visibilitychange", onVisibilityChange)
		}
	}, [enabled, enable])

	return { ...state, enable, disable }
}
