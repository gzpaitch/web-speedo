"use client"

import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

type Props = {
	label: string
	description?: string
	checked: boolean
	onCheckedChange: (value: boolean) => void
	disabled?: boolean
	className?: string
}

export function ToggleRow({
	label,
	description,
	checked,
	onCheckedChange,
	disabled,
	className,
}: Props) {
	return (
		<div
			className={cn(
				"flex min-h-14 items-center justify-between gap-4 px-1 py-2",
				className
			)}
		>
			<div className="flex-1">
				<p className="text-base text-foreground">{label}</p>
				{description ? (
					<p className="text-sm text-muted-foreground opacity-80">
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
	)
}
