// src/lib/features/stations/transports.ts
// Bahn-Vorhersage stores train types as uppercase enum values. Turn them into
// short, human-readable labels for the station detail page.
import type { Tone } from '$lib/design/tokens';

export interface TransportStyle {
	label: string;
	short: string;
	tone: Tone;
}

const TRANSPORTS: Record<string, TransportStyle> = {
	HIGH_SPEED_TRAIN: { label: 'High-speed train', short: 'ICE', tone: 'violet' },
	INTERCITY_TRAIN: { label: 'Intercity train', short: 'IC', tone: 'info' },
	INTER_REGIONAL_TRAIN: { label: 'Inter-regional train', short: 'IR', tone: 'brand' },
	REGIONAL_TRAIN: { label: 'Regional train', short: 'RB', tone: 'success' },
	CITY_TRAIN: { label: 'City train · S-Bahn', short: 'S', tone: 'warning' },
	SUBWAY: { label: 'Subway', short: 'U', tone: 'cyan' },
	TRAM: { label: 'Tram', short: 'Tram', tone: 'success' },
	BUS: { label: 'Bus', short: 'Bus', tone: 'info' },
	FERRY: { label: 'Ferry', short: 'Ferry', tone: 'cyan' },
	SHUTTLE: { label: 'Shuttle', short: 'Shuttle', tone: 'neutral' }
};

export function getTransportStyle(value: string): TransportStyle {
	const known = TRANSPORTS[value.toUpperCase()];
	if (known) return known;

	const label = value
		.toLowerCase()
		.replace(/_/g, ' ')
		.replace(/\b\w/g, (char) => char.toUpperCase());
	return { label, short: label, tone: 'neutral' };
}
