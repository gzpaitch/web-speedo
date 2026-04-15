"use client"

import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type Props = {
	label: string
	value: string
	unit?: string
	icon: LucideIcon
	className?: string
	valueClassName?: string
}

export function RecordCard({
	label,
	value,
	unit,
	icon: Icon,
	className,
	valueClassName,
}: Props) {
	return (
		<div
			className={cn(
				"flex items-center gap-4 rounded-[1.6rem] border border-border/70 bg-card/75 p-4 shadow-[0_18px_45px_-30px_hsl(var(--foreground)/0.35)] backdrop-blur transition-transform duration-200 hover:-translate-y-0.5 sm:gap-5 sm:p-5 lg:min-h-32 lg:rounded-[1.8rem]",
				className
			)}
		>
			<div className="flex size-12 shrink-0 items-center justify-center rounded-[1.25rem] border border-border/70 bg-background/80 text-muted-foreground shadow-sm sm:size-14 sm:rounded-[1.4rem]">
				<Icon className="size-5 sm:size-[1.35rem]" aria-hidden />
			</div>
			<div className="min-w-0 flex-1">
				<p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
					{label}
				</p>
				<p
					className={cn(
						"mt-2 flex flex-wrap items-end gap-x-2 gap-y-1 font-display text-[1.95rem] leading-none text-foreground tabular-nums sm:text-[2.2rem] lg:text-[2.4rem]",
						valueClassName
					)}
				>
					{value}
					{unit ? (
						<span className="text-sm font-normal text-muted-foreground/80 sm:text-[0.95rem]">
							{unit}
						</span>
					) : null}
				</p>
			</div>
		</div>
	)
}
