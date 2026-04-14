"use client"

import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type Props = {
	label: string
	value: string
	unit?: string
	icon: LucideIcon
	className?: string
}

export function RecordCard({
	label,
	value,
	unit,
	icon: Icon,
	className,
}: Props) {
	return (
		<div
			className={cn(
				"flex items-center gap-4 rounded-[1.6rem] border border-border/70 bg-card/75 p-4 shadow-[0_18px_45px_-30px_hsl(var(--foreground)/0.35)] backdrop-blur transition-transform duration-200 hover:-translate-y-0.5",
				className
			)}
		>
			<div className="flex size-13 items-center justify-center rounded-2xl border border-border/70 bg-background/80 text-muted-foreground shadow-sm">
				<Icon className="size-5" aria-hidden />
			</div>
			<div className="min-w-0 flex-1">
				<p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
					{label}
				</p>
				<p className="mt-1 font-display text-[2rem] leading-none text-foreground tabular-nums">
					{value}
					{unit ? (
						<span className="ml-1 text-sm font-normal text-muted-foreground/80">
							{unit}
						</span>
					) : null}
				</p>
			</div>
		</div>
	)
}
