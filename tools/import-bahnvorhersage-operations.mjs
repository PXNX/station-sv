import postgres from 'postgres';

const sourceUrl = 'https://bahnvorhersage.de/api/stations.json';
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required');

const response = await fetch(sourceUrl, { headers: { Accept: 'application/json' } });
if (!response.ok) throw new Error(`Bahn-Vorhersage responded ${response.status}`);
const payload = await response.json();
const sourceRecords = (payload.stations ?? [])
	.filter((station) => Number.isInteger(station.eva))
	.map((station) => ({
		station_eva: station.eva,
		ds100: station.ds100 || null,
		is_active_ris: station.is_active_ris ?? null,
		is_active_iris: station.is_active_iris ?? null,
		meta_evas: JSON.stringify(station.meta_evas ?? []),
		available_transports: JSON.stringify(station.available_transports ?? []),
		source_name: 'Bahn-Vorhersage stations.json',
		source_url: sourceUrl
	}));
const deduplicated = new Map();
for (const record of sourceRecords) {
	const current = deduplicated.get(record.station_eva);
	// Prefer an active record when the source publishes more than one alias per EVA.
	if (!current || Boolean(record.is_active_ris) || Boolean(record.is_active_iris)) {
		deduplicated.set(record.station_eva, record);
	}
}
const records = [...deduplicated.values()];

const sql = postgres(connectionString, { max: 1 });
let imported = 0;
try {
	const existingStations = await sql`SELECT eva FROM stations`;
	const existingEvas = new Set(existingStations.map((station) => station.eva));
	const targetRecords = records.filter((record) => existingEvas.has(record.station_eva));

	for (let start = 0; start < targetRecords.length; start += 500) {
		const chunk = targetRecords.slice(start, start + 500);
		const result = await sql`
			INSERT INTO station_operations ${sql(chunk, 'station_eva', 'ds100', 'is_active_ris', 'is_active_iris', 'meta_evas', 'available_transports', 'source_name', 'source_url')}
			ON CONFLICT (station_eva) DO UPDATE SET
				ds100 = EXCLUDED.ds100,
				is_active_ris = EXCLUDED.is_active_ris,
				is_active_iris = EXCLUDED.is_active_iris,
				meta_evas = EXCLUDED.meta_evas,
				available_transports = EXCLUDED.available_transports,
				source_name = EXCLUDED.source_name,
				source_url = EXCLUDED.source_url,
				imported_at = now()
			RETURNING station_eva
		`;
		imported += result.length;
	}
	console.log(JSON.stringify({ sourceUrl, sourceRecords: sourceRecords.length, uniqueEvaRecords: records.length, matchedDatabaseStations: targetRecords.length, imported }, null, 2));
} finally {
	await sql.end({ timeout: 5 });
}
