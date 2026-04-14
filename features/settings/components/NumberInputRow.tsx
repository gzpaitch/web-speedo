"use client"

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
}: Props) {
	return (
		<label
			className={cn(
				"flex min-h-14 items-center justify-between gap-4 px-1 py-2",
				className
			)}
		>
			<span className="flex-1">
				<span className="block text-base text-foreground">{label}</span>
				{description ? (
					<span className="block text-sm text-muted-foreground opacity-80">
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
				className="h-12 w-24 rounded-md border border-border bg-background px-3 text-right text-base tabular-nums text-foreground outline-none focus:border-ring"
			/>
		</label>
	)
}
