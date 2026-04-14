"use client"

import { MapPin } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"

type Props = {
	onRequest: () => void
	isRequesting?: boolean
}

export function GpsPermissionScreen({ onRequest, isRequesting }: Props) {
	const t = useTranslations("onboarding")

	return (
		<main className="flex min-h-dvh items-center justify-center bg-background px-6 py-12 text-foreground">
			<div className="mx-auto flex w-full max-w-sm flex-col items-center gap-8 text-center">
				<div className="flex size-20 items-center justify-center rounded-full border border-border bg-muted">
					<MapPin className="size-8" aria-hidden />
				</div>
				<div className="space-y-3">
					<h1 className="text-2xl font-semibold tracking-tight">
						{t("title")}
					</h1>
					<p className="text-sm text-muted-foreground">{t("description")}</p>
				</div>
				<Button
					type="button"
					size="lg"
					onClick={onRequest}
					disabled={isRequesting}
					className="min-h-14 w-full text-base"
				>
					{t("allow")}
				</Button>
			</div>
		</main>
	)
}
