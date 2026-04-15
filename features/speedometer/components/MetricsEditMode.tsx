"use client"

import { AnimatePresence, Reorder, motion, useDragControls } from "motion/react"
import { Check, GripVertical, Pencil, SlidersHorizontal, X } from "lucide-react"
import { useTranslations } from "next-intl"
import * as React from "react"
import { createPortal } from "react-dom"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import type { MetricId } from "@/features/speedometer/types"
import { ALL_METRIC_IDS } from "@/features/speedometer/types"
import { cn } from "@/lib/utils"

type Props = {
	activeIds: readonly MetricId[]
	onToggle: (id: MetricId) => void
	onReorder?: (ids: MetricId[]) => void
}

function ActiveMetricItem({
	id,
	onToggle,
	t,
}: {
	id: MetricId
	onToggle: (id: MetricId) => void
	t: ReturnType<typeof useTranslations>
}) {
	const dragControls = useDragControls()

	return (
		<Reorder.Item
			value={id}
			dragControls={dragControls}
			dragListener={false}
			className="list-none"
			whileDrag={{ scale: 1.02, zIndex: 10 }}
		>
			<div className="flex w-full items-center gap-3 rounded-[1.4rem] border border-primary/30 bg-primary/5 p-4 shadow-sm">
				<div
					className="touch-none cursor-grab text-muted-foreground active:cursor-grabbing"
					onPointerDown={(e) => {
						e.stopPropagation()
						dragControls.start(e)
					}}
				>
					<GripVertical className="size-5" />
				</div>
				<div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-background/80 text-muted-foreground">
					<SlidersHorizontal className="size-4" />
				</div>
				<span className="flex-1 font-semibold tracking-wide text-foreground">
					{t(id)}
				</span>
				<span className="flex items-center gap-3">
					<Check className="size-5 text-primary" />
					<Switch
						checked
						onCheckedChange={() => onToggle(id)}
						aria-label={t(id)}
					/>
				</span>
			</div>
		</Reorder.Item>
	)
}

