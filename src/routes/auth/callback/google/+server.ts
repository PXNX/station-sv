import { OAuth2RequestError } from 'arctic';
import { google, generateSessionToken, createSession } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { users } from '$lib/server/schema';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get('google_oauth_state');
	const codeVerifier = cookies.get('google_code_verifier');

	if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
		return new Response('Invalid request', { status: 400 });
	}

	try {
		const tokens = await google.validateAuthorizationCode(code, codeVerifier);
		const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
			headers: { Authorization: `Bearer ${tokens.accessToken}` }
		});

		const googleUser = await response.json();

		// Check if user exists, if not create them
		const existingUser = await db
			.select()
			.from(users)
			.where(eq(users.email, googleUser.email))
			.limit(1);

		let user;
		if (existingUser.length === 0) {
			// Create new user (not admin by default)
			const newUser = await db
				.insert(users)
				.values({
					id: googleUser.sub,
					email: googleUser.email,
					name: googleUser.name,
					picture: googleUser.picture,
					isAdmin: false
				})
				.returning();
			user = newUser[0];
		} else {
			user = existingUser[0];
		}

		// Create session
		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, user.id);

		cookies.set('session', sessionToken, {
			httpOnly: true,
			sameSite: 'lax',
			expires: session.expiresAt,
			path: '/'
		});

		return new Response(null, {
			status: 302,
			headers: { Location: '/' }
		});
	} catch (e) {
		if (e instanceof OAuth2RequestError) {
			return new Response('OAuth error', { status: 400 });
		}
		return new Response('Server error', { status: 500 });
	}
};
