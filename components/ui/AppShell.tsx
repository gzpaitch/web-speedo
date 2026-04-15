"use client"

import useEmblaCarousel from "embla-carousel-react"
import { useTranslations } from "next-intl"
import * as React from "react"

import { SettingsScreen } from "@/features/settings/components/SettingsScreen"
import { SessionRecoveryModal } from "@/features/speedometer/components/SessionRecoveryModal"
import { SpeedometerScreen } from "@/features/speedometer/components/SpeedometerScreen"
import type { SessionFinalSummary } from "@/features/speedometer/hooks/useSession"
import type { SessionDraft } from "@/features/speedometer/types"
import { StatsScreen } from "@/features/stats/components/StatsScreen"
import type { useRecords } from "@/features/stats/hooks/useRecords"
import { clearSessionDraft, getSessionDraft } from "@/lib/storage"

import { SlideIndicator } from "./SlideIndicator"

const START_INDEX = 1

export function AppShell() {
	const tSession = useTranslations("session")
	const tSettings = useTranslations("settings")
	const tStats = useTranslations("stats")
	const recordsRef = React.useRef<ReturnType<typeof useRecords> | null>(null)
	const [selectedIndex, setSelectedIndex] = React.useState(START_INDEX)
	const [draft, setDraft] = React.useState<SessionDraft | null>(null)
	const [recoveryOpen, setRecoveryOpen] = React.useState(false)
	const [recoveryDraft, setRecoveryDraft] = React.useState<SessionDraft | null>(
		null
	)
	const [emblaRef, emblaApi] = useEmblaCarousel({
		align: "start",
		containScroll: "trimSnaps",
		dragFree: false,
		loop: true,
		startIndex: START_INDEX,
		watchDrag: (_, event) => {
			const target = event.target
			return !(
				target instanceof HTMLElement && target.closest("[data-embla-inner]")
			)
		},
	})

	React.useEffect(() => {
		const existingDraft = getSessionDraft()
		if (!existingDraft) {
			return
		}

		setDraft(existingDraft)
		setRecoveryOpen(true)
	}, [])

	React.useEffect(() => {
		if (!emblaApi) {
			return
		}

		const sync = () => {
			setSelectedIndex(emblaApi.selectedScrollSnap())
		}

		sync()
		emblaApi.on("select", sync)
		emblaApi.on("reInit", sync)

		return () => {
			emblaApi.off("select", sync)
			emblaApi.off("reInit", sync)
		}
	}, [emblaApi])

	const handleSessionEnd = React.useCallback((summary: SessionFinalSummary) => {
		recordsRef.current?.applySession(summary)
	}, [])

	const handleRecoveryResume = React.useCallback(() => {
		if (!draft) {
			return
		}
		setRecoveryDraft(draft)
		setRecoveryOpen(false)
		emblaApi?.scrollTo(START_INDEX)
	}, [draft, emblaApi])

	const handleRecoveryDiscard = React.useCallback(() => {
		clearSessionDraft()
		setDraft(null)
		setRecoveryDraft(null)
		setRecoveryOpen(false)
	}, [])

	const handleRecoveryApplied = React.useCallback(() => {
		setDraft(null)
		setRecoveryDraft(null)
	}, [])

	const handleStatsReady = React.useCallback(
		(hook: ReturnType<typeof useRecords>) => {
			recordsRef.current = hook
		},
		[]
	)

	const slideLabels = React.useMemo(
		() => [tSettings("title"), tSession("speedometerLabel"), tStats("title")],
		[tSession, tSettings, tStats]
	)

	return (
		<div className="relative h-dvh overflow-hidden bg-background">
			<div className="h-full overflow-hidden" ref={emblaRef}>
				<div className="flex h-full touch-pan-y">
					<div className="min-w-0 flex-[0_0_100%]">
						<SettingsScreen />
					</div>
					<div className="min-w-0 flex-[0_0_100%]">
						<SpeedometerScreen
							onSessionEnd={handleSessionEnd}
							recoveryDraft={recoveryDraft}
							onRecoveryApplied={handleRecoveryApplied}
						/>
					</div>
					<div className="min-w-0 flex-[0_0_100%]">
						<StatsScreen onHookReady={handleStatsReady} />
					</div>
				</div>
			</div>

			<div className="pointer-events-none absolute inset-x-0 bottom-[max(env(safe-area-inset-bottom),1rem)] z-20 flex justify-center px-6">
				<SlideIndicator
					count={slideLabels.length}
					selectedIndex={selectedIndex}
					onSelect={(index) => emblaApi?.scrollTo(index)}
					labels={slideLabels}
				/>
			</div>

			<SessionRecoveryModal
				draft={draft}
				open={recoveryOpen}
				onResume={handleRecoveryResume}
				onDiscard={handleRecoveryDiscard}
			/>
		</div>
	)
}
