// src/lib/server/schema.ts
import {
	pgTable,
	varchar,
	boolean,
	integer,
	text,
	doublePrecision,
	timestamp,
	serial,
	index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const stations = pgTable(
	'stations',
	{
		// Primary key: EVA number (European station identifier)
		eva: integer('eva').primaryKey(),
		// German station ID - used for railway-stations.org API photo lookups
		stationIdGER: integer('station_id_ger'),
		name: varchar('name', { length: 255 }).notNull(),
		city: varchar('city', { length: 255 }).notNull(),
		country: varchar('country', { length: 2 }).notNull(),

		// Station importance (1-7, where 1 is most important)
		category: integer('category').notNull(),
		priceCategory: integer('price_category'),

		// Amenities
		hasWarmSleep: boolean('has_warm_sleep'),
		sleepNotes: text('sleep_notes'),
		hasOutlets: boolean('has_outlets'),
		outletNotes: text('outlet_notes'),
		hasToilets: boolean('has_toilets'),
		toiletNotes: text('toilet_notes'),
		toiletsOpenAtNight: boolean('toilets_open_at_night'),
		isOpen24h: boolean('is_open_24h'),
		openingHours: text('opening_hours'),
		// WiFi
		hasWifi: boolean('has_wifi'),
		wifiHasLimit: boolean('wifi_has_limit'),
		wifiNotes: text('wifi_notes'),
		// Location
		latitude: doublePrecision('latitude').notNull(),
		longitude: doublePrecision('longitude').notNull(),
		// Additional info
		additionalInfo: text('additional_info')
	},
	(table) => ({
		// Category-based sorting index
		categoryIdx: index('category_idx').on(table.category),

		// Combined index for common query pattern (category + name)
		categoryNameIdx: index('category_name_idx').on(table.category, table.name),

		// Trigram GIN indexes for fuzzy search
		// You'll need to add these in a custom SQL migration since Drizzle doesn't support custom index types yet
		// See the custom SQL below this schema file

		// Standard B-tree indexes for exact matches and filters
		nameIdx: index('name_idx').on(table.name),
		cityIdx: index('city_idx').on(table.city),
		countryIdx: index('country_idx').on(table.country),

		// Indexes for filter columns
		open24hIdx: index('open_24h_idx').on(table.isOpen24h),
		warmSleepIdx: index('warm_sleep_idx').on(table.hasWarmSleep),
		toiletsIdx: index('toilets_idx').on(table.hasToilets),
		toiletsAtNightIdx: index('toilets_at_night_idx').on(table.toiletsOpenAtNight),
		outletsIdx: index('outlets_idx').on(table.hasOutlets),
		wifiIdx: index('wifi_idx').on(table.hasWifi)
	})
);

export type Station = typeof stations.$inferSelect;
export type NewStation = typeof stations.$inferInsert;

// Custom function to set up pg_trgm extension and create trigram indexes
// Call this once after your schema is set up
export async function setupFuzzySearchIndexes(db: any) {
	try {
		// Enable pg_trgm extension first
		await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
		console.log('✓ pg_trgm extension enabled');

		// Create GIN indexes for fuzzy search using % operator
		await db.execute(sql`
			CREATE INDEX IF NOT EXISTS stations_name_trgm_idx 
			ON stations USING GIN (name gin_trgm_ops)
		`);

		await db.execute(sql`
			CREATE INDEX IF NOT EXISTS stations_city_trgm_idx 
			ON stations USING GIN (city gin_trgm_ops)
		`);

		console.log('✓ GIN indexes created');

		// Create GIST indexes for ORDER BY similarity() optimization
		await db.execute(sql`
			CREATE INDEX IF NOT EXISTS stations_name_similarity_idx 
			ON stations USING GIST (name gist_trgm_ops)
		`);

		await db.execute(sql`
			CREATE INDEX IF NOT EXISTS stations_city_similarity_idx 
			ON stations USING GIST (city gist_trgm_ops)
		`);

		console.log('✓ GIST indexes created');
		console.log('✓ Fuzzy search setup complete');
	} catch (error) {
		console.error('Error setting up fuzzy search:', error);
		throw error;
	}
}

export const users = pgTable('users', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	name: text('name').notNull(),
	picture: text('picture'),
	isAdmin: boolean('is_admin').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const sessions = pgTable('sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const pendingEdits = pgTable('pending_edits', {
	id: serial('id').primaryKey(),
	stationEva: integer('station_eva')
		.notNull()
		.references(() => stations.eva, { onDelete: 'cascade' }),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	hasWarmSleep: boolean('has_warm_sleep'),
	sleepNotes: text('sleep_notes'),
	hasOutlets: boolean('has_outlets'),
	outletNotes: text('outlet_notes'),
	hasToilets: boolean('has_toilets'),
	toiletNotes: text('toilet_notes'),
	toiletsOpenAtNight: boolean('toilets_open_at_night'),
	isOpen24h: boolean('is_open_24h'),
	openingHours: text('opening_hours'),
	hasWifi: boolean('has_wifi'),
	wifiHasLimit: boolean('wifi_has_limit'),
	wifiNotes: text('wifi_notes'),
	additionalInfo: text('additional_info'),
	status: text('status').notNull().default('pending'), // 'pending', 'approved', 'rejected'
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
	reviewedBy: text('reviewed_by').references(() => users.id)
});
