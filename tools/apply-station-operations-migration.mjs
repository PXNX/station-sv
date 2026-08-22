import { readFile } from 'node:fs/promises';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required');

const migration = await readFile(new URL('../drizzle/0001_station_operations.sql', import.meta.url), 'utf8');
const statements = migration
	.split('--> statement-breakpoint')
	.map((statement) => statement.trim())
	.filter(Boolean);

const sql = postgres(connectionString, { max: 1 });
try {
	for (const statement of statements) await sql.unsafe(statement);
	console.log(JSON.stringify({ appliedStatements: statements.length }, null, 2));
} finally {
	await sql.end({ timeout: 5 });
}
