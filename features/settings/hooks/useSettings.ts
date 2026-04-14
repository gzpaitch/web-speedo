"use client"

import * as React from "react"

import type { AppSettings } from "@/features/speedometer/types"
import { DEFAULT_SETTINGS, getSettings, saveSettings } from "@/lib/storage"

type UpdateFn = (
	patch: Partial<AppSettings> | ((prev: AppSettings) => AppSettings)
) => void

type SettingsHook = {
	settings: AppSettings
	updateSettings: UpdateFn
	hydrated: boolean
}

/**
 * Reads the persisted settings on mount and exposes an imperative updater
 * that both mutates local state and writes to `localStorage`.
 */
export function useSettings(): SettingsHook {
	const [settings, setSettings] = React.useState<AppSettings>(DEFAULT_SETTINGS)
	const [hydrated, setHydrated] = React.useState(false)

	React.useEffect(() => {
		setSettings(getSettings())
		setHydrated(true)
	}, [])

	const updateSettings = React.useCallback<UpdateFn>((patchOrFn) => {
		setSettings((prev) => {
			const next =
				typeof patchOrFn === "function"
					? patchOrFn(prev)
					: { ...prev, ...patchOrFn }
			saveSettings(next)
			return next
		})
	}, [])

	return { settings, updateSettings, hydrated }
}
