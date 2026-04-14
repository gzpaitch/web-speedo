"use client"

import { Pause, Play, Square } from "lucide-react"
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
	onPause: () => void
	onResume: () => void
	onEnd: () => void
}

export function SessionControls({
	sessionState,
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

	return (
		<div className="grid grid-cols-2 gap-3">
			<Button
				type="button"
				size="lg"
				variant="outline"
				disabled={isIdle}
				onClick={isPaused ? onResume : onPause}
				className="min-h-16 text-base"
			>
				{isPaused ? (
					<>
						<Play className="size-5" /> {t("resume")}
					</>
				) : (
					<>
						<Pause className="size-5" /> {t("pause")}
					</>
				)}
			</Button>
			<Button
				type="button"
				size="lg"
				variant="destructive"
				disabled={isIdle}
				onClick={() => setConfirmOpen(true)}
				className="min-h-16 text-base"
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
