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
	const [orientation, setOrientation] = React.useState<Orientation>(() =>
		getOrientation()
	)

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
