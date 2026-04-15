"use client"

import type { LucideIcon } from "lucide-react"
import {
	AlarmClock,
	Clock3,
	Flame,
	Gauge,
	MapPinned,
	Mountain,
	Route,
	Timer,
	TrendingUp,
} from "lucide-react"
import { useTranslations } from "next-intl"

import { Switch } from "@/components/ui/switch"
import type { MetricId } from "@/features/speedometer/types"
import { ALL_METRIC_IDS } from "@/features/speedometer/types"
import { cn } from "@/lib/utils"

const METRIC_META: Record<
	MetricId,
	{
		icon: LucideIcon
		iconClassName?: string
	}
> = {
	maxSpeed: { icon: Gauge },
	avgSpeed: { icon: TrendingUp },
	movementTime: { icon: Timer },
	totalTime: { icon: Clock3 },
	currentTime: { icon: AlarmClock },
	distance: { icon: Route },
	altitude: { icon: Mountain },
	elevationGain: { icon: TrendingUp, iconClassName: "rotate-45" },
	calories: { icon: Flame },
	coords: { icon: MapPinned },
}

type Props = {
	activeIds: readonly MetricId[]
	onToggle: (id: MetricId) => void
}

export function MetricsToggleList({ activeIds, onToggle }: Props) {
	const t = useTranslations("metrics")

	return (
		<div className="grid grid-cols-2 gap-3">
			{ALL_METRIC_IDS.map((id) => {
				const active = activeIds.includes(id)
				const { icon: Icon, iconClassName } = METRIC_META[id]

				return (
					<label
						key={id}
						className={cn(
							"group flex min-h-44 cursor-pointer flex-col justify-between rounded-[1.6rem] border border-border/70 bg-card/75 p-4 text-center shadow-[0_20px_50px_-36px_hsl(var(--foreground)/0.5)] transition-all",
							"hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card",
							active &&
								"border-primary/35 bg-primary/6 shadow-[0_24px_60px_-40px_hsl(var(--primary)/0.55)]"
						)}
					>
						<input
							type="checkbox"
							className="sr-only"
							checked={active}
							onChange={() => onToggle(id)}
						/>
						<div className="flex flex-1 flex-col items-center">
							<div
								className={cn(
									"mb-3 flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-background/80 text-muted-foreground shadow-sm transition-colors",
									active && "border-primary/25 text-primary"
								)}
							>
								<Icon className={cn("size-4.5", iconClassName)} />
							</div>
							<p className="text-sm font-semibold tracking-tight text-foreground sm:text-[0.95rem]">
								{t(id)}
							</p>
							<p className="mt-2 text-xs leading-5 text-muted-foreground sm:text-[0.78rem]">
								{t(`${id}Hint`)}
							</p>
						</div>
						<div className="flex justify-center pt-4">
							<Switch
								checked={active}
								onCheckedChange={() => onToggle(id)}
								className="pointer-events-none"
								tabIndex={-1}
								aria-hidden
							/>
						</div>
					</label>
				)
			})}
		</div>
	)
}
