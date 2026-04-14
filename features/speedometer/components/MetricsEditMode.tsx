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

	return (
		<div className="relative flex justify-center">
			<Drawer.Root open={open} onOpenChange={setOpen}>
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
					<Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[2rem] border border-border/70 bg-background/96 outline-none backdrop-blur">
						<div className="mx-auto mt-4 h-1.5 w-[60px] rounded-full bg-muted" />
						<div className="p-6 pb-12">
							<div className="mb-6 flex items-start justify-between">
								<div className="flex items-start gap-3">
									<div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-background/80 text-muted-foreground shadow-sm">
										<SlidersHorizontal className="size-5" />
									</div>
									<div>
										<Drawer.Title className="text-xl font-semibold tracking-tight">
											{t("editTitle")}
										</Drawer.Title>
										<Drawer.Description className="mt-1 text-sm text-muted-foreground">
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
							<ul className="space-y-3">
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
