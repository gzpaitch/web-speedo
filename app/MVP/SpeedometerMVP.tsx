"use client"

import {
	Gauge,
	LocateFixed,
	Navigation,
	Radar,
	ShieldAlert,
	Smartphone,
} from "lucide-react"

import { cn } from "@/lib/utils"
import pkg from "@/package.json"
import { useChromeSpeedometer } from "./useChromeSpeedometer"
import { usePWAInstall } from "./usePWAInstall"

function formatSpeed(value: number) {
	return new Intl.NumberFormat("en-US", {
		maximumFractionDigits: value >= 10 ? 0 : 1,
		minimumFractionDigits: value >= 10 ? 0 : 1,
	}).format(value)
}

function formatCoordinate(value: number | null) {
	if (value === null) {
		return "—"
	}

	return value.toFixed(6)
}

function formatAccuracy(value: number | null) {
	if (value === null) {
		return "—"
	}

	return `${Math.round(value)} m`
}

function formatUpdatedAt(value: number | null) {
	if (value === null) {
		return "Waiting for data"
	}

	return new Intl.DateTimeFormat("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	}).format(value)
}

const signalMap = {
	waiting: {
		label: "Waiting",
		className: "border-amber-500/30 bg-amber-500/10 text-amber-200",
	},
	weak: {
		label: "Weak signal",
		className: "border-orange-500/30 bg-orange-500/10 text-orange-200",
	},
	ok: {
		label: "GPS OK",
		className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
	},
} as const

export function SpeedometerMVP() {
	const speedometer = useChromeSpeedometer()
	const signal = signalMap[speedometer.signal]
	const pwa = usePWAInstall()

	const showInstallBanner = pwa.state === "available" && !pwa.isIOS
	const showIOSBanner = pwa.state === "available" && pwa.isIOS

	return (
		<main className="min-h-dvh overflow-hidden bg-[radial-gradient(circle_at_top,rgba(94,234,212,0.18),transparent_28%),linear-gradient(180deg,#07111a_0%,#02060a_100%)] text-slate-50">
			<div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-4 pt-[max(env(safe-area-inset-top),1.25rem)] pb-[max(env(safe-area-inset-bottom),1.25rem)]">
				<div className="flex justify-center pt-1">
					<div
						className={cn(
							"inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.28em]",
							signal.className
						)}
					>
						<Radar className="size-3.5" />
						<span>{signal.label}</span>
					</div>
				</div>

				<section className="relative overflow-hidden rounded-[2.5rem] border border-cyan-400/20 bg-[#071019]/90 px-5 pb-5 pt-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
					<div className="absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-cyan-300/70 to-transparent" />
					<div className="absolute inset-x-10 top-16 h-32 rounded-full bg-cyan-400/10 blur-3xl" />
					<div className="absolute inset-x-12 bottom-8 h-24 rounded-full bg-cyan-400/15 blur-3xl" />

					<div className="relative flex flex-col gap-6">
						<div className="space-y-2 text-center">
							<p className="text-[0.65rem] uppercase tracking-[0.45em] text-slate-500">
								Current speed
							</p>
							<div className="font-mono text-[5.75rem] font-semibold leading-none -tracking-widest text-white">
								{formatSpeed(speedometer.currentSpeedKmh)}
							</div>
							<p className="text-lg uppercase tracking-[0.42em] text-cyan-100/70">
								km/h
							</p>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-4 text-center backdrop-blur-xl">
								<p className="text-[0.65rem] uppercase tracking-[0.28em] text-slate-400">
									Max speed
								</p>
								<p className="mt-2 font-mono text-3xl text-white">
									{formatSpeed(speedometer.maxSpeedKmh)}
								</p>
							</div>
							<div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-4 text-center backdrop-blur-xl">
								<p className="text-[0.65rem] uppercase tracking-[0.28em] text-slate-400">
									Average
								</p>
								<p className="mt-2 font-mono text-3xl text-white">
									{formatSpeed(speedometer.averageSpeedKmh)}
								</p>
							</div>
						</div>

						<div className="grid gap-3">
							<button
								type="button"
								onClick={speedometer.requestAccess}
								className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 text-sm font-medium text-cyan-50 transition hover:border-cyan-200/60 hover:bg-cyan-300/20"
							>
								Allow GPS in Chrome
							</button>
							<button
								type="button"
								onClick={speedometer.stop}
								className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 text-sm font-medium text-slate-100 transition hover:border-white/20 hover:bg-white/10"
							>
								Stop tracking
							</button>
							{showInstallBanner && (
								<button
									type="button"
									onClick={pwa.install}
									className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-violet-400/30 bg-violet-400/10 px-5 text-sm font-medium text-violet-100 transition hover:border-violet-300/60 hover:bg-violet-400/20"
								>
									<Smartphone className="size-4" />
									Install app
								</button>
							)}
						</div>

						<div className="flex items-center justify-between rounded-[1.7rem] border border-white/10 bg-black/20 px-4 py-3 text-xs uppercase tracking-[0.28em] text-slate-400">
							<div className="inline-flex items-center gap-2">
								<Gauge className="size-4 text-cyan-300" />
								<span>{speedometer.source}</span>
							</div>
							<span>{speedometer.isWatching ? "Live" : "Stopped"}</span>
						</div>

						{speedometer.errorMessage ? (
							<div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
								<div className="mb-2 inline-flex items-center gap-2 font-medium">
									<ShieldAlert className="size-4" />
									<span>Tracking error</span>
								</div>
								<p>{speedometer.errorMessage}</p>
							</div>
						) : null}
					</div>
				</section>

				{showIOSBanner && (
					<div className="rounded-[2rem] border border-violet-400/20 bg-violet-400/10 p-5 text-sm text-violet-100">
						<div className="mb-2 inline-flex items-center gap-2 font-medium">
							<Smartphone className="size-4" />
							<span>Install on iOS</span>
						</div>
						<p className="text-slate-300">
							Tap the <strong>Share</strong> button in Safari, then{" "}
							<strong>Add to Home Screen</strong>.
						</p>
					</div>
				)}

				<section className="grid gap-4 pb-4">
					<div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
						<div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-100">
							<LocateFixed className="size-4 text-cyan-300" />
							<span>Raw telemetry</span>
						</div>

						<div className="grid gap-3 text-sm text-slate-300">
							<div className="flex items-center justify-between gap-4">
								<span>Permission</span>
								<span className="font-mono text-slate-50">
									{speedometer.permission}
								</span>
							</div>
							<div className="flex items-center justify-between gap-4">
								<span>Accuracy</span>
								<span className="font-mono text-slate-50">
									{formatAccuracy(speedometer.accuracyMeters)}
								</span>
							</div>
							<div className="flex items-center justify-between gap-4">
								<span>Latitude</span>
								<span className="font-mono text-slate-50">
									{formatCoordinate(speedometer.latitude)}
								</span>
							</div>
							<div className="flex items-center justify-between gap-4">
								<span>Longitude</span>
								<span className="font-mono text-slate-50">
									{formatCoordinate(speedometer.longitude)}
								</span>
							</div>
							<div className="flex items-center justify-between gap-4">
								<span>Updated at</span>
								<span className="font-mono text-slate-50">
									{formatUpdatedAt(speedometer.lastUpdatedAt)}
								</span>
							</div>
						</div>
					</div>

					<div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
						<div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-100">
							<Navigation className="size-4 text-cyan-300" />
							<span>Chrome context</span>
						</div>
						<div className="space-y-3 text-sm leading-6 text-slate-300">
							{/* suppressHydrationWarning: values differ between SSR and client intentionally */}
							<p suppressHydrationWarning>{speedometer.browserDetails}</p>
							<p suppressHydrationWarning>{speedometer.networkDetails}</p>
							<p className="text-slate-400">
								For a PRD-faithful test, open this route in Chrome on Android
								with GPS enabled.
							</p>
						</div>
					</div>
				</section>

				<footer className="pb-2 text-center text-[0.6rem] uppercase tracking-[0.28em] text-slate-600">
					v{pkg.version}
				</footer>
			</div>
		</main>
	)
}
