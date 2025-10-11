#!/usr/bin/env bun
interface BahnStation {
	eva: number;
	ds100: string;
	lat: number;
	lon: number;
	name: string;
	is_active_ris: boolean;
	is_active_iris: boolean;
	meta_evas: number[];
	available_transports: string[];
	number_of_events: number | null;
}

interface RailwayStation {
	country: string;
	id: string;
	title: string;
	lat: number;
	lon: number;
	photos: any[];
	shortCode: string;
}

interface BahnStationsResponse {
	stations: BahnStation[];
}

interface RailwayStationsResponse {
	photoBaseUrl: string;
	licenses: any[];
	photographers: any[];
	stations: RailwayStation[];
}

interface OutputStation {
	eva: number;
	stationIdGER: number | null;
	name: string;
	country: string;
	latitude: number;
	longitude: number;
}

async function fetchStations() {
	console.log('Fetching stations from bahnvorhersage.de...');
	const bahnResponse = await fetch('https://bahnvorhersage.de/api/stations.json');
	const bahnData: BahnStationsResponse = await bahnResponse.json();

	console.log('Fetching photo stations from railway-stations.org...');
	const railwayResponse = await fetch('https://api.railway-stations.org/photoStationsByCountry/de');
	const railwayData: RailwayStationsResponse = await railwayResponse.json();

	return { bahnStations: bahnData.stations, railwayStations: railwayData.stations };
}

function matchStations(
	bahnStations: BahnStation[],
	railwayStations: RailwayStation[]
): OutputStation[] {
	const railwayMap = new Map<string, number>();
	railwayStations.forEach((station) => {
		if (station.shortCode) {
			railwayMap.set(station.shortCode, parseInt(station.id));
		}
	});

	console.log(`\nMatching ${bahnStations.length} stations from bahnvorhersage.de...`);
	console.log(`Available ${railwayStations.length} photo stations with shortCode...`);

	let matchCount = 0;
	const outputStations: OutputStation[] = bahnStations.map((station) => {
		const stationIdGER = railwayMap.get(station.ds100);
		if (stationIdGER !== undefined) {
			matchCount++;
		}

		return {
			eva: station.eva,
			stationIdGER: stationIdGER ?? null,
			name: station.name,
			country: 'de',
			latitude: station.lat,
			longitude: station.lon
		};
	});

	console.log(
		`\n✓ Matched ${matchCount} stations (${((matchCount / bahnStations.length) * 100).toFixed(2)}%)`
	);
	console.log(`✗ Unmatched: ${bahnStations.length - matchCount} stations`);

	return outputStations;
}

function generateSQLInserts(stations: OutputStation[]): string {
	const lines: string[] = [
		'-- Generated SQL INSERT statements for stations',
		'-- Run this in your PostgreSQL database',
		'',
		'INSERT INTO stations (eva, station_id_ger, name, country, latitude, longitude) VALUES'
	];

	const valueLines = stations.map((station, index) => {
		const eva = station.eva;
		const stationIdGER = station.stationIdGER !== null ? station.stationIdGER : 'NULL';
		const name = station.name.replace(/'/g, "''"); // Escape single quotes
		const country = station.country;
		const lat = station.latitude;
		const lon = station.longitude;

		const trailing = index < stations.length - 1 ? ',' : ';';
		return `  (${eva}, ${stationIdGER}, '${name}', '${country}', ${lat}, ${lon})${trailing}`;
	});

	lines.push(...valueLines);
	lines.push('');
	return lines.join('\n');
}

async function main() {
	try {
		const { bahnStations, railwayStations } = await fetchStations();
		const outputStations = matchStations(bahnStations, railwayStations);

		// Save JSON output
		const jsonFile = 'stations.json';
		await Bun.write(jsonFile, JSON.stringify(outputStations, null, 2));
		console.log(`\n✓ JSON data saved to ${jsonFile}`);

		// Generate and save SQL
		const sqlFile = 'stations.sql';
		const sql = generateSQLInserts(outputStations);
		await Bun.write(sqlFile, sql);
		console.log(`✓ SQL INSERT statements saved to ${sqlFile}`);

		// Show some examples
		const matched = outputStations.filter((s) => s.stationIdGER !== null).slice(0, 3);
		if (matched.length > 0) {
			console.log('\nExample matched stations:');
			matched.forEach((s) => {
				console.log(`  ${s.name} (EVA: ${s.eva}) → German Station ID: ${s.stationIdGER}`);
			});
		}

		console.log(`\n📊 Total stations: ${outputStations.length}`);
		console.log(
			`📸 With German Station ID: ${outputStations.filter((s) => s.stationIdGER !== null).length}`
		);
	} catch (error) {
		console.error('Error:', error);
		process.exit(1);
	}
}

main();
