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
				"flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-4",
				className
			)}
		>
			<div className="flex size-12 items-center justify-center rounded-lg bg-muted text-foreground">
				<Icon className="size-5" aria-hidden />
			</div>
			<div className="min-w-0 flex-1">
				<p className="text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
					{label}
				</p>
				<p className="font-display text-2xl text-foreground tabular-nums">
					{value}
					{unit ? (
						<span className="ml-1 text-sm font-normal text-muted-foreground">
							{unit}
						</span>
					) : null}
				</p>
			</div>
		</div>
	)
}
