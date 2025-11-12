// src/routes/station/[id]/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { stations } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

async function fetchStationPhotos(stationIdGer: number) {
	try {
		const response = await fetch(
			`https://api.railway-stations.org/photoStationById/de/${stationIdGer}`
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

function getStationImageUrl(stationIdGer: number): string {
	return `https://map.railway-stations.org/station.php?stationId=${stationIdGer}`;
}

function getStationPdfUrl(stationIdGer: number): string {
	return `https://www.bahnhof.de/downloads/station-plans/${stationIdGer}.pdf`;
}

export const load: PageServerLoad = async ({ params }) => {
	const eva = parseInt(params.eva);
	if (isNaN(eva)) {
		throw error(400, 'Invalid EVA number');
	}

	// Try to find station in database
	const dbStation = await db.select().from(stations).where(eq(stations.eva, eva)).limit(1);
	const station = dbStation[0];

	// If not in database, we can't create it without knowing the stationIdGer
	if (!station) {
		throw error(404, 'Station not found in database. Please add it first.');
	}

	// Fetch photos if we have a stationIdGer
	let photoData = null;
	let imageUrl = null;
	let pdfUrl = null;

	if (station.stationIdGER) {
		photoData = await fetchStationPhotos(station.stationIdGER);
		imageUrl = getStationImageUrl(station.stationIdGER);
		pdfUrl = getStationPdfUrl(station.stationIdGER);
	}

	return {
		station: {
			eva: station.eva,
			station_id_ger: station.stationIdGER,
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
			has_wifi: station.hasWifi,
			wifi_has_limit: station.wifiHasLimit,
			wifi_notes: station.wifiNotes,
			latitude: station.latitude,
			longitude: station.longitude,
			category: station.category,

			additional_info: station.additionalInfo
		},
		photos: photoData?.photos || [],
		photoBaseUrl: photoData?.photoBaseUrl || 'https://api.railway-stations.org/photos/',
		imageUrl: imageUrl,
		pdfUrl: pdfUrl
	};
};
