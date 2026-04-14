"use client"

import { useTranslations } from "next-intl"

import type { MetricValue } from "@/features/speedometer/hooks/useMetrics"
import { cn } from "@/lib/utils"

type Props = {
	metric: MetricValue
	centered?: boolean
}

export function MetricCard({ metric, centered = false }: Props) {
	const t = useTranslations("metrics")
	return (
		<div
			className={cn(
				"flex h-20 flex-col items-center justify-center rounded-xl border border-border bg-muted/30 px-4",
				centered && "mx-auto w-1/2"
			)}
		>
			<p className="text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
				{t(metric.id)}
			</p>
			<p className="mt-1 font-display text-3xl text-foreground tabular-nums">
				{metric.value}
				{metric.unit ? (
					<span className="ml-1 text-xs font-normal text-muted-foreground">
						{metric.unit}
					</span>
				) : null}
			</p>
		</div>
	)
}
