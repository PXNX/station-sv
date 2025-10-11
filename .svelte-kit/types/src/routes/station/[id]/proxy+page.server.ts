// @ts-nocheck
// src/routes/station/[id]/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { stations } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

interface BahnhofDeStation {
	number: number;
	name: string;
	mailingAddress?: {
		city?: string;
		zipcode?: string;
		street?: string;
	};
	evaNumbers?: Array<{
		number: number;
		geographicCoordinates?: {
			coordinates: [number, number]; // [longitude, latitude]
		};
	}>;
	ril100Identifiers?: Array<{
		rilIdentifier: string;
	}>;
}

async function fetchStationFromBahnhofDe(stationId: number) {
	try {
		const response = await fetch(
			`https://apis.deutschebahn.com/db-api-marketplace/apis/station-data/v2/stations/${stationId}`,
			{
				headers: {
					Accept: 'application/json'
				}
			}
		);

		if (!response.ok) {
			console.error(`Failed to fetch station from bahnhof.de: ${response.status}`);
			return null;
		}

		const data: BahnhofDeStation = await response.json();

		// Extract coordinates from evaNumbers
		let latitude: number | undefined;
		let longitude: number | undefined;

		if (data.evaNumbers && data.evaNumbers.length > 0) {
			const primaryEva = data.evaNumbers[0];
			if (primaryEva.geographicCoordinates?.coordinates) {
				[longitude, latitude] = primaryEva.geographicCoordinates.coordinates;
			}
		}

		return {
			number: data.number,
			name: data.name,
			city: data.mailingAddress?.city,
			latitude,
			longitude
		};
	} catch (err) {
		console.error('Error fetching from bahnhof.de:', err);
		return null;
	}
}

async function fetchStationPhotos(stationId: number) {
	try {
		const response = await fetch(
			`https://api.railway-stations.org/photoStationById/de/${stationId}`
		);

		if (!response.ok) {
			return null;
		}

		const data = await response.json();
		return {
			photoBaseUrl: data.photoBaseUrl || 'https://api.railway-stations.org/photos/',
			photos: data.stations?.[0]?.photos || []
		};
	} catch (error) {
		console.error('Failed to fetch station photos:', error);
		return null;
	}
}

function getStationImageUrl(stationId: number): string {
	return `https://map.railway-stations.org/station.php?stationId=${stationId}`;
}

function getStationPdfUrl(stationId: number): string {
	return `https://www.bahnhof.de/downloads/station-plans/${stationId}.pdf`;
}

export const load = async ({ params }: Parameters<PageServerLoad>[0]) => {
	const stationId = parseInt(params.id);

	if (isNaN(stationId)) {
		throw error(400, 'Invalid station ID');
	}

	// Try to find station in database
	const dbStation = await db
		.select()
		.from(stations)
		.where(eq(stations.stationId, stationId))
		.limit(1);

	let station = dbStation[0];

	// If not in database, try to fetch from API and create basic entry
	if (!station) {
		const apiData = await fetchStationFromBahnhofDe(stationId);

		if (apiData && apiData.name && apiData.latitude && apiData.longitude) {
			// Insert new station into database
			const newStation = await db
				.insert(stations)
				.values({
					stationId: stationId,
					name: apiData.name,
					city: apiData.city || '',
					country: 'DE',
					latitude: apiData.latitude,
					longitude: apiData.longitude,
					hasWarmSleep: false,
					hasOutlets: false,
					hasToilets: false,
					toiletsOpenAtNight: false,
					isOpen24h: false,
					additionalInfo:
						'Station information not yet available. Please contribute if you visit this station!'
				})
				.returning();

			station = newStation[0];
		} else {
			throw error(404, 'Station not found');
		}
	}

	// Fetch photos from railway-stations.org API
	const photoData = await fetchStationPhotos(stationId);

	return {
		station: {
			station_id: station.stationId,
			name: station.name,
			city: station.city,
			country: station.country,
			has_warm_sleep: station.hasWarmSleep,
			sleep_notes: station.sleepNotes,
			has_outlets: station.hasOutlets,
			outlet_notes: station.outletNotes,
			has_toilets: station.hasToilets,
			toilet_notes: station.toiletNotes,
			toilets_open_at_night: station.toiletsOpenAtNight,
			is_open_24h: station.isOpen24h,
			opening_hours: station.openingHours,
			latitude: station.latitude,
			longitude: station.longitude,
			additional_info: station.additionalInfo
		},
		photos: photoData?.photos || [],
		photoBaseUrl: photoData?.photoBaseUrl || 'https://api.railway-stations.org/photos/',
		imageUrl: getStationImageUrl(stationId),
		pdfUrl: getStationPdfUrl(stationId)
	};
};
