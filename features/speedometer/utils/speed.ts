/** Speed unit conversions. */

export const MPS_TO_KMH = 3.6
export const MPS_TO_MPH = 2.23693629
export const METERS_TO_MILES = 0.000621371

export function mpsToKmh(mps: number): number {
	return mps * MPS_TO_KMH
}

export function mpsToMph(mps: number): number {
	return mps * MPS_TO_MPH
}

export function kmhToMps(kmh: number): number {
	return kmh / MPS_TO_KMH
}

export function metersToKilometers(meters: number): number {
	return meters / 1000
}

export function metersToMiles(meters: number): number {
	return meters * METERS_TO_MILES
}
