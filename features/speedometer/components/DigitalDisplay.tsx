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
	sizeClassName = "text-[18rem] leading-none landscape:text-[12rem]",
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
		if (latest < 10) {
			return latest.toFixed(1)
		}
		return Math.round(latest).toString()
	})

	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center font-display tabular-nums transition-opacity duration-300",
				dimmed && "opacity-40"
			)}
		>
			<AnimatePresence>
				<motion.span
					key="speed"
					className={cn(
						"text-foreground",
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
			<span className="mt-1 text-2xl uppercase tracking-[0.3em] text-muted-foreground opacity-70">
				{unit}
			</span>
		</div>
	)
}
