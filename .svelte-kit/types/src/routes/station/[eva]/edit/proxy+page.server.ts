// @ts-nocheck
import { error, redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { stations, pendingEdits } from '$lib/server/schema';
import { eq, and } from 'drizzle-orm';

export const load = async ({ params, locals }: Parameters<PageServerLoad>[0]) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const eva = parseInt(params.eva);
	if (isNaN(eva)) {
		throw error(400, 'Invalid station ID');
	}

	const dbStation = await db.select().from(stations).where(eq(stations.eva, eva)).limit(1);
	if (!dbStation[0]) {
		throw error(404, 'Station not found');
	}

	const station = dbStation[0];

	// Check if user has pending edits for this station
	const userPendingEdits = await db
		.select()
		.from(pendingEdits)
		.where(
			and(
				eq(pendingEdits.stationEva, eva),
				eq(pendingEdits.userId, locals.user.id),
				eq(pendingEdits.status, 'pending')
			)
		)
		.limit(1);

	return {
		station: {
			eva: station.eva,
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
		},
		hasPendingEdit: userPendingEdits.length > 0,
		isAdmin: locals.user.isAdmin
	};
};

export const actions = {
	default: async ({ request, params, locals }: import('./$types').RequestEvent) => {
		if (!locals.user) {
			return fail(401, { error: 'You must be logged in to edit stations' });
		}

		const eva = parseInt(params.eva);
		const formData = await request.formData();

		const editData = {
			hasWarmSleep: formData.get('has_warm_sleep') === 'on',
			sleepNotes: formData.get('sleep_notes')?.toString() || null,
			hasOutlets: formData.get('has_outlets') === 'on',
			outletNotes: formData.get('outlet_notes')?.toString() || null,
			hasToilets: formData.get('has_toilets') === 'on',
			toiletNotes: formData.get('toilet_notes')?.toString() || null,
			toiletsOpenAtNight: formData.get('toilets_open_at_night') === 'on',
			isOpen24h: formData.get('is_open_24h') === 'on',
			openingHours: formData.get('opening_hours')?.toString() || null,
			additionalInfo: formData.get('additional_info')?.toString() || null
		};

		try {
			// If user is admin, apply changes directly
			if (locals.user.isAdmin) {
				await db.update(stations).set(editData).where(eq(stations.eva, eva));
				throw redirect(303, `/station/${eva}`);
			}

			// Otherwise, create pending edit for approval
			await db.insert(pendingEdits).values({
				stationEva: eva,
				userId: locals.user.id,
				...editData
			});

			throw redirect(303, `/station/${eva}?submitted=true`);
		} catch (err) {
			if (err instanceof Response) throw err;
			console.error('Failed to submit edit:', err);
			return fail(500, { error: 'Failed to submit edit. Please try again.' });
		}
	}
};
;null as any as Actions;