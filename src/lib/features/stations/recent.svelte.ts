// src/lib/features/stations/recent.svelte.ts
// A short, local history of stations the traveler opened. No account needed.
import { browser } from '$app/environment';
import type { StationResult } from '$lib/types';

const KEY = 'station_recently_viewed';
const MAX = 8;

let stations = $state<StationResult[]>([]);
let initialised = false;

function read(): StationResult[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(KEY);
		const parsed = raw ? JSON.parse(raw) : [];
		return Array.isArray(parsed) ? (parsed as StationResult[]) : [];
	} catch {
		return [];
	}
}

function write(next: StationResult[]) {
	if (!browser) return;
	try {
		localStorage.setItem(KEY, JSON.stringify(next));
	} catch {
		// Storage may be unavailable — the session still works.
	}
}

export const recentlyViewed = {
	get stations() {
		return stations;
	},

	load() {
		if (!browser || initialised) return;
		initialised = true;
		stations = read();
	},

	visit(station: StationResult) {
		stations = [station, ...stations.filter((s) => s.eva !== station.eva)].slice(0, MAX);
		write(stations);
	},

	clear() {
		stations = [];
		write(stations);
	}
};
