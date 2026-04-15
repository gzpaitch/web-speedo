"use client"

import * as React from "react"

type FocusModeHook = {
	/** Whether the app is currently in focus (fullscreen + minimal chrome) mode. */
	isFocused: boolean
	/** Enter fullscreen and focus mode. No-op if already focused. */
	enter: () => void
	/** Exit fullscreen and focus mode. */
	exit: () => void
	/** Toggle the current state — used for single-tap gesture. */
	toggle: () => void
}

function requestFullscreen() {
	if (typeof document === "undefined") {
		return
	}
	const el = document.documentElement
	if (document.fullscreenElement) {
		return
	}
	el.requestFullscreen?.().catch(() => {
		// Browser may reject the request (e.g. iOS). Focus mode still toggles
		// visually via the `isFocused` state.
	})
}

function exitFullscreen() {
	if (typeof document === "undefined") {
		return
	}
	if (document.fullscreenElement) {
		document.exitFullscreen?.().catch(() => {
			// ignore
		})
	}
}

/**
 * Focus mode (PRD §2 Focus Mode). Enters fullscreen and hides secondary
 * chrome. Tapping the screen toggles the state; pausing/ending a session
 * should call `exit()` from the caller.
 */
export function useFocusMode(): FocusModeHook {
	const [isFocused, setIsFocused] = React.useState(false)

	const enter = React.useCallback(() => {
		setIsFocused(true)
		requestFullscreen()
	}, [])

	const exit = React.useCallback(() => {
		setIsFocused(false)
		exitFullscreen()
	}, [])

	const toggle = React.useCallback(() => {
		setIsFocused((prev) => {
			if (prev) {
				exitFullscreen()
			} else {
				requestFullscreen()
			}
			return !prev
		})
	}, [])

	// Keep local state in sync with the browser's fullscreen state (e.g. user
	// presses Esc or the system exits fullscreen).
	React.useEffect(() => {
		if (typeof document === "undefined") {
			return
		}
		const onChange = () => {
			if (!document.fullscreenElement) {
				setIsFocused(false)
			}
		}
		document.addEventListener("fullscreenchange", onChange)
		return () => document.removeEventListener("fullscreenchange", onChange)
	}, [])

	return { isFocused, enter, exit, toggle }
}
