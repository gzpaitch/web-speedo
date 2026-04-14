"use client"

import useEmblaCarousel from "embla-carousel-react"
import * as React from "react"

import type { MetricValue } from "@/features/speedometer/hooks/useMetrics"
import { cn } from "@/lib/utils"

import { MetricCard } from "./MetricCard"

type Props = {
	metrics: MetricValue[]
}

function chunkPairs(metrics: MetricValue[]): MetricValue[][] {
	const pairs: MetricValue[][] = []
	for (let i = 0; i < metrics.length; i += 2) {
		pairs.push(metrics.slice(i, i + 2))
	}
	return pairs
}

export function MetricsCarousel({ metrics }: Props) {
	const pairs = React.useMemo(() => chunkPairs(metrics), [metrics])
	const [emblaRef, emblaApi] = useEmblaCarousel({
		align: "start",
		loop: false,
		dragFree: false,
		containScroll: "trimSnaps",
	})
	const [selected, setSelected] = React.useState(0)

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
		<div className="w-full">
			<div className="overflow-hidden" ref={emblaRef}>
				<div className="flex touch-pan-y">
					{pairs.map((pair, index) => (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: pair identity is stable for the current snapshot
							key={index}
							className="min-w-0 flex-[0_0_100%] px-1"
						>
							<div className="grid grid-cols-2 gap-3">
								{pair.length === 1 ? (
									<MetricCard metric={pair[0]} centered />
								) : (
									pair.map((m) => <MetricCard key={m.id} metric={m} />)
								)}
							</div>
						</div>
					))}
				</div>
			</div>
			{pairs.length > 1 ? (
				<div className="mt-3 flex items-center justify-center gap-2">
					{pairs.map((_, index) => (
						<button
							// biome-ignore lint/suspicious/noArrayIndexKey: dot index maps to pair slot
							key={index}
							type="button"
							onClick={() => emblaApi?.scrollTo(index)}
							className={cn(
								"h-2 rounded-full transition-all",
								selected === index ? "w-6 bg-foreground" : "w-2 bg-border"
							)}
							aria-label={`Go to metric pair ${index + 1}`}
							aria-pressed={selected === index}
						/>
					))}
				</div>
			) : null}
		</div>
	)
}
