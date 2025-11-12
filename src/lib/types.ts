// src/lib/types.ts

export interface Station {
	eva: number;
	station_id_ger?: number | null;
	name: string;
	city?: string | null;
	country: string;
	has_warm_sleep?: boolean | null;
	sleep_notes?: string | null;
	has_outlets?: boolean | null;
	outlet_notes?: string | null;
	has_toilets?: boolean | null;
	toilet_notes?: string | null;
	toilets_open_at_night?: boolean | null;
	is_open_24h?: boolean | null;
	opening_hours?: string | null;
	has_wifi?: boolean | null;
	wifi_has_limit?: boolean | null;
	wifi_notes?: string | null;
	latitude: number;
	longitude: number;
	additional_info?: string | null;
}

export interface StationResult {
	eva: number;
	name: string;
	city: string;
	country: string;
	category: StationCategory; // 1-7, where 1 is most important (major hubs)
	has_warm_sleep: boolean | null;
	has_outlets: boolean | null;
	has_toilets: boolean | null;
	toilets_open_at_night: boolean | null;
	is_open_24h: boolean | null;
	has_wifi: boolean | null;
	photoUrl: string | null;
}

// Category descriptions for reference
export const STATION_CATEGORIES = {
	1: 'Major traffic hub (e.g., München Hbf, Berlin Hbf)',
	2: 'Important junction or airport connection',
	3: 'Regional hub',
	4: 'Medium-sized station',
	5: 'Small station',
	6: 'Very small station',
	7: 'Minimal service station'
} as const;

export type StationCategory = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface StationPhoto {
	path: string;
	photographer: string;
	createdAt?: string;
	license?: string;
}
