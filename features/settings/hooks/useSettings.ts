"use client"

import * as React from "react"

import type { AppSettings } from "@/features/speedometer/types"
import { DEFAULT_SETTINGS, getSettings, saveSettings } from "@/lib/storage"

const SETTINGS_UPDATED_EVENT = "speedo:settings-updated"
let currentSettingsSnapshot: AppSettings = DEFAULT_SETTINGS

type UpdateFn = (
	patch: Partial<AppSettings> | ((prev: AppSettings) => AppSettings)
) => void

type SettingsHook = {
	settings: AppSettings
	updateSettings: UpdateFn
	hydrated: boolean
}

function subscribe(onStoreChange: () => void): () => void {
	if (typeof window === "undefined") {
		return () => {}
	}

	const syncSnapshot = () => {
		currentSettingsSnapshot = getSettings()
		onStoreChange()
	}

	window.addEventListener("storage", syncSnapshot)
	window.addEventListener(SETTINGS_UPDATED_EVENT, syncSnapshot)

	return () => {
		window.removeEventListener("storage", syncSnapshot)
		window.removeEventListener(SETTINGS_UPDATED_EVENT, syncSnapshot)
	}
}

function getSettingsSnapshot(): AppSettings {
	if (
		typeof window !== "undefined" &&
		currentSettingsSnapshot === DEFAULT_SETTINGS
	) {
		currentSettingsSnapshot = getSettings()
	}

	return currentSettingsSnapshot
}

function getServerSnapshot(): AppSettings {
	return DEFAULT_SETTINGS
}

/**
 * Subscribes to the persisted settings store and exposes an imperative updater
 * that writes to `localStorage` and notifies all subscribers.
 */
export function useSettings(): SettingsHook {
	const settings = React.useSyncExternalStore(
		subscribe,
		getSettingsSnapshot,
		getServerSnapshot
	)
	const [hydrated, setHydrated] = React.useState(false)

	React.useEffect(() => {
		currentSettingsSnapshot = getSettings()
		setHydrated(true)
	}, [])

	const updateSettings = React.useCallback<UpdateFn>((patchOrFn) => {
		const prev = currentSettingsSnapshot
		const next =
			typeof patchOrFn === "function"
				? patchOrFn(prev)
				: { ...prev, ...patchOrFn }

		currentSettingsSnapshot = next
		saveSettings(next)
		window.dispatchEvent(new Event(SETTINGS_UPDATED_EVENT))
	}, [])

	return { settings, updateSettings, hydrated }
}
