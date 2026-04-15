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
	const isRunning = sessionState === "RUNNING"
	const isPaused =
		sessionState === "MANUALLY_PAUSED" || sessionState === "AUTO_PAUSED"

	return (
		<div className="rounded-[1.8rem] border border-border/70 bg-card/70 p-3 shadow-[0_18px_45px_-30px_hsl(var(--foreground)/0.3)] backdrop-blur">
			{isPaused ? (
				<div className="grid grid-cols-2 gap-3">
					<Button
						type="button"
						size="lg"
						variant="default"
						onClick={onResume}
						className="min-h-16 rounded-[1.3rem] text-base shadow-[0_10px_30px_-18px_hsl(var(--primary)/0.9)]"
					>
						<Play className="size-5" /> {t("resume")}
					</Button>
					<Button
						type="button"
						size="lg"
						variant="destructive"
						onClick={() => setConfirmOpen(true)}
						className="min-h-16 rounded-[1.3rem] text-base shadow-sm"
					>
						<Square className="size-5" /> {t("end")}
					</Button>
				</div>
			) : isIdle ? (
				<Button
					type="button"
					size="lg"
					variant="default"
					onClick={onStart}
					className="min-h-16 w-full rounded-[1.3rem] text-base shadow-[0_10px_30px_-18px_hsl(var(--primary)/0.9)]"
				>
					<Timer className="size-5" /> {t("start")}
				</Button>
			) : isRunning ? (
				<Button
					type="button"
					size="lg"
					variant="outline"
					onClick={onPause}
					className="min-h-16 w-full rounded-[1.3rem] text-base border-border/70 bg-background/80 shadow-sm"
				>
					<Pause className="size-5" /> {t("pause")}
				</Button>
			) : null}
			<Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("endConfirmTitle")}</DialogTitle>
						<DialogDescription>{t("endConfirmDescription")}</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<DialogClose asChild>
							<Button type="button" size="lg" className="min-h-12 rounded-full px-6" variant="outline">
								{tCommon("cancel")}
							</Button>
						</DialogClose>
						<Button
							type="button"
							size="lg"
							className="min-h-12 rounded-full px-6"
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
