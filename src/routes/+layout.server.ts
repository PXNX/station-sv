// src/routes/+layout.server.ts
// Session data belongs to the shell now, so the header is consistent on every page.
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		user: locals.user,
		session: locals.session
	};
};
