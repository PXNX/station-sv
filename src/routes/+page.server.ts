// src/routes/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { stations } from '$lib/server/schema';
import { eq, and, or, sql, asc, desc } from 'drizzle-orm';
import type { StationResult } from '$lib/types';

/**
 * Fetch photo for a specific station by German ID
 */
async function fetchStationPhotoById(country: string, germanId: number) {
	try {
		const url = `https://api.railway-stations.org/photoStationById/${country.toLowerCase()}/${germanId}`;
		const response = await fetch(url);

		if (!response.ok) {
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
 * Search stations with enhanced fuzzy matching and priority ranking
 */
async function searchStationsInDB(
	query: string,
	filters?: {
		open24h?: boolean;
		warmSleep?: boolean;
		toilets?: boolean;
		toiletsAtNight?: boolean;
		outlets?: boolean;
		wifi?: boolean;
	}
) {
	try {
		const conditions = [];

		// Fuzzy search using pg_trgm similarity
		if (query && query.length >= 2) {
			const searchLower = query.toLowerCase();

			// Combined fuzzy and exact matching with improved scoring
			conditions.push(
				or(
					// Trigram similarity matching (finds typos, misspellings)
					sql`${stations.name} % ${query}`,
					sql`${stations.city} % ${query}`,
					// Exact prefix matches (prioritized)
					sql`LOWER(${stations.name}) LIKE ${`${searchLower}%`}`,
					sql`LOWER(${stations.city}) LIKE ${`${searchLower}%`}`,
					// Contains matches (lower priority)
					sql`LOWER(${stations.name}) LIKE ${`%${searchLower}%`}`,
					sql`LOWER(${stations.city}) LIKE ${`%${searchLower}%`}`
				)
			);
		}

		// Apply filters
		if (filters?.open24h) conditions.push(eq(stations.isOpen24h, true));
		if (filters?.warmSleep) conditions.push(eq(stations.hasWarmSleep, true));
		if (filters?.toilets) conditions.push(eq(stations.hasToilets, true));
		if (filters?.toiletsAtNight) conditions.push(eq(stations.toiletsOpenAtNight, true));
		if (filters?.outlets) conditions.push(eq(stations.hasOutlets, true));
		if (filters?.wifi) conditions.push(eq(stations.hasWifi, true));

		// Execute query with enhanced priority ranking
		const results = await db
			.select({
				eva: stations.eva,
				stationIdGER: stations.stationIdGER,
				name: stations.name,
				city: stations.city,
				country: stations.country,
				category: stations.category,
				priceCategory: stations.priceCategory,
				hasWarmSleep: stations.hasWarmSleep,
				sleepNotes: stations.sleepNotes,
				hasOutlets: stations.hasOutlets,
				outletNotes: stations.outletNotes,
				hasToilets: stations.hasToilets,
				toiletNotes: stations.toiletNotes,
				toiletsOpenAtNight: stations.toiletsOpenAtNight,
				isOpen24h: stations.isOpen24h,
				openingHours: stations.openingHours,
				hasWifi: stations.hasWifi,
				wifiHasLimit: stations.wifiHasLimit,
				wifiNotes: stations.wifiNotes,
				latitude: stations.latitude,
				longitude: stations.longitude,
				additionalInfo: stations.additionalInfo,
				// Enhanced similarity scoring with multiple factors
				similarityScore: sql<number>`
					GREATEST(
						-- Trigram similarity (0-1 scale)
						similarity(${stations.name}, ${query}) * 2.0,
						COALESCE(similarity(${stations.city}, ${query}), 0) * 1.5,
						-- Exact prefix match bonus
						CASE 
							WHEN LOWER(${stations.name}) LIKE ${`${query.toLowerCase()}%`} THEN 2.0
							WHEN LOWER(${stations.city}) LIKE ${`${query.toLowerCase()}%`} THEN 1.8
							ELSE 0
						END,
						-- Contains match bonus (lower than prefix)
						CASE 
							WHEN LOWER(${stations.name}) LIKE ${`%${query.toLowerCase()}%`} THEN 1.0
							WHEN LOWER(${stations.city}) LIKE ${`%${query.toLowerCase()}%`} THEN 0.8
							ELSE 0
						END
					)
				`.as('similarity_score')
			})
			.from(stations)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(
				desc(sql`similarity_score`), // Best matches first
				asc(stations.category) // Then by station importance
			)
			.limit(30);

		return results;
	} catch (error) {
		console.error('Database query error:', error);

		// Fallback to simple LIKE search if pg_trgm is not available
		try {
			const searchLower = query.toLowerCase();
			const conditions = [
				or(
					sql`LOWER(${stations.name}) LIKE ${`%${searchLower}%`}`,
					sql`LOWER(${stations.city}) LIKE ${`%${searchLower}%`}`
				)
			];

			// Apply filters
			if (filters?.open24h) conditions.push(eq(stations.isOpen24h, true));
			if (filters?.warmSleep) conditions.push(eq(stations.hasWarmSleep, true));
			if (filters?.toilets) conditions.push(eq(stations.hasToilets, true));
			if (filters?.toiletsAtNight) conditions.push(eq(stations.toiletsOpenAtNight, true));
			if (filters?.outlets) conditions.push(eq(stations.hasOutlets, true));
			if (filters?.wifi) conditions.push(eq(stations.hasWifi, true));

			const results = await db
				.select()
				.from(stations)
				.where(and(...conditions))
				.orderBy(asc(stations.category))
				.limit(50);

			return results.map((r) => ({ ...r, similarityScore: 0 }));
		} catch (fallbackError) {
			console.error('Fallback query error:', fallbackError);
			return [];
		}
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
			category: dbStation.category,
			has_warm_sleep: dbStation.hasWarmSleep,
			has_outlets: dbStation.hasOutlets,
			has_toilets: dbStation.hasToilets,
			toilets_open_at_night: dbStation.toiletsOpenAtNight,
			is_open_24h: dbStation.isOpen24h,
			has_wifi: dbStation.hasWifi,
			photoUrl: photoData ? `${photoData.photoBaseUrl}${photoData.photoPath}` : null
		};
	});
}

export const load: PageServerLoad = async ({ url, locals }) => {
	const searchName = url.searchParams.get('name');
	const filterOpen24h = url.searchParams.get('open24h') === 'true';
	const filterWarmSleep = url.searchParams.get('warmSleep') === 'true';
	const filterToilets = url.searchParams.get('toilets') === 'true';
	const filterToiletsAtNight = url.searchParams.get('toiletsAtNight') === 'true';
	const filterOutlets = url.searchParams.get('outlets') === 'true';
	const filterWifi = url.searchParams.get('wifi') === 'true';

	if (!searchName) {
		return {
			stations: [],
			filters: {
				open24h: filterOpen24h,
				warmSleep: filterWarmSleep,
				toilets: filterToilets,
				toiletsAtNight: filterToiletsAtNight,
				outlets: filterOutlets,
				wifi: filterWifi
			},
			user: locals.user,
			session: locals.session
		};
	}

	// Fetch from database with fuzzy search
	const dbStations = await searchStationsInDB(searchName, {
		open24h: filterOpen24h,
		warmSleep: filterWarmSleep,
		toilets: filterToilets,
		toiletsAtNight: filterToiletsAtNight,
		outlets: filterOutlets,
		wifi: filterWifi
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
			outlets: filterOutlets,
			wifi: filterWifi
		},
		user: locals.user,
		session: locals.session
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
		const filterWifi = formData.get('wifi') === 'on';

		if (!name || name.length < 2) {
			return {
				stations: [],
				error: 'Please enter at least 2 characters'
			};
		}

		// Fetch from database with fuzzy search
		const dbStations = await searchStationsInDB(name, {
			open24h: filterOpen24h,
			warmSleep: filterWarmSleep,
			toilets: filterToilets,
			toiletsAtNight: filterToiletsAtNight,
			outlets: filterOutlets,
			wifi: filterWifi
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
