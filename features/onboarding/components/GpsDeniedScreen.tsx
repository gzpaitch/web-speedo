"use client"

import { AlertTriangle, LocateOff, RotateCcw } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"

type Props = {
	permanent: boolean
	onRetry?: () => void
}

export function GpsDeniedScreen({ permanent, onRetry }: Props) {
	const t = useTranslations("onboarding")
	const tCommon = useTranslations("common")

	return (
		<main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-6 py-12 text-foreground">
			<div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_hsl(var(--destructive)/0.12),_transparent_60%)] opacity-90" />
			<div className="mx-auto flex w-full max-w-sm flex-col items-center gap-8 rounded-[2rem] border border-border/70 bg-card/75 px-6 py-8 text-center shadow-[0_24px_70px_-36px_hsl(var(--foreground)/0.45)] backdrop-blur">
				<div className="inline-flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/8 px-3 py-1.5 text-[0.7rem] font-semibold tracking-[0.24em] text-destructive uppercase shadow-sm">
					<AlertTriangle className="size-3.5" />
					GPS
				</div>
				<div className="flex size-20 items-center justify-center rounded-[1.8rem] border border-destructive/30 bg-destructive/10 text-destructive shadow-sm">
					<LocateOff className="size-8" aria-hidden />
				</div>
				<div className="space-y-3">
					<h1 className="text-3xl font-semibold tracking-[-0.03em]">
						{t("deniedTitle")}
					</h1>
					<p className="text-sm leading-6 text-muted-foreground/85">
						{permanent
							? t("deniedPermanentlyDescription")
							: t("deniedDescription")}
					</p>
				</div>
				{onRetry ? (
					<Button
						type="button"
						size="lg"
						onClick={onRetry}
						className="min-h-14 w-full rounded-[1.4rem] text-base shadow-sm"
					>
						<RotateCcw className="size-5" />
						{tCommon("retry")}
					</Button>
				) : null}
			</div>
		</main>
	)
}
