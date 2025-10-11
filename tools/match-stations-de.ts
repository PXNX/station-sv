#!/usr/bin/env bun

interface BahnStation {
	EVA_NR: string;
	DS100: string;
	IFOPT: string;
	NAME: string;
	Verkehr: string;
	Laenge: string;
	Breite: string;
	Betreiber_Name: string;
	Betreiber_Nr: string;
	Status: string;
}

interface RailwayStation {
	id: number;
	title: string;
	lat: number;
	lon: number;
	shortCode: string;
	photographer?: string;
	photographerUrl?: string;
	photoUrl?: string;
	license?: string;
	licenseUrl?: string;
}

interface RailwayStationsResponse {
	[key: string]: RailwayStation;
}

interface BahnStationsResponse {
	[key: string]: BahnStation;
}

interface EnrichedStation extends BahnStation {
	railwayStationId?: number;
}

async function fetchStations() {
	console.log('Fetching stations from bahnvorhersage.de...');
	const bahnResponse = await fetch('https://bahnvorhersage.de/api/stations.json');
	const bahnStationsObj: BahnStationsResponse = await bahnResponse.json();

	// Convert object to array
	const bahnStations: BahnStation[] = Object.values(bahnStationsObj);

	console.log('Fetching photo stations from railway-stations.org...');
	const railwayResponse = await fetch('https://api.railway-stations.org/photoStationsByCountry/de');
	const railwayStationsObj: RailwayStationsResponse = await railwayResponse.json();

	// Convert object to array
	const railwayStations: RailwayStation[] = Object.values(railwayStationsObj);

	return { bahnStations, railwayStations };
}

function matchStations(
	bahnStations: BahnStation[],
	railwayStations: RailwayStation[]
): EnrichedStation[] {
	// Create a map for faster lookups
	const railwayMap = new Map<string, number>();

	railwayStations.forEach((station) => {
		if (station.shortCode) {
			railwayMap.set(station.shortCode, station.id);
		}
	});

	console.log(`\nMatching ${bahnStations.length} stations from bahnvorhersage.de...`);
	console.log(`Available ${railwayStations.length} photo stations with shortCode...`);

	let matchCount = 0;
	const enrichedStations: EnrichedStation[] = bahnStations.map((station) => {
		const railwayId = railwayMap.get(station.DS100);

		if (railwayId !== undefined) {
			matchCount++;
			return {
				...station,
				railwayStationId: railwayId
			};
		}

		return station;
	});

	console.log(
		`\n✓ Matched ${matchCount} stations (${((matchCount / bahnStations.length) * 100).toFixed(2)}%)`
	);
	console.log(`✗ Unmatched: ${bahnStations.length - matchCount} stations`);

	return enrichedStations;
}

async function main() {
	try {
		const { bahnStations, railwayStations } = await fetchStations();
		const enrichedStations = matchStations(bahnStations, railwayStations);

		const outputFile = 'enriched_stations.json';
		await Bun.write(outputFile, JSON.stringify(enrichedStations, null, 2));

		console.log(`\n✓ Enriched data saved to ${outputFile}`);

		// Show some examples
		const matched = enrichedStations.filter((s) => s.railwayStationId !== undefined).slice(0, 3);
		if (matched.length > 0) {
			console.log('\nExample matched stations:');
			matched.forEach((s) => {
				console.log(`  ${s.NAME} (DS100: ${s.DS100}) → ID: ${s.railwayStationId}`);
			});
		}
	} catch (error) {
		console.error('Error:', error);
		process.exit(1);
	}
}

main();
