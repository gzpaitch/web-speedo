"use client"

import { useTranslations } from "next-intl"

import type { MetricId } from "@/features/speedometer/types"
import { ALL_METRIC_IDS } from "@/features/speedometer/types"

import { ToggleRow } from "./ToggleRow"

type Props = {
	activeIds: readonly MetricId[]
	onToggle: (id: MetricId) => void
}

export function MetricsToggleList({ activeIds, onToggle }: Props) {
	const t = useTranslations("metrics")
	return (
		<div className="flex flex-col">
			{ALL_METRIC_IDS.map((id) => (
				<ToggleRow
					key={id}
					label={t(id)}
					checked={activeIds.includes(id)}
					onCheckedChange={() => onToggle(id)}
				/>
			))}
		</div>
	)
}
