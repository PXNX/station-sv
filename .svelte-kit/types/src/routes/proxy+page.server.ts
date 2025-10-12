// @ts-nocheck
// src/routes/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { stations } from '$lib/server/schema';
import { eq, and, or, sql } from 'drizzle-orm';
import type { StationResult } from '$lib/types';

/**
 * Fetch photo for a specific station by German ID
 */
async function fetchStationPhotoById(country: string, germanId: number) {
	try {
		const url = `https://api.railway-stations.org/photoStationById/${country.toLowerCase()}/${germanId}`;
		const response = await fetch(url);

		if (!response.ok) {
			console.log('Response not OK:', response.statusText);
			return null;
		}

		const data = await response.json();

		if (!data.stations || data.stations.length === 0) {
			return null;
		}

		const station = data.stations[0];
		if (!station.photos || station.photos.length === 0) {
			return null;
		}

		// Get the latest photo (last in array) - most recent upload
		const latestPhoto = station.photos[station.photos.length - 1];

		// Ensure photo path is valid
		if (!latestPhoto.path) {
			return null;
		}

		return {
			photoBaseUrl: data.photoBaseUrl || 'https://api.railway-stations.org/photos',
			photoPath: latestPhoto.path
		};
	} catch (error) {
		console.error(`Failed to fetch photo for station ${country}/${germanId}:`, error);
		return null;
	}
}

/**
 * Fetch photos for multiple stations in parallel
 */
async function fetchStationPhotos(stationIds: { country: string; germanId: number }[]) {
	const photoPromises = stationIds
		.filter(({ germanId }) => germanId != null)
		.map(({ country, germanId }) =>
			fetchStationPhotoById(country, germanId).then((photo) => ({
				key: `${country}-${germanId}`,
				photo
			}))
		);

	const results = await Promise.all(photoPromises);

	const photoMap = new Map();
	for (const { key, photo } of results) {
		if (photo) {
			photoMap.set(key, photo);
		}
	}

	return photoMap;
}

/**
 * Search stations in local database with filters
 */
async function searchStationsInDB(
	query: string,
	filters?: {
		open24h?: boolean;
		warmSleep?: boolean;
		toilets?: boolean;
		toiletsAtNight?: boolean;
		outlets?: boolean;
	}
) {
	try {
		const conditions = [];

		// Search by name or city (case-insensitive)
		if (query && query.length >= 2) {
			const searchLower = query.toLowerCase();
			const searchPattern = `%${searchLower}%`;
			conditions.push(
				or(
					sql`LOWER(${stations.name}) LIKE ${searchPattern}`,
					sql`LOWER(${stations.city}) LIKE ${searchPattern}`
				)
			);
		}

		// Apply filters
		if (filters?.open24h) {
			conditions.push(eq(stations.isOpen24h, true));
		}

		if (filters?.warmSleep) {
			conditions.push(eq(stations.hasWarmSleep, true));
		}

		if (filters?.toilets) {
			conditions.push(eq(stations.hasToilets, true));
		}

		if (filters?.toiletsAtNight) {
			conditions.push(eq(stations.toiletsOpenAtNight, true));
		}

		if (filters?.outlets) {
			conditions.push(eq(stations.hasOutlets, true));
		}

		// Execute query
		const results = await db
			.select()
			.from(stations)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.limit(50);

		return results;
	} catch (error) {
		console.error('Database query error:', error);
		return [];
	}
}

/**
 * Merge API photo data with local DB amenities data
 */
function mergeStationData(dbStations: any[], photoMap: Map<string, any>): StationResult[] {
	return dbStations.map((dbStation) => {
		// Use stationIdGER for photo lookup
		const photoData = dbStation.stationIdGER
			? photoMap.get(`${dbStation.country}-${dbStation.stationIdGER}`)
			: null;

		return {
			eva: dbStation.eva,
			name: dbStation.name,
			city: dbStation.city,
			country: dbStation.country,
			has_warm_sleep: dbStation.hasWarmSleep,
			has_outlets: dbStation.hasOutlets,
			has_toilets: dbStation.hasToilets,
			toilets_open_at_night: dbStation.toiletsOpenAtNight,
			is_open_24h: dbStation.isOpen24h,
			photoUrl: photoData ? `${photoData.photoBaseUrl}${photoData.photoPath}` : null
		};
	});
}

export const load = async ({ url, locals }: Parameters<PageServerLoad>[0]) => {
	const searchName = url.searchParams.get('name');
	const filterOpen24h = url.searchParams.get('open24h') === 'true';
	const filterWarmSleep = url.searchParams.get('warmSleep') === 'true';
	const filterToilets = url.searchParams.get('toilets') === 'true';
	const filterToiletsAtNight = url.searchParams.get('toiletsAtNight') === 'true';
	const filterOutlets = url.searchParams.get('outlets') === 'true';

	if (!searchName) {
		return {
			stations: [],
			filters: {
				open24h: filterOpen24h,
				warmSleep: filterWarmSleep,
				toilets: filterToilets,
				toiletsAtNight: filterToiletsAtNight,
				outlets: filterOutlets
			},
			user: locals.user,
			session: locals.session
		};
	}

	// Fetch from database
	const dbStations = await searchStationsInDB(searchName, {
		open24h: filterOpen24h,
		warmSleep: filterWarmSleep,
		toilets: filterToilets,
		toiletsAtNight: filterToiletsAtNight,
		outlets: filterOutlets
	});

	// Fetch photos for all found stations (using German IDs)
	const stationIds = dbStations
		.filter((s) => s.stationIdGER != null)
		.map((s) => ({
			country: s.country,
			germanId: s.stationIdGER
		}));

	const photoMap = await fetchStationPhotos(stationIds);

	// Merge data with latest photos
	const stationsData = mergeStationData(dbStations, photoMap);

	return {
		stations: stationsData,
		filters: {
			open24h: filterOpen24h,
			warmSleep: filterWarmSleep,
			toilets: filterToilets,
			toiletsAtNight: filterToiletsAtNight,
			outlets: filterOutlets
		},
		user: locals.user,
		session: locals.session
	};
};

export const actions = {
	search: async ({ request }: import('./$types').RequestEvent) => {
		const formData = await request.formData();
		const name = formData.get('name')?.toString() || '';
		const filterOpen24h = formData.get('open24h') === 'on';
		const filterWarmSleep = formData.get('warmSleep') === 'on';
		const filterToilets = formData.get('toilets') === 'on';
		const filterToiletsAtNight = formData.get('toiletsAtNight') === 'on';
		const filterOutlets = formData.get('outlets') === 'on';

		if (!name || name.length < 2) {
			return {
				stations: [],
				error: 'Please enter at least 2 characters'
			};
		}

		// Fetch from database
		const dbStations = await searchStationsInDB(name, {
			open24h: filterOpen24h,
			warmSleep: filterWarmSleep,
			toilets: filterToilets,
			toiletsAtNight: filterToiletsAtNight,
			outlets: filterOutlets
		});

		// Fetch photos for all found stations (using German IDs)
		const stationIds = dbStations
			.filter((s) => s.stationIdGER != null)
			.map((s) => ({
				country: s.country,
				germanId: s.stationIdGER
			}));

		const photoMap = await fetchStationPhotos(stationIds);

		// Merge data with latest photos
		const stationsData = mergeStationData(dbStations, photoMap);

		return {
			stations: stationsData,
			success: true
		};
	}
};
;null as any as Actions;