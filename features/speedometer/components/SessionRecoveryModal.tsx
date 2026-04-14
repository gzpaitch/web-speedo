"use client"

import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { useSettings } from "@/features/settings/hooks/useSettings"
import type { SessionDraft } from "@/features/speedometer/types"
import {
	formatDistance,
	formatDuration,
} from "@/features/speedometer/utils/metrics"

type SessionRecoveryModalProps = {
	draft: SessionDraft | null
	open: boolean
	onResume: () => void
	onDiscard: () => void
}

export function SessionRecoveryModal({
	draft,
	open,
	onResume,
	onDiscard,
}: SessionRecoveryModalProps) {
	const t = useTranslations("session")
	const tCommon = useTranslations("common")
	const { settings } = useSettings()

	if (!draft) {
		return null
	}

	const distance = formatDistance(draft.distanceMeters, settings.units)

	return (
		<Dialog open={open}>
			<DialogContent
				showCloseButton={false}
				onPointerDownOutside={(event) => event.preventDefault()}
			>
				<DialogHeader>
					<DialogTitle>{t("recoveryTitle")}</DialogTitle>
					<DialogDescription>{t("recoveryDescription")}</DialogDescription>
				</DialogHeader>

				<div className="grid gap-3 rounded-3xl border border-border bg-muted/40 p-4">
					<div className="flex items-baseline justify-between gap-4">
						<span className="text-sm text-muted-foreground">
							{t("recoveryTime")}
						</span>
						<span className="font-display text-3xl tabular-nums text-foreground">
							{formatDuration(draft.movementMs)}
						</span>
					</div>
					<div className="flex items-baseline justify-between gap-4">
						<span className="text-sm text-muted-foreground">
							{t("recoveryDistance")}
						</span>
						<span className="font-display text-3xl tabular-nums text-foreground">
							{distance.value}
							<span className="ml-2 text-sm uppercase tracking-[0.2em] text-muted-foreground">
								{distance.unit}
							</span>
						</span>
					</div>
				</div>

				<DialogFooter>
					<Button type="button" size="lg" className="min-h-12 rounded-full px-6" variant="outline" onClick={onDiscard}>
						{tCommon("discard")}
					</Button>
					<Button type="button" size="lg" className="min-h-12 rounded-full px-6" onClick={onResume}>
						{tCommon("resume")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
