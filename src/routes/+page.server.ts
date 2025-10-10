// src/routes/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import type { Station } from '$lib/types';

// Mock data with bahnhof.de station IDs
// In production, replace this with actual database queries
const mockStations: Station[] = [
	{
		station_id: 8000261, // München Hbf (bahnhof.de ID)
		name: 'München Hbf',
		city: 'München',
		country: 'DE',
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
		station_id: 8011160, // Berlin Hbf (bahnhof.de ID)
		name: 'Berlin Hbf',
		city: 'Berlin',
		country: 'DE',
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
		station_id: 8000105, // Frankfurt (Main) Hbf (bahnhof.de ID)
		name: 'Frankfurt (Main) Hbf',
		city: 'Frankfurt am Main',
		country: 'DE',
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
		station_id: 8002549, // Hamburg Hbf (bahnhof.de ID)
		name: 'Hamburg Hbf',
		city: 'Hamburg',
		country: 'DE',
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
		station_id: 8000207, // Köln Hbf (bahnhof.de ID)
		name: 'Köln Hbf',
		city: 'Köln',
		country: 'DE',
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
	},
	{
		station_id: 8000284, // Nürnberg Hbf (bahnhof.de ID)
		name: 'Nürnberg Hbf',
		city: 'Nürnberg',
		country: 'DE',
		has_warm_sleep: true,
		sleep_notes: 'Waiting hall has heating. Some comfortable benches available.',
		has_outlets: true,
		outlet_notes: 'Outlets available in waiting areas.',
		has_toilets: true,
		toilet_notes: 'Toilets available. €1 fee.',
		is_open_24h: true,
		opening_hours: 'Open 24 hours',
		latitude: 49.4458,
		longitude: 11.0828,
		additional_info: 'Major station with good facilities.'
	},
	{
		station_id: 8000260, // Mannheim Hbf (bahnhof.de ID)
		name: 'Mannheim Hbf',
		city: 'Mannheim',
		country: 'DE',
		has_warm_sleep: false,
		sleep_notes: 'Limited heated areas. Station gets cold at night.',
		has_outlets: true,
		outlet_notes: 'Some outlets available near waiting areas.',
		has_toilets: true,
		toilet_notes: 'Toilets available. €1 fee.',
		is_open_24h: false,
		opening_hours: '04:00 - 01:00',
		latitude: 49.4797,
		longitude: 8.4694,
		additional_info: 'Station closes between 1 AM and 4 AM.'
	},
	{
		station_id: 8000191, // Karlsruhe Hbf (bahnhof.de ID)
		name: 'Karlsruhe Hbf',
		city: 'Karlsruhe',
		country: 'DE',
		has_warm_sleep: false,
		sleep_notes: 'No heated waiting areas at night.',
		has_outlets: false,
		outlet_notes: 'Limited outlet access.',
		has_toilets: true,
		toilet_notes: 'Toilets available during opening hours. €1 fee.',
		is_open_24h: false,
		opening_hours: '04:30 - 01:00',
		latitude: 49.0094,
		longitude: 8.4044,
		additional_info: 'Station closes at night.'
	},
	{
		station_id: 8000096, // Dresden Hbf (bahnhof.de ID)
		name: 'Dresden Hbf',
		city: 'Dresden',
		country: 'DE',
		has_warm_sleep: true,
		sleep_notes: 'Heated waiting hall available 24/7.',
		has_outlets: true,
		outlet_notes: 'Outlets available in waiting areas.',
		has_toilets: true,
		toilet_notes: 'Clean toilets. €1 fee.',
		is_open_24h: true,
		opening_hours: 'Open 24 hours',
		latitude: 51.0402,
		longitude: 13.732,
		additional_info: 'Well-maintained station with good facilities.'
	},
	{
		station_id: 8000244, // Leipzig Hbf (bahnhof.de ID)
		name: 'Leipzig Hbf',
		city: 'Leipzig',
		country: 'DE',
		has_warm_sleep: true,
		sleep_notes: 'Large heated waiting hall. Shopping promenade inside.',
		has_outlets: true,
		outlet_notes: 'Many outlets available throughout the station.',
		has_toilets: true,
		toilet_notes: 'Multiple clean toilet facilities. €1 fee.',
		is_open_24h: true,
		opening_hours: 'Open 24 hours',
		latitude: 51.3459,
		longitude: 12.3818,
		additional_info: 'One of the largest stations in Europe. Excellent facilities.'
	}
];

/**
 * Search and filter stations based on query parameters
 */
function searchStations(
	query: string,
	filters?: {
		open24h?: boolean;
		warmSleep?: boolean;
		toilets?: boolean;
	}
): Station[] {
	let results = mockStations;

	// Filter by search query (name or city)
	if (query && query.length >= 2) {
		const searchLower = query.toLowerCase();
		results = results.filter(
			(station) =>
				station.name.toLowerCase().includes(searchLower) ||
				station.city?.toLowerCase().includes(searchLower)
		);
	}

	// Apply additional filters
	if (filters?.open24h) {
		results = results.filter((station) => station.is_open_24h);
	}

	if (filters?.warmSleep) {
		results = results.filter((station) => station.has_warm_sleep);
	}

	if (filters?.toilets) {
		results = results.filter((station) => station.has_toilets);
	}

	return results;
}

export const load: PageServerLoad = async ({ url }) => {
	const searchName = url.searchParams.get('name');
	const filterOpen24h = url.searchParams.get('open24h') === 'true';
	const filterWarmSleep = url.searchParams.get('warmSleep') === 'true';
	const filterToilets = url.searchParams.get('toilets') === 'true';

	if (!searchName) {
		return {
			stations: [],
			filters: {
				open24h: filterOpen24h,
				warmSleep: filterWarmSleep,
				toilets: filterToilets
			}
		};
	}

	const stations = searchStations(searchName, {
		open24h: filterOpen24h,
		warmSleep: filterWarmSleep,
		toilets: filterToilets
	});

	return {
		stations,
		filters: {
			open24h: filterOpen24h,
			warmSleep: filterWarmSleep,
			toilets: filterToilets
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

		if (!name || name.length < 2) {
			return {
				stations: [],
				error: 'Please enter at least 2 characters'
			};
		}

		const stations = searchStations(name, {
			open24h: filterOpen24h,
			warmSleep: filterWarmSleep,
			toilets: filterToilets
		});

		return {
			stations,
			success: true
		};
	}
};
