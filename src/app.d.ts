// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
/// <reference types="unplugin-icons/types/svelte" />

declare global {
	namespace App {
		interface Locals {
			user: {
				id: string;
				email: string;
				name: string;
				picture: string | null;
				isAdmin: boolean;
			} | null;
			session: {
				id: string;
				expiresAt: Date;
			} | null;
		}
	}
}

export {};
