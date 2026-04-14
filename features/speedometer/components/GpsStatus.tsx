"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"
import type { GpsStatus as GpsStatusValue } from "@/features/speedometer/types"
import { cn } from "@/lib/utils"

type Props = {
	status: GpsStatusValue
}

const DOT_COLOR: Record<GpsStatusValue, string> = {
	waiting: "bg-muted-foreground",
	weak: "bg-yellow-500",
	ok: "bg-green-500",
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
			>
				<Badge
					variant="outline"
					className="gap-2 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.25em]"
				>
					<span
						className={cn(
							"inline-block size-2 rounded-full",
							DOT_COLOR[status]
						)}
					/>
					{label}
				</Badge>
			</motion.div>
		</AnimatePresence>
	)
}
