import { MET_CYCLING } from "@/constants"

/**
 * Estimate calories burned during cycling using the MET formula:
 *   calories = MET × weight_kg × duration_hours
 *
 * Returns `null` when weight is not configured — PRD requires calories to
 * be hidden in that case.
 */
export function estimateCalories(
	weightKg: number | null | undefined,
	movementMs: number
): number | null {
	if (
		!weightKg ||
		weightKg <= 0 ||
		!Number.isFinite(weightKg) ||
		movementMs <= 0 ||
		!Number.isFinite(movementMs)
	) {
		return null
	}

	const hours = movementMs / (1000 * 60 * 60)
	return MET_CYCLING * weightKg * hours
}
