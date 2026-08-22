import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required');

const sql = postgres(connectionString, { max: 1 });

try {
	const [summary] = await sql`
		SELECT
			COUNT(*)::int AS station_count,
			COUNT("station_id_ger")::int AS stations_with_photo_id,
			COUNT("has_wifi")::int AS stations_with_wifi_data,
			COUNT("has_toilets")::int AS stations_with_toilet_data,
			COUNT("has_outlets")::int AS stations_with_outlet_data,
			COUNT("opening_hours")::int AS stations_with_opening_hours
		FROM stations
	`;
	const [operations] = await sql`SELECT COUNT(*)::int AS operation_records FROM station_operations`;
	console.log(JSON.stringify({ ...summary, ...operations }, null, 2));
} finally {
	await sql.end({ timeout: 5 });
}
