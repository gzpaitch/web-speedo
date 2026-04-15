"use client"

import { cn } from "@/lib/utils"

type SlideIndicatorProps = {
	count: number
	selectedIndex: number
	onSelect: (index: number) => void
	labels: string[]
}

export function SlideIndicator({
	count,
	selectedIndex,
	onSelect,
	labels,
}: SlideIndicatorProps) {
	if (count <= 1) {
		return null
	}

	return (
		<div
			className="pointer-events-auto flex items-center justify-center gap-2 rounded-full border border-border/80 bg-background/90 px-3 py-2 shadow-sm backdrop-blur"
			role="tablist"
			aria-label="Slides"
		>
			{Array.from({ length: count }, (_, index) => {
				const isSelected = selectedIndex === index
				const label = labels[index] ?? `${index + 1}`

				return (
					<button
						key={label}
						type="button"
						role="tab"
						aria-selected={isSelected}
						aria-label={label}
						onClick={() => onSelect(index)}
						className={cn(
							"h-2.5 rounded-full transition-all",
							isSelected ? "w-8 bg-foreground" : "w-2.5 bg-border"
						)}
					/>
				)
			})}
		</div>
	)
}
