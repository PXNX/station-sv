
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/(authorized)" | "/(admin)" | "/" | "/auth" | "/(authorized)/auth" | "/auth/callback" | "/auth/callback/google" | "/auth/login" | "/auth/login/google" | "/(authorized)/auth/logout" | "/(admin)/pending" | "/privacy-policy" | "/station" | "/(authorized)/station" | "/station/[eva]" | "/(authorized)/station/[eva]" | "/(authorized)/station/[eva]/edit";
		RouteParams(): {
			"/station/[eva]": { eva: string };
			"/(authorized)/station/[eva]": { eva: string };
			"/(authorized)/station/[eva]/edit": { eva: string }
		};
		LayoutParams(): {
			"/(authorized)": { eva?: string };
			"/(admin)": Record<string, never>;
			"/": { eva?: string };
			"/auth": Record<string, never>;
			"/(authorized)/auth": Record<string, never>;
			"/auth/callback": Record<string, never>;
			"/auth/callback/google": Record<string, never>;
			"/auth/login": Record<string, never>;
			"/auth/login/google": Record<string, never>;
			"/(authorized)/auth/logout": Record<string, never>;
			"/(admin)/pending": Record<string, never>;
			"/privacy-policy": Record<string, never>;
			"/station": { eva?: string };
			"/(authorized)/station": { eva?: string };
			"/station/[eva]": { eva: string };
			"/(authorized)/station/[eva]": { eva: string };
			"/(authorized)/station/[eva]/edit": { eva: string }
		};
		Pathname(): "/" | "/auth" | "/auth/" | "/auth/callback" | "/auth/callback/" | "/auth/callback/google" | "/auth/callback/google/" | "/auth/login" | "/auth/login/" | "/auth/login/google" | "/auth/login/google/" | "/auth/logout" | "/auth/logout/" | "/pending" | "/pending/" | "/privacy-policy" | "/privacy-policy/" | "/station" | "/station/" | `/station/${string}` & {} | `/station/${string}/` & {} | `/station/${string}/edit` & {} | `/station/${string}/edit/` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/favicon.png" | string & {};
	}
}