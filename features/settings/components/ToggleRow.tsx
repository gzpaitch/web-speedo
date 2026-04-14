"use client"

import type { ReactNode } from "react"

import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

type Props = {
	label: string
	description?: string
	checked: boolean
	onCheckedChange: (value: boolean) => void
	disabled?: boolean
	className?: string
	icon?: ReactNode
}

export function ToggleRow({
	label,
	description,
	checked,
	onCheckedChange,
	disabled,
	className,
	icon,
}: Props) {
	return (
		<div
			className={cn(
				"group rounded-2xl px-2 py-4 transition-colors hover:bg-muted/35",
				disabled && "opacity-70",
				className
			)}
		>
			<div className="flex w-full items-center gap-3">
				{icon ? (
					<div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-background/75 text-muted-foreground shadow-sm">
						{icon}
					</div>
				) : null}
				<div className="flex-1">
					<div className="flex min-h-11 items-center">
						<p className="text-[0.98rem] font-medium tracking-tight text-foreground">
							{label}
						</p>
					</div>
					{description ? (
						<p className="mt-1 text-sm leading-5 text-muted-foreground/85">
							{description}
						</p>
					) : null}
				</div>
				<Switch
					checked={checked}
					onCheckedChange={onCheckedChange}
					disabled={disabled}
					aria-label={label}
				/>
			</div>
		</div>
	)
}
