import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
	return {
		id: "/",
		name: "Speedo",
		short_name: "Speedo",
		description:
			"Digital bike computer — speed, metrics and records on your handlebars.",
		start_url: "/",
		scope: "/",
		display: "standalone",
		orientation: "any",
		background_color: "#00b8db",
		theme_color: "#00b8db",
		categories: ["sports", "fitness"],
		icons: [
			{
				src: "/icons/icon-96.png",
				sizes: "96x96",
				type: "image/png",
				purpose: "any",
			},
			{
				src: "/icons/icon-192.png",
				sizes: "192x192",
				type: "image/png",
				purpose: "any",
			},
			{
				src: "/icons/icon-192.png",
				sizes: "192x192",
				type: "image/png",
				purpose: "maskable",
			},
			{
				src: "/icons/icon-512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "any",
			},
			{
				src: "/icons/icon-512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "maskable",
			},
		],
	}
}
