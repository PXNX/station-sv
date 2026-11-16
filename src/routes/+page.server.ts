// src/routes/+page.server.ts
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { stations } from '$lib/server/schema';
import { or, sql, asc, desc } from 'drizzle-orm';
import type { StationResult } from '$lib/types';

const FILTER_KEYS = [
	'open24h',
	'warmSleep',
	'toilets',
	'toiletsAtNight',
	'outlets',
	'wifi'
] as const;

type FilterKey = (typeof FILTER_KEYS)[number];

/** Fetch the newest photo for one station. */
async function fetchStationPhotoById(country: string, germanId: number) {
	try {
		const url = `https://api.railway-stations.org/photoStationById/${country.toLowerCase()}/${germanId}`;
		const response = await fetch(url);
		if (!response.ok) return null;

		const data = await response.json();
		const station = data.stations?.[0];
		const latestPhoto = station?.photos?.at(-1);
		if (!latestPhoto?.path) return null;

		return {
			photoBaseUrl: data.photoBaseUrl || 'https://api.railway-stations.org/photos',
			photoPath: latestPhoto.path
		};
	} catch (error) {
		console.error(`Failed to fetch photo for station ${country}/${germanId}:`, error);
		return null;
	}
}

/** Fetch photos for several stations in parallel. */
async function fetchStationPhotos(stationIds: { country: string; germanId: number }[]) {
	const results = await Promise.all(
		stationIds
			.filter(({ germanId }) => germanId != null)
			.map(async ({ country, germanId }) => ({
				key: `${country}-${germanId}`,
				photo: await fetchStationPhotoById(country, germanId)
			}))
	);

	const photoMap = new Map<string, { photoBaseUrl: string; photoPath: string }>();
	for (const { key, photo } of results) {
		if (photo) photoMap.set(key, photo);
	}
	return photoMap;
}

/**
 * Fuzzy station search. Amenity filters are applied in the browser so toggling
 * one is instant and doesn't refetch photos; this query only narrows by name/city.
 */
async function searchStationsInDB(query: string) {
	try {
		return await db
			.select({
				eva: stations.eva,
				stationIdGER: stations.stationIdGER,
				name: stations.name,
				city: stations.city,
				country: stations.country,
				category: stations.category,
				hasWarmSleep: stations.hasWarmSleep,
				hasOutlets: stations.hasOutlets,
				hasToilets: stations.hasToilets,
				toiletsOpenAtNight: stations.toiletsOpenAtNight,
				isOpen24h: stations.isOpen24h,
				hasWifi: stations.hasWifi,
				similarityScore: sql<number>`
					GREATEST(
						similarity(${stations.name}, ${query}) * 2.0,
						COALESCE(similarity(${stations.city}, ${query}), 0) * 1.5,
						CASE WHEN LOWER(${stations.name}) LIKE ${`${query.toLowerCase()}%`} THEN 2.0
						     WHEN LOWER(${stations.city}) LIKE ${`${query.toLowerCase()}%`} THEN 1.8
						     ELSE 0 END,
						CASE WHEN LOWER(${stations.name}) LIKE ${`%${query.toLowerCase()}%`} THEN 1.0
						     WHEN LOWER(${stations.city}) LIKE ${`%${query.toLowerCase()}%`} THEN 0.8
						     ELSE 0 END
					)
				`.as('similarity_score')
			})
			.from(stations)
			.where(
				or(
					sql`${stations.name} % ${query}`,
					sql`${stations.city} % ${query}`,
					sql`LOWER(${stations.name}) LIKE ${`${query.toLowerCase()}%`}`,
					sql`LOWER(${stations.city}) LIKE ${`${query.toLowerCase()}%`}`,
					sql`LOWER(${stations.name}) LIKE ${`%${query.toLowerCase()}%`}`,
					sql`LOWER(${stations.city}) LIKE ${`%${query.toLowerCase()}%`}`
				)
			)
			.orderBy(desc(sql`similarity_score`), asc(stations.category))
			.limit(40);
	} catch (error) {
		console.error('Database query error:', error);
		try {
			const like = `%${query.toLowerCase()}%`;
			return (await db
				.select()
				.from(stations)
				.where(or(sql`LOWER(${stations.name}) LIKE ${like}`, sql`LOWER(${stations.city}) LIKE ${like}`))
				.orderBy(asc(stations.category))
				.limit(40)
			).map((r) => ({ ...r, similarityScore: 0 }));
		} catch (fallbackError) {
			console.error('Fallback query error:', fallbackError);
			return [];
		}
	}
}

function mergeStationData(dbStations: any[], photoMap: Map<string, any>): StationResult[] {
	return dbStations.map((dbStation) => {
		const photo = dbStation.stationIdGER
			? photoMap.get(`${dbStation.country}-${dbStation.stationIdGER}`)
			: null;
		return {
			eva: dbStation.eva,
			name: dbStation.name,
			city: dbStation.city,
			country: dbStation.country,
			category: dbStation.category,
			has_warm_sleep: dbStation.hasWarmSleep,
			has_outlets: dbStation.hasOutlets,
			has_toilets: dbStation.hasToilets,
			toilets_open_at_night: dbStation.toiletsOpenAtNight,
			is_open_24h: dbStation.isOpen24h,
			has_wifi: dbStation.hasWifi,
			photoUrl: photo ? `${photo.photoBaseUrl}${photo.photoPath}` : null
		};
	});
}

export const load: PageServerLoad = async ({ url, locals }) => {
	const query = url.searchParams.get('name')?.trim() ?? '';
	// Accept both `true` (legacy links) and `on` (native checkbox submits).
	const filters = Object.fromEntries(
		FILTER_KEYS.map((key) => [
			key,
			url.searchParams.get(key) === 'true' || url.searchParams.get(key) === 'on'
		])
	) as Record<FilterKey, boolean>;

	const base = { query, filters, user: locals.user, session: locals.session };
	if (query.length < 2) return { ...base, stations: [] };

	const dbStations = await searchStationsInDB(query);
	const photoMap = await fetchStationPhotos(
		dbStations
			.filter((s) => s.stationIdGER != null)
			.map((s) => ({ country: s.country, germanId: s.stationIdGER! }))
	);

	return { ...base, stations: mergeStationData(dbStations, photoMap) };
};
