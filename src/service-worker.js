/// <reference types="@sveltejs/kit" />
import { build, files, version } from '$service-worker';

const CACHE = `cache-${version}`;
const CACHE_PREFIX = 'cache-';
const NETWORK_TIMEOUT = 2500;
const PRECACHE = [...new Set([...build, ...files])];

// Auth and session endpoints must never be served from a cache.
function isUncacheable(url) {
	return url.pathname.startsWith('/auth/') || url.pathname.startsWith('/api/auth');
}

self.addEventListener('install', (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE);
			// Cache assets individually: one failed request must not abort the whole
			// install (slow or flaky connections would otherwise lose offline support).
			await Promise.all(
				PRECACHE.map(async (url) => {
					try {
						await cache.add(url);
					} catch {
						// Skip this asset; it will be fetched on demand later.
					}
				})
			);
			await self.skipWaiting();
		})()
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			const keys = await caches.keys();
			await Promise.all(
				keys
					.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE)
					.map((key) => caches.delete(key))
			);
			await self.clients.claim();
		})()
	);
});

/** Run a fetch with a hard deadline so slow networks fall back instead of hanging. */
function fetchWithTimeout(request, ms) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), ms);
	return fetch(request, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

/** Cache writes are best-effort; a full or blocked store must not lose a good response. */
async function cacheQuietly(cache, request, response) {
	if (!response.ok) return;
	try {
		await cache.put(request, response.clone());
	} catch {
		// Ignore storage failures.
	}
}

async function networkFirst(request, cache, { timeout = NETWORK_TIMEOUT, cacheable = true } = {}) {
	try {
		const response = await fetchWithTimeout(request, timeout);
		if (!cacheable || isUncacheable(new URL(request.url))) return response;
		await cacheQuietly(cache, request, response);
		return response;
	} catch (error) {
		const cached = await cache.match(request).catch(() => undefined);
		if (cached) return cached;
		throw error;
	}
}

async function staleWhileRevalidate(request, cache) {
	const cached = await cache.match(request).catch(() => undefined);
	const network = fetchWithTimeout(request, NETWORK_TIMEOUT)
		.then(async (response) => {
			await cacheQuietly(cache, request, response);
			return response;
		})
		.catch(() => cached);

	return cached || (await network);
}

self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	const url = new URL(event.request.url);

	// Only control our own origin; let third parties handle their own requests.
	if (url.origin !== self.location.origin) {
		// Community photos: show a cached copy immediately, refresh in background.
		if (event.request.destination === 'image') {
			event.respondWith(
				caches.open(CACHE).then((cache) => staleWhileRevalidate(event.request, cache))
			);
		}
		return;
	}

	if (isUncacheable(url)) return;

	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE);

			// Navigation: network first, then the exact page, then the offline page.
			if (event.request.mode === 'navigate') {
				try {
					const response = await fetchWithTimeout(event.request, NETWORK_TIMEOUT);
					await cacheQuietly(cache, event.request, response);
					return response;
				} catch {
					return (
						(await cache.match(event.request)) ||
						(await cache.match('/offline')) ||
						new Response('Offline', { status: 503, headers: { 'content-type': 'text/plain' } })
					);
				}
			}

			// Hashed build assets and static files are immutable — cache first.
			if (PRECACHE.includes(url.pathname)) {
				const cached = await cache.match(event.request);
				if (cached) return cached;
			}

			return networkFirst(event.request, cache);
		})()
	);
});
