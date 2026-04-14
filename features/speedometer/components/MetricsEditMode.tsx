"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Check, Pencil, X } from "lucide-react"
import { useTranslations } from "next-intl"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import type { MetricId } from "@/features/speedometer/types"
import { ALL_METRIC_IDS } from "@/features/speedometer/types"
import { cn } from "@/lib/utils"

type Props = {
	activeIds: readonly MetricId[]
	onToggle: (id: MetricId) => void
}

export function MetricsEditMode({ activeIds, onToggle }: Props) {
	const t = useTranslations("metrics")
	const [open, setOpen] = React.useState(false)
	const containerRef = React.useRef<HTMLDivElement | null>(null)

	React.useEffect(() => {
		if (!open) {
			return
		}
		const onPointerDown = (event: MouseEvent | TouchEvent) => {
			if (!containerRef.current) {
				return
			}
			if (!containerRef.current.contains(event.target as Node)) {
				setOpen(false)
			}
		}
		document.addEventListener("mousedown", onPointerDown)
		document.addEventListener("touchstart", onPointerDown)
		return () => {
			document.removeEventListener("mousedown", onPointerDown)
			document.removeEventListener("touchstart", onPointerDown)
		}
	}, [open])

	return (
		<div className="relative flex justify-end">
			<Button
				type="button"
				size="icon"
				variant="ghost"
				onClick={() => setOpen((prev) => !prev)}
				className="size-12 min-h-12 min-w-12"
				aria-label={t("editTitle")}
			>
				<Pencil className="size-5" />
			</Button>
			<AnimatePresence>
				{open ? (
					<motion.div
						ref={containerRef}
						initial={{ opacity: 0, scale: 0.95, y: -8 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: -8 }}
						transition={{ duration: 0.15 }}
						className="absolute right-0 top-full z-20 mt-2 w-64 rounded-xl border border-border bg-background p-4 shadow-lg"
					>
						<div className="mb-3 flex items-start justify-between">
							<div>
								<p className="text-sm font-semibold">{t("editTitle")}</p>
								<p className="text-xs text-muted-foreground">{t("editHint")}</p>
							</div>
							<Button
								type="button"
								size="icon-sm"
								variant="ghost"
								onClick={() => setOpen(false)}
								aria-label="Close"
							>
								<X className="size-4" />
							</Button>
						</div>
						<ul className="space-y-1.5">
							{ALL_METRIC_IDS.map((id) => {
								const active = activeIds.includes(id)
								return (
									<li key={id}>
										{/* Using a div instead of a button avoids nesting
										    interactive controls (Switch is already interactive). */}
										<div
											role="checkbox"
											aria-checked={active}
											tabIndex={0}
											onClick={() => onToggle(id)}
											onKeyDown={(e) => {
												if (e.key === " " || e.key === "Enter") {
													e.preventDefault()
													onToggle(id)
												}
											}}
											className={cn(
												"flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-2 text-left text-sm transition",
												"min-h-12 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
											)}
										>
											<span className="text-foreground">{t(id)}</span>
											<span className="flex items-center gap-2">
												{active ? (
													<Check className="size-4 text-foreground" />
												) : null}
												<Switch
													checked={active}
													onCheckedChange={() => onToggle(id)}
													className="pointer-events-none"
													tabIndex={-1}
													aria-hidden
												/>
											</span>
										</div>
									</li>
								)
							})}
						</ul>
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	)
}
