"use client"

import {
	ArrowRight,
	BadgeCheck,
	Download,
	Share,
	Smartphone,
	Zap,
} from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"

type Props = {
	canInstall: boolean
	isIOS: boolean
	isInstalling?: boolean
	onInstall: () => void
	onContinue: () => void
}

export function InstallPromptScreen({
	canInstall,
	isIOS,
	isInstalling,
	onInstall,
	onContinue,
}: Props) {
	const t = useTranslations("onboarding")

	return (
		<main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-6 py-12 text-foreground">
			<div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.18),_transparent_60%)] opacity-90" />
			<div className="pointer-events-none absolute left-[-3rem] bottom-8 size-44 rounded-full bg-[hsl(var(--primary)/0.08)] blur-3xl" />
			<div className="mx-auto flex w-full max-w-sm flex-col gap-6 rounded-[2rem] border border-border/70 bg-card/80 px-6 py-7 shadow-[0_24px_70px_-36px_hsl(var(--foreground)/0.45)] backdrop-blur">
				<div className="flex items-center justify-between gap-3">
					<div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-[0.7rem] font-semibold tracking-[0.24em] text-muted-foreground uppercase shadow-sm">
						<Smartphone className="size-3.5" />
						PWA
					</div>
					<div className="flex size-12 items-center justify-center rounded-[1.2rem] border border-border/70 bg-background/85 text-primary shadow-sm">
						<Download className="size-5" aria-hidden />
					</div>
				</div>

				<div className="space-y-3 text-center">
					<h1 className="text-3xl font-semibold tracking-[-0.03em]">
						{t("installTitle")}
					</h1>
					<p className="text-sm leading-6 text-muted-foreground/85">
						{t("installDescription")}
					</p>
				</div>

				<div className="grid gap-3">
					<div className="rounded-[1.6rem] border border-border/70 bg-background/65 p-4">
						<div className="flex items-start gap-3">
							<div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
								<Zap className="size-4" />
							</div>
							<div>
								<p className="text-sm font-medium tracking-tight">
									{t("installBenefitLaunchTitle")}
								</p>
								<p className="mt-1 text-sm leading-5 text-muted-foreground">
									{t("installBenefitLaunchDescription")}
								</p>
							</div>
						</div>
					</div>

					<div className="rounded-[1.6rem] border border-border/70 bg-background/65 p-4">
						<div className="flex items-start gap-3">
							<div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
								<BadgeCheck className="size-4" />
							</div>
							<div>
								<p className="text-sm font-medium tracking-tight">
									{t("installBenefitFocusTitle")}
								</p>
								<p className="mt-1 text-sm leading-5 text-muted-foreground">
									{t("installBenefitFocusDescription")}
								</p>
							</div>
						</div>
					</div>
				</div>

				{isIOS ? (
					<div className="rounded-[1.6rem] border border-border/70 bg-background/65 p-4 text-sm leading-6 text-muted-foreground">
						<div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[0.7rem] font-semibold tracking-[0.22em] uppercase text-foreground">
							<Share className="size-3.5 text-primary" />
							{t("installIosLabel")}
						</div>
						<p>{t("installIosDescription")}</p>
						<p className="mt-2 font-medium text-foreground">
							{t("installIosCta")}
						</p>
					</div>
				) : null}

				{!isIOS && !canInstall ? (
					<p className="rounded-[1.4rem] border border-dashed border-border/70 bg-background/50 px-4 py-3 text-center text-sm leading-6 text-muted-foreground">
						{t("installLaterHint")}
					</p>
				) : null}

				<div className="flex flex-col gap-3">
					{canInstall ? (
						<Button
							type="button"
							size="lg"
							onClick={onInstall}
							disabled={isInstalling}
							className="min-h-14 rounded-[1.4rem] text-base shadow-sm"
						>
							<Download className="size-5" />
							{t("installAction")}
						</Button>
					) : null}

					<Button
						type="button"
						size="lg"
						variant={canInstall ? "outline" : "default"}
						onClick={onContinue}
						className="min-h-14 rounded-[1.4rem] text-base shadow-sm"
					>
						<ArrowRight className="size-5" />
						{t("continueWithoutInstall")}
					</Button>
				</div>
			</div>
		</main>
	)
}
