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
	city?: string | null;
	country: string;
	has_warm_sleep?: boolean | null;
	has_outlets?: boolean | null;
	has_toilets?: boolean | null;
	toilets_open_at_night?: boolean | null;
	is_open_24h?: boolean | null;
	has_wifi?: boolean | null;
	photoUrl?: string | null;
}

export interface StationPhoto {
	path: string;
	photographer: string;
	createdAt?: string;
	license?: string;
}
