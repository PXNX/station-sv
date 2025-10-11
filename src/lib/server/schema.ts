// src/lib/server/schema.ts
import { pgTable, varchar, boolean, integer, text, doublePrecision } from 'drizzle-orm/pg-core';

export const stations = pgTable('stations', {
	stationId: integer('station_id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	city: varchar('city', { length: 255 }),
	country: varchar('country', { length: 2 }).notNull(),

	// Amenities
	hasWarmSleep: boolean('has_warm_sleep').default(false),
	sleepNotes: text('sleep_notes'),

	hasOutlets: boolean('has_outlets').default(false),
	outletNotes: text('outlet_notes'),

	hasToilets: boolean('has_toilets').default(false),
	toiletNotes: text('toilet_notes'),
	toiletsOpenAtNight: boolean('toilets_open_at_night').default(false),

	isOpen24h: boolean('is_open_24h').default(false),
	openingHours: varchar('opening_hours', { length: 100 }),

	// Location
	latitude: doublePrecision('latitude').notNull(),
	longitude: doublePrecision('longitude').notNull(),

	// Additional info
	additionalInfo: text('additional_info')
});

export type Station = typeof stations.$inferSelect;
export type NewStation = typeof stations.$inferInsert;
