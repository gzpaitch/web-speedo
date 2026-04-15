"use client"

import useEmblaCarousel from "embla-carousel-react"
import {
	CircleCheck,
	CircleStop,
	CircleX,
	LocateFixed,
	MapPin,
	MapPinOff,
	Navigation,
	RotateCcw,
	ShieldAlert,
	Smartphone,
} from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"
import pkg from "@/package.json"
import { useChromeSpeedometer } from "./useChromeSpeedometer"
import { usePWAInstall } from "./usePWAInstall"

type DetailItem = {
	label: string
	value: string
}

function DetailList({ items }: { items: DetailItem[] }) {
	return (
		<div className="grid gap-3 text-sm text-slate-300">
			{items.map((item) => (
				<div
					key={item.label}
					className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-black/15 px-4 py-3"
				>
					<span>{item.label}</span>
					<span className="font-mono text-right text-slate-50">
						{item.value}
					</span>
				</div>
			))}
		</div>
	)
}

function StackedDetailList({ items }: { items: DetailItem[] }) {
	return (
		<div className="grid gap-3 text-sm text-slate-300">
			{items.map((item) => (
				<div
					key={item.label}
					className="rounded-2xl border border-white/8 bg-black/15 px-4 py-3"
				>
					<p className="text-[0.65rem] uppercase tracking-[0.24em] text-slate-400">
						{item.label}
					</p>
					<p className="mt-2 font-mono leading-6 text-slate-50">{item.value}</p>
				</div>
			))}
		</div>
	)
}

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

type StatusKey = "stopped" | "waiting" | "weak" | "ok"

const statusBadgeMap: Record<
	StatusKey,
	{ dot: string; ring: string | null; label: string; className: string }
> = {
	stopped: {
		dot: "bg-slate-500",
		ring: null,
		label: "Stopped",
		className: "border-white/10 bg-white/5 text-slate-400",
	},
	waiting: {
		dot: "bg-amber-400",
		ring: "bg-amber-400/60",
		label: "Waiting for GPS",
		className: "border-amber-500/30 bg-amber-500/10 text-amber-200",
	},
	weak: {
		dot: "bg-orange-400",
		ring: "bg-orange-400/60",
		label: "Weak signal",
		className: "border-orange-500/30 bg-orange-500/10 text-orange-200",
	},
	ok: {
		dot: "bg-emerald-400",
		ring: "bg-emerald-400/60",
		label: "Live · GPS OK",
		className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
	},
}

type TrackingButtonConfig = {
	label: string
	icon: React.ElementType
	className: string
}

function resolveTrackingButton(
	isWatching: boolean,
	isRequesting: boolean,
	permission: "idle" | "prompt" | "granted" | "denied" | "unsupported"
): TrackingButtonConfig {
	if (isWatching) {
		return {
			label: "Stop tracking",
			icon: CircleStop,
			className:
				"border-white/10 bg-white/5 text-slate-100 hover:border-white/20 hover:bg-white/10",
		}
	}

	if (isRequesting) {
		return {
			label: "Requesting…",
			icon: MapPin,
			className:
				"border-amber-400/30 bg-amber-400/10 text-amber-100 cursor-wait",
		}
	}

	switch (permission) {
		case "unsupported":
			return {
				label: "GPS unavailable",
				icon: MapPinOff,
				className:
					"border-white/10 bg-white/5 text-slate-500 cursor-not-allowed",
			}
		case "denied":
			return {
				label: "GPS denied — enable in browser settings",
				icon: CircleX,
				className:
					"border-rose-400/30 bg-rose-400/10 text-rose-300 cursor-not-allowed",
			}
		case "granted":
			return {
				label: "Start tracking",
				icon: CircleCheck,
				className:
					"border-emerald-500/30 bg-emerald-500/10 text-emerald-100 hover:border-emerald-400/60 hover:bg-emerald-500/20",
			}
		default:
			return {
				label: "Allow GPS",
				icon: MapPin,
				className:
					"border-cyan-300/30 bg-cyan-300/10 text-cyan-50 hover:border-cyan-200/60 hover:bg-cyan-300/20",
			}
	}
}

