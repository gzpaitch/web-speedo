"use client"

import * as React from "react"

export type Orientation = "portrait" | "landscape"

function getOrientation(): Orientation {
	if (typeof window === "undefined") {
		return "portrait"
	}
	return window.matchMedia("(orientation: landscape)").matches
		? "landscape"
		: "portrait"
}

export function useOrientation(): Orientation {
	// Safe SSR default — the useEffect below corrects it on the client
	// immediately after mount (avoids calling matchMedia during SSR).
	const [orientation, setOrientation] = React.useState<Orientation>("portrait")

	React.useEffect(() => {
		const mql = window.matchMedia("(orientation: landscape)")
		const onChange = () => {
			setOrientation(mql.matches ? "landscape" : "portrait")
		}
		onChange()
		mql.addEventListener("change", onChange)
		return () => mql.removeEventListener("change", onChange)
	}, [])

	return orientation
}
