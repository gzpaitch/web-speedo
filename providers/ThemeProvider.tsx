"use client"

import * as React from "react"

import type { ThemeMode } from "@/features/speedometer/types"

type Theme = ThemeMode
type ResolvedTheme = "light" | "dark"

type ThemeContextValue = {
	/** Current selection — `"system"` by default. */
	theme: Theme
	/** Actual applied theme (`light` or `dark`). */
	resolvedTheme: ResolvedTheme
	/**
	 * Overrides the theme for the current session only — the selection is
	 * NOT persisted, so closing and reopening the app resets to system
	 * (PRD §2 Settings).
	 */
	setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

function getSystemTheme(): ResolvedTheme {
	if (typeof window === "undefined") {
		return "dark"
	}
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light"
}

function applyThemeClass(resolved: ResolvedTheme): void {
	if (typeof document === "undefined") {
		return
	}
	const root = document.documentElement
	root.classList.remove("light", "dark")
	root.classList.add(resolved)
	root.style.colorScheme = resolved
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setThemeState] = React.useState<Theme>("system")
	// Safe SSR default — the matchMedia effect corrects this immediately on
	// the client, avoiding a hydration mismatch from calling window.matchMedia
	// in the useState initializer during SSR.
	const [systemTheme, setSystemTheme] = React.useState<ResolvedTheme>("dark")

	// Track system theme changes.
	React.useEffect(() => {
		const mql = window.matchMedia("(prefers-color-scheme: dark)")
		const onChange = (event: MediaQueryListEvent) => {
			setSystemTheme(event.matches ? "dark" : "light")
		}
		mql.addEventListener("change", onChange)
		setSystemTheme(mql.matches ? "dark" : "light")
		return () => {
			mql.removeEventListener("change", onChange)
		}
	}, [])

	const resolvedTheme: ResolvedTheme = theme === "system" ? systemTheme : theme

	// Apply class whenever resolved theme changes.
	React.useEffect(() => {
		applyThemeClass(resolvedTheme)
	}, [resolvedTheme])

	const setTheme = React.useCallback((next: Theme) => {
		setThemeState(next)
	}, [])

	const value = React.useMemo<ThemeContextValue>(
		() => ({ theme, resolvedTheme, setTheme }),
		[theme, resolvedTheme, setTheme]
	)

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
	const ctx = React.useContext(ThemeContext)
	if (!ctx) {
		throw new Error("useTheme must be used inside <ThemeProvider>")
	}
	return ctx
}