export function MetricsEditMode({ activeIds, onToggle, onReorder }: Props) {
	const t = useTranslations("metrics")
	const [open, setOpen] = React.useState(false)
	const [mounted, setMounted] = React.useState(false)
	const [isLandscape, setIsLandscape] = React.useState(false)

	const [orderedActiveIds, setOrderedActiveIds] = React.useState<MetricId[]>(
		() => [...activeIds],
	)

	React.useEffect(() => {
		setMounted(true)
	}, [])

	React.useEffect(() => {
		setOrderedActiveIds((prev) => {
			const activeSet = new Set(activeIds)
			const kept = prev.filter((id) => activeSet.has(id))
			const added = [...activeIds].filter((id) => !prev.includes(id))
			return [...kept, ...added]
		})
	}, [activeIds])

	React.useEffect(() => {
		if (typeof window === "undefined") return
		const mq = window.matchMedia("(orientation: landscape)")
		const update = () => setIsLandscape(mq.matches)
		update()
		mq.addEventListener("change", update)
		return () => mq.removeEventListener("change", update)
	}, [])

	const inactiveIds = ALL_METRIC_IDS.filter((id) => !activeIds.includes(id))

	const handleReorder = (newOrder: MetricId[]) => {
		setOrderedActiveIds(newOrder)
		onReorder?.(newOrder)
	}

	const panelVariants = isLandscape
		? {
				hidden: { x: "100%", opacity: 0 },
				visible: { x: 0, opacity: 1 },
				exit: { x: "100%", opacity: 0 },
			}
		: {
				hidden: { y: "100%", opacity: 0 },
				visible: { y: 0, opacity: 1 },
				exit: { y: "100%", opacity: 0 },
			}

	const portal = mounted
		? createPortal(
				<AnimatePresence>
					{open && (
						<>
							<motion.div
								key="backdrop"
								className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								onClick={() => setOpen(false)}
							/>
							<motion.div
								key="panel"
								className={cn(
									"fixed z-50 flex flex-col outline-none",
									isLandscape
										? "inset-y-3 right-3 h-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-md rounded-[2rem] border border-border/70 bg-background/96 shadow-2xl backdrop-blur"
										: "inset-x-0 bottom-0 mt-24 max-h-[85dvh] rounded-t-[2rem] border border-border/70 bg-background/96 backdrop-blur",
								)}
								variants={panelVariants}
								initial="hidden"
								animate="visible"
								exit="exit"
								transition={{ type: "spring", damping: 30, stiffness: 300 }}
							>
								<div
									className={cn(
										"mx-auto rounded-full bg-muted",
										isLandscape ? "mt-3 h-10 w-1.5" : "mt-4 h-1.5 w-15",
									)}
								/>
								<div className="flex min-h-0 flex-1 flex-col p-4 pb-4 sm:p-6 sm:pb-6">
									<div className="mb-4 flex items-start justify-between gap-3 sm:mb-6">
										<div className="flex items-start gap-3">
											<div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-background/80 text-muted-foreground shadow-sm">
												<SlidersHorizontal className="size-5" />
											</div>
											<div className="min-w-0">
												<p className="text-lg font-semibold tracking-tight sm:text-xl">
													{t("editTitle")}
												</p>
												<p className="mt-1 text-sm leading-relaxed text-muted-foreground">
													{t("editHint")}
												</p>
											</div>
										</div>
										<Button
											type="button"
											size="icon-sm"
											variant="ghost"
											aria-label="Close"
											className="rounded-full border border-border/70 bg-background/70"
											onClick={() => setOpen(false)}
										>
											<X className="size-4" />
										</Button>
									</div>

									<div className="min-h-0 overflow-y-auto pr-1">
										{orderedActiveIds.length > 0 && (
											<Reorder.Group
												axis="y"
												values={orderedActiveIds}
												onReorder={handleReorder}
												className="mb-3 flex flex-col gap-3 list-none p-0 m-0"
											>
												{orderedActiveIds.map((id) => (
													<ActiveMetricItem
														key={id}
														id={id}
														onToggle={onToggle}
														t={t}
													/>
												))}
											</Reorder.Group>
										)}

										{inactiveIds.length > 0 && (
											<ul className="space-y-3">
												{inactiveIds.map((id) => (
													<li key={id}>
														<label
															className={cn(
																"flex w-full cursor-pointer items-center gap-3 rounded-[1.4rem] border border-border/70 bg-card/70 p-4 shadow-sm transition-all",
																"hover:-translate-y-0.5 hover:bg-card/90",
															)}
														>
															<input
																type="checkbox"
																className="sr-only"
																checked={false}
																onChange={() => onToggle(id)}
															/>
															<div className="size-5" />
															<div className="flex size-10 items-center justify-center rounded-2xl border border-border/70 bg-background/80 text-muted-foreground">
																<SlidersHorizontal className="size-4" />
															</div>
															<span className="flex-1 font-semibold tracking-wide text-foreground">
																{t(id)}
															</span>
															<Switch
																checked={false}
																onCheckedChange={() => onToggle(id)}
																className="pointer-events-none"
																tabIndex={-1}
																aria-hidden
															/>
														</label>
													</li>
												))}
											</ul>
										)}
									</div>
								</div>
							</motion.div>
						</>
					)}
				</AnimatePresence>,
				document.body,
			)
		: null

	return (
		<div className="relative flex justify-center">
			<Button
				type="button"
				variant="outline"
				size="icon"
				className="size-11 rounded-full border-border/70 bg-background/80 shadow-sm backdrop-blur"
				aria-label={t("editTitle")}
				title={t("editTitle")}
				onClick={() => setOpen(true)}
			>
				<Pencil className="size-4.5" />
			</Button>
			{portal}
		</div>
	)
}
