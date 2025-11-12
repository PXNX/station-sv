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

export const stations = pgTable(
	'stations',
	{
		// Primary key: EVA number (European station identifier)
		eva: integer('eva').primaryKey(),
		// German station ID - used for railway-stations.org API photo lookups
		// Example: 1071 for Fulda (while EVA would be 8011160)
		stationIdGER: integer('station_id_ger'),
		name: varchar('name', { length: 255 }).notNull(),
		city: varchar('city', { length: 255 }),
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
		openingHours: varchar('opening_hours', { length: 100 }),
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
		// Index for category-based sorting
		categoryIdx: index('category_idx').on(table.category)
	})
);
export type Station = typeof stations.$inferSelect;
export type NewStation = typeof stations.$inferInsert;

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
