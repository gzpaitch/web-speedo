"use client"

import type * as React from "react"

import { IntlProvider } from "@/i18n/IntlProvider"
import { ThemeProvider } from "@/providers/ThemeProvider"

export function AppProviders({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider>
			<IntlProvider>{children}</IntlProvider>
		</ThemeProvider>
	)
}
