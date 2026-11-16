// src/lib/features/network/online.svelte.ts
// One shared, reactive view of connectivity. The app uses it to avoid endless
// spinners and to label data that came from the local cache instead of the network.
import { browser } from '$app/environment';

let online = $state(true);
let started = false;

export const network = {
	get online() {
		return online;
	},

	start() {
		if (!browser || started) return;
		started = true;
		online = navigator.onLine;
		window.addEventListener('online', () => (online = true));
		window.addEventListener('offline', () => (online = false));
	}
};
