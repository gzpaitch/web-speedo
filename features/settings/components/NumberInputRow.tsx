"use client"

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type Props = {
	label: string
	description?: string
	/** `null` renders an empty field. */
	value: number | null
	onChange: (value: number | null) => void
	placeholder?: string
	min?: number
	max?: number
	step?: number
	className?: string
	icon?: ReactNode
}

export function NumberInputRow({
	label,
	description,
	value,
	onChange,
	placeholder,
	min,
	max,
	step,
	className,
	icon,
}: Props) {
	return (
		<label
			className={cn(
				"group rounded-[1.4rem] border border-transparent px-3 py-3 transition-colors",
				"hover:border-border/70 hover:bg-muted/35",
				className
			)}
		>
			<span className="flex w-full items-center gap-3">
				{icon ? (
					<span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-background/75 text-muted-foreground shadow-sm">
						{icon}
					</span>
				) : null}
				<span className="flex-1">
					<span className="flex min-h-11 items-center">
						<span className="block text-[0.98rem] font-medium tracking-tight text-foreground">
							{label}
						</span>
					</span>
					{description ? (
						<span className="mt-1 block text-sm leading-5 text-muted-foreground/85">
							{description}
						</span>
					) : null}
				</span>
				<input
					type="number"
					inputMode="numeric"
					min={min}
					max={max}
					step={step}
					placeholder={placeholder}
					value={value ?? ""}
					onChange={(event) => {
						const raw = event.target.value
						if (raw === "") {
							onChange(null)
							return
						}
						const parsed = Number(raw)
						if (Number.isFinite(parsed)) {
							// Enforce min/max before propagating — HTML attributes are
							// only advisory and don't block out-of-range typed values.
							let clamped = parsed
							if (min !== undefined && clamped < min) clamped = min
							if (max !== undefined && clamped > max) clamped = max
							onChange(clamped)
						}
					}}
					className={cn(
						"h-13 w-24 shrink-0 rounded-2xl border border-border/70 bg-background/80 px-4 text-right text-base font-medium tabular-nums text-foreground shadow-sm outline-none transition",
						"placeholder:text-muted-foreground/55 focus:border-ring focus:bg-background focus:ring-4 focus:ring-ring/10"
					)}
				/>
			</span>
		</label>
	)
}
