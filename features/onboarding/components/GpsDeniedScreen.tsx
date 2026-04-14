"use client"

import { LocateOff } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"

type Props = {
	permanent: boolean
	onRetry: () => void
}

export function GpsDeniedScreen({ permanent, onRetry }: Props) {
	const t = useTranslations("onboarding")
	const tCommon = useTranslations("common")

	return (
		<main className="flex min-h-dvh items-center justify-center bg-background px-6 py-12 text-foreground">
			<div className="mx-auto flex w-full max-w-sm flex-col items-center gap-8 text-center">
				<div className="flex size-20 items-center justify-center rounded-full border border-destructive/40 bg-destructive/10 text-destructive">
					<LocateOff className="size-8" aria-hidden />
				</div>
				<div className="space-y-3">
					<h1 className="text-2xl font-semibold tracking-tight">
						{t("deniedTitle")}
					</h1>
					<p className="text-sm text-muted-foreground">
						{permanent
							? t("deniedPermanentlyDescription")
							: t("deniedDescription")}
					</p>
				</div>
				<Button
					type="button"
					size="lg"
					onClick={onRetry}
					className="min-h-14 w-full text-base"
				>
					{tCommon("retry")}
				</Button>
			</div>
		</main>
	)
}
