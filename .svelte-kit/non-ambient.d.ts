
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
		RouteId(): "/" | "/admin" | "/admin/pending" | "/auth" | "/auth/callback" | "/auth/callback/google" | "/dashboard" | "/login" | "/login/google" | "/logout" | "/privacy-policy" | "/station" | "/station/[eva]" | "/station/[eva]/edit";
		RouteParams(): {
			"/station/[eva]": { eva: string };
			"/station/[eva]/edit": { eva: string }
		};
		LayoutParams(): {
			"/": { eva?: string };
			"/admin": Record<string, never>;
			"/admin/pending": Record<string, never>;
			"/auth": Record<string, never>;
			"/auth/callback": Record<string, never>;
			"/auth/callback/google": Record<string, never>;
			"/dashboard": Record<string, never>;
			"/login": Record<string, never>;
			"/login/google": Record<string, never>;
			"/logout": Record<string, never>;
			"/privacy-policy": Record<string, never>;
			"/station": { eva?: string };
			"/station/[eva]": { eva: string };
			"/station/[eva]/edit": { eva: string }
		};
		Pathname(): "/" | "/admin" | "/admin/" | "/admin/pending" | "/admin/pending/" | "/auth" | "/auth/" | "/auth/callback" | "/auth/callback/" | "/auth/callback/google" | "/auth/callback/google/" | "/dashboard" | "/dashboard/" | "/login" | "/login/" | "/login/google" | "/login/google/" | "/logout" | "/logout/" | "/privacy-policy" | "/privacy-policy/" | "/station" | "/station/" | `/station/${string}` & {} | `/station/${string}/` & {} | `/station/${string}/edit` & {} | `/station/${string}/edit/` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/favicon.png" | string & {};
	}
}