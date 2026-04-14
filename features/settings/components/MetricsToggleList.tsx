"use client"

import { Activity } from "lucide-react"
import { useTranslations } from "next-intl"

import { Separator } from "@/components/ui/separator"
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
			{ALL_METRIC_IDS.map((id, index) => (
				<div key={id}>
					<ToggleRow
						label={t(id)}
						checked={activeIds.includes(id)}
						onCheckedChange={() => onToggle(id)}
						icon={<Activity className="size-4.5" />}
					/>
					{index < ALL_METRIC_IDS.length - 1 ? (
						<Separator className="mx-3 bg-border/60" />
					) : null}
				</div>
			))}
		</div>
	)
}
