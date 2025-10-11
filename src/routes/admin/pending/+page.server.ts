import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { pendingEdits, stations, users } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	if (!locals.user.isAdmin) {
		throw error(403, 'Admin access required');
	}

	const pending = await db
		.select({
			edit: pendingEdits,
			station: stations,
			user: users
		})
		.from(pendingEdits)
		.innerJoin(stations, eq(pendingEdits.stationEva, stations.eva))
		.innerJoin(users, eq(pendingEdits.userId, users.id))
		.where(eq(pendingEdits.status, 'pending'))
		.orderBy(pendingEdits.createdAt);

	return { pendingEdits: pending };
};

export const actions: Actions = {
	approve: async ({ request, locals }) => {
		if (!locals.user?.isAdmin) {
			return { success: false, error: 'Admin access required' };
		}

		const formData = await request.formData();
		const editId = parseInt(formData.get('editId')?.toString() || '');

		const edit = await db.select().from(pendingEdits).where(eq(pendingEdits.id, editId)).limit(1);
		if (!edit[0]) {
			return { success: false, error: 'Edit not found' };
		}

		// Apply the edit to the station
		await db
			.update(stations)
			.set({
				hasWarmSleep: edit[0].hasWarmSleep,
				sleepNotes: edit[0].sleepNotes,
				hasOutlets: edit[0].hasOutlets,
				outletNotes: edit[0].outletNotes,
				hasToilets: edit[0].hasToilets,
				toiletNotes: edit[0].toiletNotes,
				toiletsOpenAtNight: edit[0].toiletsOpenAtNight,
				isOpen24h: edit[0].isOpen24h,
				openingHours: edit[0].openingHours,
				additionalInfo: edit[0].additionalInfo
			})
			.where(eq(stations.eva, edit[0].stationEva));

		// Mark as approved
		await db
			.update(pendingEdits)
			.set({
				status: 'approved',
				reviewedAt: new Date(),
				reviewedBy: locals.user.id
			})
			.where(eq(pendingEdits.id, editId));

		return { success: true };
	},

	reject: async ({ request, locals }) => {
		if (!locals.user?.isAdmin) {
			return { success: false, error: 'Admin access required' };
		}

		const formData = await request.formData();
		const editId = parseInt(formData.get('editId')?.toString() || '');

		await db
			.update(pendingEdits)
			.set({
				status: 'rejected',
				reviewedAt: new Date(),
				reviewedBy: locals.user.id
			})
			.where(eq(pendingEdits.id, editId));

		return { success: true };
	}
};
