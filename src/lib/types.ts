// src/lib/types.ts

export interface Station {
	eva: number;
	name: string;
	city?: string;

	// Sleeping information
	has_warm_sleep: boolean;
	sleep_notes?: string;

	// Outlets
	has_outlets: boolean;
	outlet_notes?: string;

	// Toilets
	has_toilets: boolean;
	toilet_notes?: string;

	// Opening hours
	is_open_24h: boolean;
	opening_hours?: string;

	// Location
	latitude?: number;
	longitude?: number;

	// Additional information
	additional_info?: string;
}

export interface SearchParams {
	name?: string;
	country?: string;
}

export type StationResult = {
	eva: number;
	name: string;
	city: string | null;
	country: string;
	has_warm_sleep: boolean;
	has_outlets: boolean;
	has_toilets: boolean;
	toilets_open_at_night: boolean;
	is_open_24h: boolean;
	photoUrl: string | null;
};