export function SpeedometerMVP() {
	const speedometer = useChromeSpeedometer()
	const statusKey: StatusKey = speedometer.isWatching
		? speedometer.signal
		: "stopped"
	const statusBadge = statusBadgeMap[statusKey]
	const pwa = usePWAInstall()
	const [detailsEmblaRef, detailsEmblaApi] = useEmblaCarousel({
		align: "start",
		dragFree: false,
		loop: false,
	})
	const [selectedDetailsIndex, setSelectedDetailsIndex] = useState(0)
	const telemetryItems: DetailItem[] = [
		{ label: "Permission", value: speedometer.permission },
		{
			label: "Accuracy",
			value: formatAccuracy(speedometer.accuracyMeters),
		},
		{
			label: "Latitude",
			value: formatCoordinate(speedometer.latitude),
		},
		{
			label: "Longitude",
			value: formatCoordinate(speedometer.longitude),
		},
		{
			label: "Updated at",
			value: formatUpdatedAt(speedometer.lastUpdatedAt),
		},
	]
	const chromeContextItems: DetailItem[] = [
		{
			label: "Browser",
			value: speedometer.browserDetails,
		},
		{
			label: "Network",
			value: speedometer.networkDetails,
		},
		{
			label: "PRD note",
			value: "Open in Chrome on Android with GPS enabled.",
		},
	]
	const detailSlides = [
		{
			key: "raw-telemetry",
			title: "Raw telemetry",
			icon: LocateFixed,
			content: <DetailList items={telemetryItems} />,
		},
		{
			key: "chrome-context",
			title: "Chrome context",
			icon: Navigation,
			content: (
				<div suppressHydrationWarning>
					<StackedDetailList items={chromeContextItems} />
				</div>
			),
		},
	]

	useEffect(() => {
		if (!detailsEmblaApi) {
			return
		}

		const syncSelectedIndex = () => {
			setSelectedDetailsIndex(detailsEmblaApi.selectedScrollSnap())
		}

		syncSelectedIndex()
		detailsEmblaApi.on("select", syncSelectedIndex)
		detailsEmblaApi.on("reInit", syncSelectedIndex)

		return () => {
			detailsEmblaApi.off("select", syncSelectedIndex)
			detailsEmblaApi.off("reInit", syncSelectedIndex)
		}
	}, [detailsEmblaApi])

	const showInstallBanner = pwa.state === "available" && !pwa.isIOS
	const showIOSBanner = pwa.state === "available" && pwa.isIOS

	const trackingBtn = resolveTrackingButton(
		speedometer.isWatching,
		speedometer.isRequesting,
		speedometer.permission
	)
	const TrackingIcon = trackingBtn.icon
	const trackingOnClick = speedometer.isWatching
		? speedometer.stop
		: !speedometer.isRequesting &&
				speedometer.permission !== "unsupported" &&
				speedometer.permission !== "denied"
			? speedometer.requestAccess
			: undefined

	return (
		<main className="min-h-dvh overflow-hidden bg-[radial-gradient(circle_at_top,rgba(94,234,212,0.18),transparent_28%),linear-gradient(180deg,#07111a_0%,#02060a_100%)] text-slate-50">
			<div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-4 pt-[max(env(safe-area-inset-top),1.25rem)] pb-[max(env(safe-area-inset-bottom),1.25rem)]">
				<section className="relative flex flex-3 flex-col overflow-hidden rounded-[2.5rem] border border-cyan-400/20 bg-[#071019]/90 px-6 pb-8 pt-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
					<div className="absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-cyan-300/70 to-transparent" />
					<div className="absolute inset-x-0 top-1/3 h-64 rounded-full bg-cyan-400/8 blur-3xl" />

					{/* header: unified status badge */}
					<div className="relative flex justify-center">
						<div
							className={cn(
								"inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.6rem] font-medium uppercase tracking-[0.28em] transition-colors duration-500",
								statusBadge.className
							)}
						>
							<span className="relative flex size-2">
								{statusBadge.ring && (
									<span
										className={cn(
											"absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
											statusBadge.ring
										)}
									/>
								)}
								<span
									className={cn(
										"relative inline-flex size-2 rounded-full",
										statusBadge.dot
									)}
								/>
							</span>
							{statusBadge.label}
						</div>
					</div>

					{/* main speed readout */}
					<div className="relative flex flex-1 flex-col items-center justify-center gap-2 py-6">
						<p className="text-[0.6rem] uppercase tracking-[0.45em] text-slate-600">
							Current speed
						</p>
						<div className="font-mono text-[min(32vw,9rem)] font-semibold leading-none -tracking-widest text-white drop-shadow-[0_0_40px_rgba(103,232,249,0.25)]">
							{formatSpeed(speedometer.currentSpeedKmh)}
						</div>
						<p className="text-xl font-light uppercase tracking-[0.55em] text-cyan-200/60">
							km/h
						</p>
					</div>

					{/* max / avg */}
					<div className="relative grid grid-cols-2 gap-4 mt-2">
						<div className="rounded-[1.7rem] border border-white/10 bg-white/5 px-4 py-6 text-center backdrop-blur-xl">
							<p className="text-[0.6rem] uppercase tracking-[0.28em] text-slate-500">
								Max
							</p>
							<p className="mt-3 font-mono text-4xl font-medium text-white">
								{formatSpeed(speedometer.maxSpeedKmh)}
							</p>
							<p className="mt-1 text-[0.55rem] uppercase tracking-[0.28em] text-slate-600">
								km/h
							</p>
						</div>
						<div className="rounded-[1.7rem] border border-white/10 bg-white/5 px-4 py-6 text-center backdrop-blur-xl">
							<p className="text-[0.6rem] uppercase tracking-[0.28em] text-slate-500">
								Avg
							</p>
							<p className="mt-3 font-mono text-4xl font-medium text-white">
								{formatSpeed(speedometer.averageSpeedKmh)}
							</p>
							<p className="mt-1 text-[0.55rem] uppercase tracking-[0.28em] text-slate-600">
								km/h
							</p>
						</div>
					</div>

					{/* buttons */}
					<div className="relative mt-8 grid gap-4">
						<button
							type="button"
							onClick={trackingOnClick}
							disabled={trackingOnClick === undefined}
							className={cn(
								"inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border px-5 text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed",
								trackingBtn.className
							)}
						>
							<TrackingIcon className="size-4" />
							{trackingBtn.label}
						</button>
						<button
							type="button"
							onClick={speedometer.resetStats}
							className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-400/8 px-5 text-sm font-medium text-rose-200 transition hover:border-rose-400/40 hover:bg-rose-400/15"
						>
							<RotateCcw className="size-4" />
							Reset stats
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

					{speedometer.errorMessage ? (
						<div className="relative mt-5 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
							<div className="mb-2 inline-flex items-center gap-2 font-medium">
								<ShieldAlert className="size-4" />
								<span>Tracking error</span>
							</div>
							<p>{speedometer.errorMessage}</p>
						</div>
					) : null}
				</section>

				<section className="space-y-4 pb-2">
					<section
						className="overflow-hidden"
						ref={detailsEmblaRef}
						aria-label="Telemetry details carousel"
					>
						<div className="-ml-4 flex touch-pan-y">
							{detailSlides.map((slide) => {
								const Icon = slide.icon

								return (
									<div key={slide.key} className="min-w-0 flex-[0_0_100%] pl-4">
										<div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
											<div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-100">
												<Icon className="size-4 text-cyan-300" />
												<span>{slide.title}</span>
											</div>
											{slide.content}
										</div>
									</div>
								)
							})}
						</div>
					</section>

					<div className="flex items-center justify-center gap-2">
						{detailSlides.map((slide, index) => (
							<button
								key={slide.key}
								type="button"
								onClick={() => detailsEmblaApi?.scrollTo(index)}
								className={cn(
									"h-2 rounded-full transition",
									selectedDetailsIndex === index
										? "w-6 bg-cyan-300"
										: "w-2 bg-white/20"
								)}
								aria-label={`Go to slide ${index + 1}`}
								aria-pressed={selectedDetailsIndex === index}
							/>
						))}
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

				<footer className="pb-2 text-center text-[0.6rem] uppercase tracking-[0.28em] text-slate-600">
					v{pkg.version}
				</footer>
			</div>
		</main>
	)
}
