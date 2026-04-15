"use client"

import type { ReactNode } from "react"
import * as React from "react"

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
	className,
	icon,
}: Props) {
	const [draftValue, setDraftValue] = React.useState(
		value === null ? "" : String(value)
	)

	React.useEffect(() => {
		setDraftValue(value === null ? "" : String(value))
	}, [value])

	const commitValue = React.useCallback(
		(rawValue: string) => {
			if (rawValue === "") {
				onChange(null)
				return
			}

			const parsed = Number(rawValue)
			if (!Number.isFinite(parsed)) {
				setDraftValue(value === null ? "" : String(value))
				return
			}

			let normalized = parsed
			if (min !== undefined && normalized < min) normalized = min
			if (max !== undefined && normalized > max) normalized = max

			setDraftValue(String(normalized))
			onChange(normalized)
		},
		[max, min, onChange, value]
	)

	return (
		<label
			className={cn(
				"group rounded-2xl px-2 py-4 transition-colors hover:bg-muted/35",
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
					type="text"
					inputMode="numeric"
					pattern="[0-9]*"
					placeholder={placeholder}
					value={draftValue}
					onChange={(event) => {
						const raw = event.target.value

						if (raw === "" || /^\d+$/.test(raw)) {
							setDraftValue(raw)
						}
					}}
					onBlur={() => commitValue(draftValue)}
					onKeyDown={(event) => {
						if (event.key === "Enter") {
							commitValue(draftValue)
							event.currentTarget.blur()
							return
						}

						if (event.key === "Escape") {
							setDraftValue(value === null ? "" : String(value))
							event.currentTarget.blur()
						}
					}}
					className={cn(
						"h-14 w-28 shrink-0 rounded-2xl border border-border/70 bg-background/80 px-4 text-right text-base font-medium tabular-nums text-foreground shadow-sm outline-none transition",
						"placeholder:text-muted-foreground/55 focus:border-ring focus:bg-background focus:ring-4 focus:ring-ring/10"
					)}
				/>
			</span>
		</label>
	)
}
