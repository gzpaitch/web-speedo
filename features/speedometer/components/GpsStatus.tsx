"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useTranslations } from "next-intl"

import type { GpsStatus as GpsStatusValue } from "@/features/speedometer/types"
import { cn } from "@/lib/utils"

type Props = {
	status: GpsStatusValue
}

const DOT_COLOR: Record<GpsStatusValue, string> = {
	waiting: "bg-muted-foreground",
	weak: "bg-amber-500",
	ok: "bg-emerald-500",
}

export function GpsStatus({ status }: Props) {
	const t = useTranslations("gps")
	const label = t(status)

	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={status}
				initial={{ opacity: 0, y: -4 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -4 }}
				transition={{ duration: 0.2 }}
				className="flex w-full items-center justify-center gap-2 text-center text-[0.7rem] font-semibold tracking-[0.24em] text-muted-foreground uppercase"
			>
				<span
					className={cn("inline-block size-2 rounded-full", DOT_COLOR[status])}
				/>
				{label}
			</motion.div>
		</AnimatePresence>
	)
}
