import type { Metadata, Viewport } from "next"
import { Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { OrientationLock } from "./orientation-lock"
import { ServiceWorkerRegister } from "./sw-register"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
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
		{ media: "(prefers-color-scheme: dark)", color: "#00b8db" },
		{ media: "(prefers-color-scheme: light)", color: "#00b8db" },
	],
	colorScheme: "dark",
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
				"bg-[#00b8db] antialiased",
				fontMono.variable,
				"font-sans",
				inter.variable
			)}
		>
			<body className="min-h-dvh bg-[#00b8db]">
				<OrientationLock />
				<ThemeProvider>{children}</ThemeProvider>
				<ServiceWorkerRegister />
			</body>
		</html>
	)
}
