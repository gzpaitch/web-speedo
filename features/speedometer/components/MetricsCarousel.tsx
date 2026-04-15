"use client"

import useEmblaCarousel from "embla-carousel-react"
import * as React from "react"

import type { MetricValue } from "@/features/speedometer/hooks/useMetrics"
import { cn } from "@/lib/utils"

import { MetricCard } from "./MetricCard"

type Props = {
	metrics: MetricValue[]
	className?: string
}

function chunkMetrics(
	metrics: MetricValue[],
	itemsPerPage: number
): MetricValue[][] {
	const pages: MetricValue[][] = []
	for (let i = 0; i < metrics.length; i += itemsPerPage) {
		pages.push(metrics.slice(i, i + itemsPerPage))
	}
	return pages
}

export function MetricsCarousel({ metrics, className }: Props) {
	const [isLandscape, setIsLandscape] = React.useState(false)
	const itemsPerPage = isLandscape ? 4 : 2
	const pages = React.useMemo(
		() => chunkMetrics(metrics, itemsPerPage),
		[metrics, itemsPerPage]
	)
	const canLoop = pages.length > 1
	const [emblaRef, emblaApi] = useEmblaCarousel({
		align: "start",
		loop: canLoop,
		dragFree: false,
		containScroll: "trimSnaps",
	})
	const [selected, setSelected] = React.useState(0)

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

	React.useEffect(() => {
		if (!emblaApi) {
			return
		}
		const sync = () => setSelected(emblaApi.selectedScrollSnap())
		sync()
		emblaApi.on("select", sync)
		emblaApi.on("reInit", sync)
		return () => {
			emblaApi.off("select", sync)
			emblaApi.off("reInit", sync)
		}
	}, [emblaApi])

	if (metrics.length === 0) {
		return null
	}

	return (
		<div className={cn("w-full", className)} data-embla-inner>
			<div
				key={isLandscape ? "landscape" : "portrait"}
				className={cn("overflow-hidden", isLandscape && "h-full")}
				ref={emblaRef}
			>
				<div className={cn("flex touch-pan-y", isLandscape && "h-full")}>
					{pages.map((page, index) => (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: page identity is stable for the current snapshot
							key={index}
							className={cn(
								"min-w-0 flex-[0_0_100%] px-0.5",
								isLandscape && "h-full"
							)}
						>
							<div
								className={cn(
									"grid grid-cols-2 gap-3",
									isLandscape && "h-full grid-rows-2 gap-2.5"
								)}
							>
								{page.length === 1 ? (
									<div className="col-span-2 flex h-full items-center justify-center">
										<div className="w-full">
											<MetricCard metric={page[0]} centered borderless />
										</div>
									</div>
								) : page.length === 3 ? (
									<>
										{page.slice(0, 2).map((metric) => (
											<MetricCard key={metric.id} metric={metric} />
										))}
										<div className="col-span-2 flex justify-center">
											<div className="w-1/2">
												<MetricCard metric={page[2]} centered borderless />
											</div>
										</div>
									</>
								) : (
									page.map((metric) => (
										<MetricCard key={metric.id} metric={metric} />
									))
								)}
							</div>
						</div>
					))}
				</div>
			</div>
			{pages.length > 1 ? (
				<div className="mt-4 flex items-center justify-center gap-2 pb-4">
					{pages.map((_, index) => (
						<button
							// biome-ignore lint/suspicious/noArrayIndexKey: dot index maps to page slot
							key={index}
							type="button"
							onClick={() => emblaApi?.scrollTo(index)}
							className={cn(
								"h-2.5 rounded-full border border-transparent transition-all",
								selected === index
									? "w-7 bg-foreground shadow-[0_0_18px_hsl(var(--foreground)/0.22)]"
									: "w-2.5 bg-border/80 hover:bg-border"
							)}
							aria-label={`Go to metrics page ${index + 1}`}
							aria-pressed={selected === index}
						/>
					))}
				</div>
			) : null}
		</div>
	)
}
