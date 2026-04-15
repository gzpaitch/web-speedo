"use client"

import * as React from "react"
import { useSettings } from "@/features/settings/hooks/useSettings"
import type { MetricId } from "@/features/speedometer/types"

type ActiveMetricsHook = {
	activeIds: readonly MetricId[]
	toggle: (id: MetricId) => void
	set: (ids: readonly MetricId[]) => void
}

/**
 * Bridges the metric-selection UI to the persisted settings. The order of
 * `activeIds` is preserved across sessions.
 */
export function useActiveMetrics(): ActiveMetricsHook {
	const { settings, updateSettings } = useSettings()

	const toggle = React.useCallback(
		(id: MetricId) => {
			updateSettings((prev) => {
				const existing = prev.activeMetrics
				const next = existing.includes(id)
					? existing.filter((item) => item !== id)
					: [...existing, id]
				return { ...prev, activeMetrics: next }
			})
		},
		[updateSettings]
	)

	const set = React.useCallback(
		(ids: readonly MetricId[]) => {
			updateSettings((prev) => ({ ...prev, activeMetrics: [...ids] }))
		},
		[updateSettings]
	)

	return { activeIds: settings.activeMetrics, toggle, set }
}
