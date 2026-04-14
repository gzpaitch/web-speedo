import type { Metadata, Viewport } from "next"
import { Bebas_Neue, Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { cn } from "@/lib/utils"
import { AppProviders } from "@/providers/AppProviders"
import { ServiceWorkerRegister } from "./sw-register"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
})

const bebasNeue = Bebas_Neue({
	subsets: ["latin"],
	weight: "400",
	variable: "--font-display",
})

export const metadata: Metadata = {
	title: "Speedo",
	description:
		"Digital bike computer — speed, metrics and records on your handlebars.",
	applicationName: "Speedo",
	appleWebApp: {
		capable: true,
		statusBarStyle: "black-translucent",
		title: "Speedo",
	},
	formatDetection: {
		telephone: false,
	},
	icons: {
		apple: "/icons/icon-192.png",
	},
}

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
		{ media: "(prefers-color-scheme: light)", color: "#ffffff" },
	],
	colorScheme: "dark light",
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	viewportFit: "cover",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={cn(
				"antialiased",
				fontMono.variable,
				bebasNeue.variable,
				"font-sans",
				inter.variable
			)}
		>
			<body className="min-h-dvh bg-background text-foreground">
				<AppProviders>{children}</AppProviders>
				<ServiceWorkerRegister />
			</body>
		</html>
	)
}
