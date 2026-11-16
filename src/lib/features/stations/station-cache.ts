// src/lib/features/stations/station-cache.ts
// A small, bounded local copy of station summaries. It exists so favorites can
// render instantly (and offline) even when the API is slow or unreachable.
import { browser } from '$app/environment';
import type { StationResult } from '$lib/types';

const KEY = 'station_cache_v1';
const MAX_ENTRIES = 150;

export interface CachedStation {
	station: StationResult;
	savedAt: number;
}

type StationCache = Record<number, CachedStation>;

function read(): StationCache {
	if (!browser) return {};
	try {
		const raw = localStorage.getItem(KEY);
		const parsed = raw ? JSON.parse(raw) : {};
		return parsed && typeof parsed === 'object' ? (parsed as StationCache) : {};
	} catch {
		return {};
	}
}

function write(cache: StationCache) {
	if (!browser) return;
	try {
		localStorage.setItem(KEY, JSON.stringify(cache));
	} catch {
		// Storage can be full or disabled — the app still works, just without this cache.
	}
}

/** Add or refresh station summaries, keeping the cache bounded. */
export function rememberStations(stations: StationResult[]) {
	if (!browser || stations.length === 0) return;
	const cache = read();
	const savedAt = Date.now();

	for (const station of stations) {
		cache[station.eva] = { station, savedAt };
	}

	const entries = Object.entries(cache)
		.sort((a, b) => b[1].savedAt - a[1].savedAt)
		.slice(0, MAX_ENTRIES);

	write(Object.fromEntries(entries) as StationCache);
}

/** Return cached stations in the requested order, skipping missing entries. */
export function getCachedStations(evas: number[]): StationResult[] {
	const cache = read();
	return evas.flatMap((eva) => {
		const entry = cache[eva];
		return entry ? [entry.station] : [];
	});
}

/** All locally known stations, newest first — used for offline search. */
export function getAllCachedStations(): StationResult[] {
	return Object.values(read())
		.sort((a, b) => b.savedAt - a.savedAt)
		.map((entry) => entry.station);
}

export function clearStationCache() {
	if (!browser) return;
	try {
		localStorage.removeItem(KEY);
	} catch {
		// Ignore storage failures.
	}
}
