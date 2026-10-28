/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />

import { immutable, assets, prerendered } from '$app/manifest';
import { version } from '$app/env';

const sw = self as unknown as ServiceWorkerGlobalScope;

const CACHE_NAME = `binaact-cache-${version}`;

const ASSETS = [
	...immutable.map((item) => item.path),
	...assets.map((item) => item.path),
	...prerendered.map((item) => item.path)
];

sw.addEventListener('install', (event) => {
	async function addFilesToCache() {
		const cache = await caches.open(CACHE_NAME);
		if (ASSETS.length > 0) {
			await cache.addAll(ASSETS);
		}
	}

	event.waitUntil(addFilesToCache().then(() => sw.skipWaiting()));
});

sw.addEventListener('activate', (event) => {
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE_NAME) {
				await caches.delete(key);
			}
		}
	}

	event.waitUntil(deleteOldCaches().then(() => sw.clients.claim()));
});

sw.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	const url = new URL(event.request.url);
	if (url.origin !== sw.location.origin) return;

	async function respond(): Promise<Response> {
		const cache = await caches.open(CACHE_NAME);

		// Serve static build/files assets directly from cache first
		if (ASSETS.includes(url.pathname)) {
			const cachedAsset = await cache.match(url.pathname);
			if (cachedAsset) {
				return cachedAsset;
			}
		}

		// For navigation/other requests, try network first then fall back to cache
		try {
			const response = await fetch(event.request);

			if (!(response instanceof Response)) {
				throw new Error('Invalid response from fetch');
			}

			if (response.status === 200) {
				cache.put(event.request, response.clone());
			}

			return response;
		} catch (err) {
			const cachedResponse = await cache.match(event.request);
			if (cachedResponse) {
				return cachedResponse;
			}

			// Fallback to root shell for SPA navigation when offline
			if (event.request.mode === 'navigate') {
				const fallback = (await cache.match(url.pathname)) ?? (await cache.match('/'));
				if (fallback) {
					return fallback;
				}
			}

			throw err;
		}
	}

	event.respondWith(respond());
});
