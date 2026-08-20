// src/lib/client/favorites.svelte.ts
// Shared favourites state. Previously the home page, the favourites page and the
// station detail page each kept their own copy of this localStorage logic, and the
// home page polled localStorage once a second to keep its counter fresh.
import { browser } from '$app/environment';

const STORAGE_KEY = 'station_favorites';

let evas = $state<number[]>([]);
let initialised = false;

function read(): number[] {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		const parsed = stored ? JSON.parse(stored) : [];
		return Array.isArray(parsed) ? parsed : [];
	} catch (error) {
		console.error('Failed to load favorites:', error);
		return [];
	}
}

function write(next: number[]) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
	} catch (error) {
		console.error('Failed to save favorites:', error);
	}
}

export const favorites = {
	get evas() {
		return evas;
	},

	get count() {
		return evas.length;
	},

	has(eva: number) {
		return evas.includes(eva);
	},

	/**
	 * Reads localStorage and starts listening for changes from other tabs.
	 * Safe to call from several components; only the first call does work.
	 * Call this after mount so the server and client render the same markup.
	 */
	load() {
		if (!browser || initialised) return;
		initialised = true;
		evas = read();
		window.addEventListener('storage', (event) => {
			if (event.key === STORAGE_KEY) evas = read();
		});
	},

	toggle(eva: number) {
		evas = evas.includes(eva) ? evas.filter((id) => id !== eva) : [...evas, eva];
		write(evas);
	},

	clear() {
		evas = [];
		write(evas);
	}
};
