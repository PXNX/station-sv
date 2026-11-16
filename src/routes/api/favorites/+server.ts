// src/routes/favorites/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { stations } from '$lib/server/schema';
import { inArray } from 'drizzle-orm';

async function fetchStationPhoto(stationIdGer: number) {
	try {
		const response = await fetch(
			`https://api.railway-stations.org/photoStationById/de/${stationIdGer}`
		);
		if (!response.ok) {
			return null;
		}
		const data = await response.json();
		const photos = data.stations?.[0]?.photos || [];
		if (photos.length > 0) {
			return `${data.photoBaseUrl || 'https://api.railway-stations.org/photos/'}${photos[0].path}`;
		}
		return null;
	} catch (error) {
		console.error('Failed to fetch station photo:', error);
		return null;
	}
}

export const GET: RequestHandler = async ({ url }) => {
	// Get favorite EVA numbers from URL params
	const evaParam = url.searchParams.get('evas');

	if (!evaParam) {
		return json({ stations: [] });
	}

	const evaNumbers = evaParam
		.split(',')
		.map((eva) => parseInt(eva))
		.filter((eva) => !isNaN(eva));

	if (evaNumbers.length === 0) {
		return json({ stations: [] });
	}

	// Fetch stations from database
	const dbStations = await db.select().from(stations).where(inArray(stations.eva, evaNumbers));

	// Fetch photos for each station
	const stationsWithPhotos = await Promise.all(
		dbStations.map(async (station) => {
			let photoUrl = null;
			if (station.stationIdGER) {
				photoUrl = await fetchStationPhoto(station.stationIdGER);
			}

			return {
				eva: station.eva,
				name: station.name,
				city: station.city,
				country: station.country,
				category: station.category,
				has_warm_sleep: station.hasWarmSleep,
				has_outlets: station.hasOutlets,
				has_toilets: station.hasToilets,
				toilets_open_at_night: station.toiletsOpenAtNight,
				is_open_24h: station.isOpen24h,
				has_wifi: station.hasWifi,
				photoUrl
			};
		})
	);

	return json({ stations: stationsWithPhotos });
};
