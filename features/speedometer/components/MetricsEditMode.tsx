"use client"

import { Check, Pencil, SlidersHorizontal, X } from "lucide-react"
import { useTranslations } from "next-intl"
import * as React from "react"
import { Drawer } from "vaul"

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
	const [isLandscape, setIsLandscape] = React.useState(false)

	React.useEffect(() => {
		if (typeof window === "undefined") {
			return
		}

		const mediaQuery = window.matchMedia("(orientation: landscape)")
		const updateOrientation = () => setIsLandscape(mediaQuery.matches)

		updateOrientation()

		if (typeof mediaQuery.addEventListener === "function") {
			mediaQuery.addEventListener("change", updateOrientation)
			return () => mediaQuery.removeEventListener("change", updateOrientation)
		}

		mediaQuery.addListener(updateOrientation)
		return () => mediaQuery.removeListener(updateOrientation)
	}, [])

	return (
		<div className="relative flex justify-center">
			<Drawer.Root
				open={open}
				onOpenChange={setOpen}
				direction={isLandscape ? "right" : "bottom"}
			>
				<Drawer.Trigger asChild>
					<Button
						type="button"
						variant="outline"
						size="icon"
						className="size-11 rounded-full border-border/70 bg-background/80 shadow-sm backdrop-blur"
						aria-label={t("editTitle")}
						title={t("editTitle")}
					>
						<Pencil className="size-4.5" />
					</Button>
				</Drawer.Trigger>
				<Drawer.Portal>
					<Drawer.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
					<Drawer.Content
						className={cn(
							"fixed z-50 flex outline-none",
							isLandscape
								? "inset-y-3 right-3 left-3 h-auto max-h-[calc(100dvh-1.5rem)] flex-col rounded-[2rem] border border-border/70 bg-background/96 shadow-2xl backdrop-blur sm:left-auto sm:w-full sm:max-w-md"
								: "inset-x-0 bottom-0 mt-24 max-h-[85dvh] flex-col rounded-t-[2rem] border border-border/70 bg-background/96 backdrop-blur"
						)}
					>
						<div
							className={cn(
								"mx-auto rounded-full bg-muted",
								isLandscape ? "mt-3 h-10 w-1.5" : "mt-4 h-1.5 w-15"
							)}
						/>
						<div className="flex min-h-0 flex-1 flex-col p-4 pb-4 sm:p-6 sm:pb-6">
							<div className="mb-4 flex items-start justify-between gap-3 sm:mb-6">
								<div className="flex items-start gap-3">
									<div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-background/80 text-muted-foreground shadow-sm">
										<SlidersHorizontal className="size-5" />
									</div>
									<div className="min-w-0">
										<Drawer.Title className="text-lg font-semibold tracking-tight sm:text-xl">
											{t("editTitle")}
										</Drawer.Title>
										<Drawer.Description className="mt-1 text-sm leading-relaxed text-muted-foreground">
											{t("editHint")}
										</Drawer.Description>
									</div>
								</div>
								<Drawer.Close asChild>
									<Button
										type="button"
										size="icon-sm"
										variant="ghost"
										aria-label="Close"
										className="rounded-full border border-border/70 bg-background/70"
									>
										<X className="size-4" />
									</Button>
								</Drawer.Close>
							</div>
							<ul className="min-h-0 space-y-3 overflow-y-auto pr-1">
								{ALL_METRIC_IDS.map((id) => {
									const active = activeIds.includes(id)
									return (
										<li key={id}>
											<label
												className={cn(
													"flex w-full cursor-pointer items-center justify-between rounded-[1.4rem] border border-border/70 bg-card/70 p-4 transition-all shadow-sm",
													"hover:-translate-y-0.5 hover:bg-card/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
													active && "border-primary/30 bg-primary/5"
												)}
											>
												<input
													type="checkbox"
													className="sr-only"
													checked={active}
													onChange={() => onToggle(id)}
												/>
												<div className="flex items-center gap-3">
													<div className="flex size-10 items-center justify-center rounded-2xl border border-border/70 bg-background/80 text-muted-foreground">
														<SlidersHorizontal className="size-4" />
													</div>
													<span className="font-semibold tracking-wide text-foreground">
														{t(id)}
													</span>
												</div>
												<span className="flex items-center gap-3">
													{active ? (
														<Check className="size-5 text-primary" />
													) : null}
													<Switch
														checked={active}
														onCheckedChange={() => onToggle(id)}
														className="pointer-events-none"
														tabIndex={-1}
														aria-hidden
													/>
												</span>
											</label>
										</li>
									)
								})}
							</ul>
						</div>
					</Drawer.Content>
				</Drawer.Portal>
			</Drawer.Root>
		</div>
	)
}
