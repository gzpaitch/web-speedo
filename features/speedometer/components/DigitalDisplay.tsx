"use client"

import { AnimatePresence, motion, useSpring, useTransform } from "framer-motion"
import * as React from "react"

import { cn } from "@/lib/utils"

type Props = {
	/** Current speed (m/s → caller passes the already-converted km/h or mph value). */
	value: number
	unit: string
	/** Slight dim / fade when session is auto-paused. */
	dimmed?: boolean
	/** Pulses the number when the speed alert is active. */
	alerting?: boolean
	/** Font-size class to apply — changes between portrait and landscape. */
	sizeClassName?: string
}

/**
 * Animated digital speedometer display (PRD §2 Speedometer).
 *
 * Uses a framer-motion spring to ease between numeric values, producing
 * the odometer-style transition the PRD asks for.
 */
export function DigitalDisplay({
	value,
	unit,
	dimmed = false,
	alerting = false,
	sizeClassName = "text-[min(42vw,16rem)] leading-none landscape:text-[12rem]",
}: Props) {
	const spring = useSpring(value, {
		stiffness: 80,
		damping: 18,
		mass: 0.6,
	})

	React.useEffect(() => {
		spring.set(Number.isFinite(value) ? value : 0)
	}, [value, spring])

	const display = useTransform(spring, (latest) => {
		const rounded = Math.max(0, Math.round(latest))
		return rounded.toString().padStart(2, "0")
	})

	return (
		<div
			className={cn(
				"relative flex flex-col items-center justify-center font-display tabular-nums transition-opacity duration-300",
				dimmed && "opacity-40"
			)}
		>
			<div className="pointer-events-none absolute inset-x-[-12%] top-1/2 h-36 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.12),transparent_68%)] blur-2xl" />
			<AnimatePresence>
				<motion.span
					key="speed"
					className={cn(
						"relative text-foreground drop-shadow-[0_20px_30px_hsl(var(--foreground)/0.08)]",
						sizeClassName,
						alerting &&
							"animate-pulse text-destructive drop-shadow-[0_0_18px_rgb(var(--destructive))]"
					)}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
				>
					<motion.span>{display}</motion.span>
				</motion.span>
			</AnimatePresence>
			<span className="mt-1 text-[1.35rem] uppercase tracking-[0.34em] text-muted-foreground/80">
				{unit}
			</span>
		</div>
	)
}
