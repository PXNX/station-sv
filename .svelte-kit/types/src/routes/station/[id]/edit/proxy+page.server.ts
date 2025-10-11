// @ts-nocheck
// src/routes/station/[id]/edit/+page.server.ts
import { error, redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { stations } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

export const load = async ({ params }: Parameters<PageServerLoad>[0]) => {
	const stationId = parseInt(params.id);

	if (isNaN(stationId)) {
		throw error(400, 'Invalid station ID');
	}

	// Fetch station from database
	const dbStation = await db
		.select()
		.from(stations)
		.where(eq(stations.stationId, stationId))
		.limit(1);

	if (!dbStation[0]) {
		throw error(404, 'Station not found');
	}

	const station = dbStation[0];

	return {
		station: {
			station_id: station.stationId,
			name: station.name,
			city: station.city,
			country: station.country,
			has_warm_sleep: station.hasWarmSleep || false,
			sleep_notes: station.sleepNotes || '',
			has_outlets: station.hasOutlets || false,
			outlet_notes: station.outletNotes || '',
			has_toilets: station.hasToilets || false,
			toilet_notes: station.toiletNotes || '',
			toilets_open_at_night: station.toiletsOpenAtNight || false,
			is_open_24h: station.isOpen24h || false,
			opening_hours: station.openingHours || '',
			latitude: station.latitude,
			longitude: station.longitude,
			additional_info: station.additionalInfo || ''
		}
	};
};

export const actions = {
	default: async ({ request, params }: import('./$types').RequestEvent) => {
		const stationId = parseInt(params.id);
		const formData = await request.formData();

		// Extract form data
		const hasWarmSleep = formData.get('has_warm_sleep') === 'on';
		const sleepNotes = formData.get('sleep_notes')?.toString() || null;
		const hasOutlets = formData.get('has_outlets') === 'on';
		const outletNotes = formData.get('outlet_notes')?.toString() || null;
		const hasToilets = formData.get('has_toilets') === 'on';
		const toiletNotes = formData.get('toilet_notes')?.toString() || null;
		const toiletsOpenAtNight = formData.get('toilets_open_at_night') === 'on';
		const isOpen24h = formData.get('is_open_24h') === 'on';
		const openingHours = formData.get('opening_hours')?.toString() || null;
		const additionalInfo = formData.get('additional_info')?.toString() || null;

		try {
			// Update station in database
			await db
				.update(stations)
				.set({
					hasWarmSleep,
					sleepNotes,
					hasOutlets,
					outletNotes,
					hasToilets,
					toiletNotes,
					toiletsOpenAtNight,
					isOpen24h,
					openingHours,
					additionalInfo
				})
				.where(eq(stations.stationId, stationId));

			// Redirect back to station detail page
			throw redirect(303, `/station/${stationId}`);
		} catch (err) {
			// If it's a redirect, re-throw it
			if (err instanceof Response) {
				throw err;
			}

			console.error('Failed to update station:', err);
			return fail(500, {
				error: 'Failed to update station. Please try again.'
			});
		}
	}
};
;null as any as Actions;