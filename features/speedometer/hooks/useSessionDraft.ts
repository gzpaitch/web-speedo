"use client"

import * as React from "react"

import { SESSION_DRAFT_INTERVAL_MS } from "@/constants"
import type { SessionSnapshot } from "@/features/speedometer/hooks/useSession"
import type { SessionDraft } from "@/features/speedometer/types"
import { clearSessionDraft, saveSessionDraft } from "@/lib/storage"

/**
 * Persists an active session to `localStorage` every
 * `SESSION_DRAFT_INTERVAL_MS` so the user can recover from accidental app
 * closures (PRD §2 Session Recovery).
 */
export function useSessionDraft(snapshot: SessionSnapshot): void {
	const snapshotRef = React.useRef(snapshot)
	snapshotRef.current = snapshot

	const isActive =
		snapshot.state === "RUNNING" ||
		snapshot.state === "AUTO_PAUSED" ||
		snapshot.state === "MANUALLY_PAUSED"

	React.useEffect(() => {
		if (!isActive) {
			clearSessionDraft()
			return
		}

		const persist = () => {
			const s = snapshotRef.current
			if (!s.startedAt) {
				return
			}
			const draft: SessionDraft = {
				state: s.state,
				startedAt: s.startedAt,
				updatedAt: Date.now(),
				movementMs: s.movementMs,
				distanceMeters: s.distanceMeters,
				maxSpeedMps: s.maxSpeedMps,
				elevationGainMeters: s.elevationGainMeters,
				lastAltitude: s.lastAltitude,
			}
			saveSessionDraft(draft)
		}

		persist()
		const id = setInterval(persist, SESSION_DRAFT_INTERVAL_MS)
		return () => clearInterval(id)
	}, [isActive])
}
