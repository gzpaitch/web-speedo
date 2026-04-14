"use client"

import { Pause, Play, Square, Timer } from "lucide-react"
import { useTranslations } from "next-intl"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import type { SessionState } from "@/features/speedometer/types"
import { cn } from "@/lib/utils"

type Props = {
	sessionState: SessionState
	onStart: () => void
	onPause: () => void
	onResume: () => void
	onEnd: () => void
}

export function SessionControls({
	sessionState,
	onStart,
	onPause,
	onResume,
	onEnd,
}: Props) {
	const t = useTranslations("session")
	const tCommon = useTranslations("common")
	const [confirmOpen, setConfirmOpen] = React.useState(false)

	const isIdle = sessionState === "IDLE"
	const isPaused =
		sessionState === "MANUALLY_PAUSED" || sessionState === "AUTO_PAUSED"
	const pauseButtonLabel = isPaused ? t("resume") : t("pause")

	return (
		<div className="grid grid-cols-2 gap-3 rounded-[1.8rem] border border-border/70 bg-card/70 p-3 shadow-[0_18px_45px_-30px_hsl(var(--foreground)/0.3)] backdrop-blur">
			<Button
				type="button"
				size="lg"
				variant={isIdle || isPaused ? "default" : "outline"}
				onClick={isIdle ? onStart : isPaused ? onResume : onPause}
				aria-pressed={isPaused}
				data-state={isIdle ? "idle" : isPaused ? "paused" : "running"}
				className={cn(
					"min-h-16 rounded-[1.3rem] text-base shadow-sm",
					isIdle || isPaused
						? "shadow-[0_10px_30px_-18px_hsl(var(--primary)/0.9)]"
						: "border-border/70 bg-background/80"
				)}
			>
				{isIdle ? (
					<>
						<Timer className="size-5" /> {t("start")}
					</>
				) : isPaused ? (
					<>
						<Play className="size-5" /> {pauseButtonLabel}
					</>
				) : (
					<>
						<Pause className="size-5" /> {pauseButtonLabel}
					</>
				)}
			</Button>
			<Button
				type="button"
				size="lg"
				variant="destructive"
				disabled={isIdle}
				onClick={() => setConfirmOpen(true)}
				data-state={isIdle ? "idle" : "active"}
				className="min-h-16 rounded-[1.3rem] text-base shadow-sm"
			>
				<Square className="size-5" /> {t("end")}
			</Button>
			<Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("endConfirmTitle")}</DialogTitle>
						<DialogDescription>{t("endConfirmDescription")}</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<DialogClose asChild>
							<Button type="button" variant="outline">
								{tCommon("cancel")}
							</Button>
						</DialogClose>
						<Button
							type="button"
							variant="destructive"
							onClick={() => {
								setConfirmOpen(false)
								onEnd()
							}}
						>
							{t("end")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
