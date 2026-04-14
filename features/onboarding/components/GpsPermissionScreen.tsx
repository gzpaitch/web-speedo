"use client"

import { Compass, MapPin, ShieldCheck } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"

type Props = {
	onRequest: () => void
	isRequesting?: boolean
}

export function GpsPermissionScreen({ onRequest, isRequesting }: Props) {
	const t = useTranslations("onboarding")

	return (
		<main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-6 py-12 text-foreground">
			<div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.16),_transparent_60%)] opacity-90" />
			<div className="pointer-events-none absolute right-[-4rem] bottom-12 size-56 rounded-full bg-[hsl(var(--primary)/0.08)] blur-3xl" />
			<div className="mx-auto flex w-full max-w-sm flex-col items-center gap-8 rounded-[2rem] border border-border/70 bg-card/75 px-6 py-8 text-center shadow-[0_24px_70px_-36px_hsl(var(--foreground)/0.45)] backdrop-blur">
				<div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-[0.7rem] font-semibold tracking-[0.24em] text-muted-foreground uppercase shadow-sm">
					<ShieldCheck className="size-3.5" />
					GPS
				</div>
				<div className="flex size-20 items-center justify-center rounded-[1.8rem] border border-border/70 bg-background/80 shadow-sm">
					<MapPin className="size-8" aria-hidden />
				</div>
				<div className="space-y-3">
					<h1 className="text-3xl font-semibold tracking-[-0.03em]">
						{t("title")}
					</h1>
					<p className="text-sm leading-6 text-muted-foreground/85">
						{t("description")}
					</p>
				</div>
				<Button
					type="button"
					size="lg"
					onClick={onRequest}
					disabled={isRequesting}
					className="min-h-14 w-full rounded-[1.4rem] text-base shadow-sm"
				>
					<Compass className="size-5" />
					{t("allow")}
				</Button>
			</div>
		</main>
	)
}
