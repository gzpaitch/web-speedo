"use client"

import { Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"

type Props = {
	onReset: () => void
}

export function ResetRecordsButton({ onReset }: Props) {
	const t = useTranslations("stats")
	const tCommon = useTranslations("common")
	const [open, setOpen] = React.useState(false)

	return (
		<>
			<Button
				type="button"
				variant="destructive"
				size="lg"
				onClick={() => setOpen(true)}
				className="min-h-14 w-full"
			>
				<Trash2 className="size-4" />
				{t("reset")}
			</Button>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("resetConfirmTitle")}</DialogTitle>
						<DialogDescription>
							{t("resetConfirmDescription")}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<DialogClose asChild>
							<Button type="button" variant="outline">
								{tCommon("cancel")}
							</Button>
						</DialogClose>
						<Button
							type="button"
							variant="destructive"
							onClick={() => {
								onReset()
								setOpen(false)
							}}
						>
							{t("reset")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}
