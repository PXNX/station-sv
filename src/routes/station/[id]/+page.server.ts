// src/routes/station/[id]/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Station } from '$lib/types';

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

async function fetchStationFromBahnhofDe(stationId: number): Promise<Partial<Station> | null> {
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
			station_id: data.number,
			name: data.name,
			city: data.mailingAddress?.city,
			country: 'Germany',
			latitude,
			longitude
		};
	} catch (err) {
		console.error('Error fetching from bahnhof.de:', err);
		return null;
	}
}

function getStationImageUrl(stationId: number): string {
	return `https://map.railway-stations.org/station.php?stationId=${stationId}`;
}

function getStationPdfUrl(stationId: number): string {
	return `https://www.bahnhof.de/downloads/station-plans/${stationId}.pdf`;
}

const mockStations: Station[] = [
	{
		station_id: 1071,
		name: 'München Hauptbahnhof',
		city: 'München',
		has_warm_sleep: true,
		sleep_notes:
			'Heated waiting area on the main level. Available 24/7. Benches without armrests in the north wing.',
		has_outlets: true,
		outlet_notes:
			'Multiple outlets in waiting areas and near ticket machines. Some at benches in DB Lounge area.',
		has_toilets: true,
		toilet_notes: 'Clean toilets available. €1 fee. Located on ground floor near platforms 11-26.',
		is_open_24h: true,
		opening_hours: 'Open 24 hours',
		latitude: 48.1405,
		longitude: 11.5581,
		additional_info:
			'Large station with many facilities. Security presence throughout the night. Food options available until late.'
	},
	{
		station_id: 527,
		name: 'Berlin Hauptbahnhof',
		city: 'Berlin',
		has_warm_sleep: true,
		sleep_notes:
			'Warm waiting areas on multiple levels. Upper level (Europaplatz) has good seating.',
		has_outlets: true,
		outlet_notes:
			'Outlets available throughout the station, especially near cafes and in waiting areas.',
		has_toilets: true,
		toilet_notes: 'Multiple toilet facilities. €1 fee. Very clean, maintained regularly.',
		is_open_24h: true,
		opening_hours: 'Open 24 hours',
		latitude: 52.525,
		longitude: 13.3694,
		additional_info:
			'Modern station with excellent facilities. Many shops and restaurants. Good lighting throughout.'
	},
	{
		station_id: 1866,
		name: 'Frankfurt (Main) Hauptbahnhof',
		city: 'Frankfurt am Main',
		has_warm_sleep: true,
		sleep_notes: 'Large waiting hall with heating. Can get crowded at night.',
		has_outlets: true,
		outlet_notes: 'Limited outlets in main hall. More available in DB Lounge (requires ticket).',
		has_toilets: true,
		toilet_notes: 'Toilets available. €1 fee. Can be busy during peak hours.',
		is_open_24h: true,
		opening_hours: 'Open 24 hours',
		latitude: 50.107,
		longitude: 8.6632,
		additional_info:
			'Busy international hub. Security patrols regularly. Food available 24/7 at some vendors.'
	},
	{
		station_id: 2514,
		name: 'Hamburg Hauptbahnhof',
		city: 'Hamburg',
		has_warm_sleep: true,
		sleep_notes: 'Heated waiting areas available. Main hall stays warm throughout the night.',
		has_outlets: true,
		outlet_notes: 'Several outlets in waiting areas. Some near the Wandelhalle.',
		has_toilets: true,
		toilet_notes: 'Clean facilities. €1 fee. Located on ground level.',
		is_open_24h: true,
		opening_hours: 'Open 24 hours',
		latitude: 53.5528,
		longitude: 10.0067,
		additional_info:
			"One of Germany's busiest stations. Well-lit and secure. Many late-night food options."
	},
	{
		station_id: 4234,
		name: 'Köln Hauptbahnhof',
		city: 'Köln',
		has_warm_sleep: true,
		sleep_notes:
			'Cathedral side has good seating in heated areas. Upper level near platforms 9-11 is quieter.',
		has_outlets: true,
		outlet_notes: 'Outlets available in waiting areas and near some seating by platforms.',
		has_toilets: true,
		toilet_notes: 'Multiple toilet locations. €1 fee. Generally clean.',
		is_open_24h: true,
		opening_hours: 'Open 24 hours',
		latitude: 50.9431,
		longitude: 6.9589,
		additional_info: 'Right next to Cologne Cathedral. Very central. Good security presence.'
	}
];

export const load: PageServerLoad = async ({ params, fetch }) => {
	const stationId = parseInt(params.id);

	if (isNaN(stationId)) {
		throw error(400, 'Invalid station ID');
	}

	// First, try to find in mock data
	let station = mockStations.find((s) => s.station_id === stationId);

	// If not in mock data, try to fetch from API
	if (!station) {
		const apiData = await fetchStationFromBahnhofDe(stationId);

		if (apiData && apiData.name) {
			// Create a basic station object from API data
			station = {
				station_id: stationId,
				name: apiData.name,
				city: apiData.city,

				latitude: apiData.latitude,
				longitude: apiData.longitude,
				has_warm_sleep: false,
				has_outlets: false,
				has_toilets: false,
				is_open_24h: false,
				additional_info:
					'Station information not yet available. Please contribute if you visit this station!'
			};
		} else {
			throw error(404, 'Station not found');
		}
	}

	// Add image and PDF URLs
	return {
		station,
		imageUrl: getStationImageUrl(stationId),
		pdfUrl: getStationPdfUrl(stationId)
	};
};
