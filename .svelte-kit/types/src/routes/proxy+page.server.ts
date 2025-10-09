// @ts-nocheck
// src/routes/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import type { Station } from '$lib/types';

// This would typically come from a database
// For now, here's mock data as an example
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

export const load = async ({ url }: Parameters<PageServerLoad>[0]) => {
	const searchName = url.searchParams.get('name');

	if (!searchName) {
		return {
			stations: []
		};
	}

	// Filter stations by name
	const filteredStations = mockStations.filter(
		(station) =>
			station.name.toLowerCase().includes(searchName.toLowerCase()) ||
			station.city?.toLowerCase().includes(searchName.toLowerCase())
	);

	return {
		stations: filteredStations
	};
};

export const actions = {
	search: async ({ request }: import('./$types').RequestEvent) => {
		const formData = await request.formData();
		const name = formData.get('name')?.toString() || '';

		if (!name) {
			return {
				channels: []
			};
		}

		// Filter stations by name
		const filteredStations = mockStations.filter(
			(station) =>
				station.name.toLowerCase().includes(name.toLowerCase()) ||
				station.city?.toLowerCase().includes(name.toLowerCase())
		);

		return {
			stations: filteredStations
		};
	}
};
;null as any as Actions;