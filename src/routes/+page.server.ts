// src/routes/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import type { Station } from '$lib/types';
import { db } from '$lib/server/db';
import { stations } from '$lib/server/schema';
import { eq, and, like, or, sql } from 'drizzle-orm';

/**
 * Fetch recent photos from railway-stations.org API
 */
async function fetchRecentStationPhotos(sinceHours = 800) {
	try {
		const response = await fetch(
			`https://api.railway-stations.org/photoStationsByRecentPhotoImports?sinceHours=${sinceHours}`
		);

		if (!response.ok) {
			throw new Error(`API error: ${response.status}`);
		}

		const data = await response.json();

		return {
			photoBaseUrl: data.photoBaseUrl || 'https://api.railway-stations.org/photos/',
			stations: data.stations || []
		};
	} catch (error) {
		console.error('Failed to fetch recent photos:', error);
		return {
			photoBaseUrl: 'https://api.railway-stations.org/photos/',
			stations: []
		};
	}
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
function mergeStationData(dbStations: any[], apiData: any) {
	const apiStationMap = new Map();

	// Create a map of API stations by ID
	if (apiData.stations) {
		for (const apiStation of apiData.stations) {
			apiStationMap.set(`${apiStation.country}-${apiStation.id}`, apiStation);
		}
	}

	// Merge data
	return dbStations.map((dbStation) => {
		const apiStation = apiStationMap.get(`${dbStation.country}-${dbStation.stationId}`);

		return {
			station_id: dbStation.stationId,
			name: dbStation.name,
			city: dbStation.city,
			country: dbStation.country,
			has_warm_sleep: dbStation.hasWarmSleep,
			sleep_notes: dbStation.sleepNotes,
			has_outlets: dbStation.hasOutlets,
			outlet_notes: dbStation.outletNotes,
			has_toilets: dbStation.hasToilets,
			toilet_notes: dbStation.toiletNotes,
			toilets_open_at_night: dbStation.toiletsOpenAtNight,
			is_open_24h: dbStation.isOpen24h,
			opening_hours: dbStation.openingHours,
			latitude: dbStation.latitude,
			longitude: dbStation.longitude,
			additional_info: dbStation.additionalInfo,
			// Add photo data from API if available
			photos: apiStation?.photos || [],
			photoUrl: apiStation?.photos?.[0]
				? `${apiData.photoBaseUrl}${apiStation.photos[0].path}`
				: null,
			photographer: apiStation?.photos?.[0]?.photographer,
			photoTimestamp: apiStation?.photos?.[0]?.createdAt
		};
	});
}

export const load: PageServerLoad = async ({ url }) => {
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
			}
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

	// Fetch recent photos from API
	const apiData = await fetchRecentStationPhotos(800);

	// Merge data
	const stations = mergeStationData(dbStations, apiData);

	return {
		stations,
		filters: {
			open24h: filterOpen24h,
			warmSleep: filterWarmSleep,
			toilets: filterToilets,
			toiletsAtNight: filterToiletsAtNight,
			outlets: filterOutlets
		}
	};
};

export const actions: Actions = {
	search: async ({ request }) => {
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

		// Fetch recent photos from API
		const apiData = await fetchRecentStationPhotos(800);

		// Merge data
		const stations = mergeStationData(dbStations, apiData);

		return {
			stations,
			success: true
		};
	}
};
