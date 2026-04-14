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
	const isCoords = metric.id === "coords"
	const isTime = metric.id.includes("Time")

	const valueTextSize = isCoords
		? "text-base tracking-tight whitespace-pre-line"
		: isTime
			? "text-2xl"
			: "text-3xl"

	return (
		<div
			className={cn(
				"relative flex h-24 flex-col items-center justify-center overflow-hidden rounded-[1.5rem] border border-border/70 bg-card/75 px-4 shadow-[0_18px_45px_-30px_hsl(var(--foreground)/0.35)] backdrop-blur landscape:h-full landscape:min-h-0 landscape:rounded-[1.35rem] landscape:px-3",
				centered && "mx-auto w-1/2"
			)}
		>
			<div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,hsl(var(--border)),transparent)]" />
			<p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
				{t(metric.id)}
			</p>
			<p
				className={cn(
					"mt-2 font-display leading-none text-foreground tabular-nums landscape:mt-1.5",
					valueTextSize
				)}
			>
				{metric.value}
				{metric.unit ? (
					<span className="ml-1 text-xs font-normal text-muted-foreground/80">
						{metric.unit}
					</span>
				) : null}
			</p>
		</div>
	)
}
