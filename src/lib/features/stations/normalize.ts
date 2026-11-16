// src/lib/features/stations/normalize.ts
// Boundary helpers: data from imports and the database is not always clean.
// Normalise once here so every presentation surface sees the same values.
import type { StationCategory } from '$lib/types';

/** Category is 1..7 in the source data; anything else becomes the lowest tier. */
export function normalizeCategory(value: unknown): StationCategory {
	const n = typeof value === 'number' ? value : Number(value);
	return Number.isInteger(n) && n >= 1 && n <= 7 ? (n as StationCategory) : 7;
}

/** Many stations carry their own name as "city" — don't print it twice. */
export function displayCity(name: string, city: string | null | undefined): string | null {
	if (!city) return null;
	const trimmed = city.trim();
	if (!trimmed) return null;
	return trimmed.localeCompare(name.trim(), undefined, { sensitivity: 'accent' }) === 0
		? null
		: trimmed;
}

/** Source files mix `de` and `DE`; the UI always shows the uppercase code. */
export function normalizeCountry(value: string | null | undefined): string {
	return (value || 'DE').trim().toUpperCase().slice(0, 2);
}

/** Join a photo base URL and path exactly once, whatever slashes each uses. */
export function photoUrl(base: string | null | undefined, path: string | null | undefined) {
	if (!path) return null;
	const root = (base || 'https://api.railway-stations.org/photos').replace(/\/+$/, '');
	return `${root}/${path.replace(/^\/+/, '')}`;
}
