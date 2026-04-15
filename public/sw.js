const APP_VERSION = new URL(self.location.href).searchParams.get("v") ?? "dev"
const CACHE_NAME = `speedo-${APP_VERSION}`

// Assets to pre-cache on install
const PRECACHE_ASSETS = ["/", "/manifest.webmanifest"]

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
	)
	// Activate immediately without waiting for existing tabs to close
	self.skipWaiting()
})

self.addEventListener("activate", (event) => {
	// Delete old caches from previous versions
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys
						.filter((k) => k.startsWith("speedo-") && k !== CACHE_NAME)
						.map((k) => caches.delete(k))
				)
			)
	)
	self.clients.claim()
})

self.addEventListener("fetch", (event) => {
	const { request } = event
	const url = new URL(request.url)

	// Only handle GET requests from the same origin
	if (request.method !== "GET" || url.origin !== self.location.origin) return

	const dest = request.destination

	// Static assets (JS, CSS, fonts, images): cache-first
	if (
		dest === "script" ||
		dest === "style" ||
		dest === "font" ||
		dest === "image"
	) {
		event.respondWith(
			caches.match(request).then(
				(cached) =>
					cached ??
					fetch(request).then((res) => {
						if (res.ok) {
							const clone = res.clone()
							caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
						}
						return res
					})
			)
		)
		return
	}

	// Navigation requests: network-first, fall back to cache then root
	if (request.mode === "navigate") {
		event.respondWith(
			fetch(request)
				.then((res) => {
					if (res.ok) {
						const clone = res.clone()
						caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
					}
					return res
				})
				.catch(() =>
					caches.match(request).then((cached) => cached ?? caches.match("/"))
				)
		)
	}
})
