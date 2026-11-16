// src/lib/client/amenities.ts
// One definition per amenity, shared by the search filters, the station cards
// and the station detail page, so labels, icons and colours never drift apart.
import type { IconComponent, Tone } from '$lib/design/tokens';
import type { StationResult } from '$lib/types';
import FluentEmojiTwelveOclock from '~icons/fluent-emoji/twelve-oclock';
import FluentEmojiFire from '~icons/fluent-emoji/fire';
import FluentEmojiHighVoltage from '~icons/fluent-emoji/high-voltage';
import FluentEmojiToilet from '~icons/fluent-emoji/toilet';
import FluentEmojiCrescentMoon from '~icons/fluent-emoji/crescent-moon';
import FluentEmojiWifi from '~icons/fluent-emoji/antenna-bars';

export interface Amenity {
	/** Search form field name, also used as the URL query parameter. */
	key: string;
	/** Field on a station record holding this amenity. */
	field: keyof StationResult;
	/** Long form, used for filter labels. */
	label: string;
	/** Short form, used on station card badges. */
	badgeLabel: string;
	icon: IconComponent;
	tone: Tone;
}

export const AMENITIES: Amenity[] = [
	{
		key: 'open24h',
		field: 'is_open_24h',
		label: 'Open 24/7',
		badgeLabel: '24/7',
		icon: FluentEmojiTwelveOclock,
		tone: 'success'
	},
	{
		key: 'warmSleep',
		field: 'has_warm_sleep',
		label: 'Warm sleeping spots',
		badgeLabel: 'Warm sleep',
		icon: FluentEmojiFire,
		tone: 'warning'
	},
	{
		key: 'outlets',
		field: 'has_outlets',
		label: 'Power outlets',
		badgeLabel: 'Outlets',
		icon: FluentEmojiHighVoltage,
		tone: 'brand'
	},
	{
		key: 'toilets',
		field: 'has_toilets',
		label: 'Toilets',
		badgeLabel: 'Toilets',
		icon: FluentEmojiToilet,
		tone: 'violet'
	},
	{
		key: 'toiletsAtNight',
		field: 'toilets_open_at_night',
		label: 'Night toilets',
		badgeLabel: 'Night toilets',
		icon: FluentEmojiCrescentMoon,
		tone: 'info'
	},
	{
		key: 'wifi',
		field: 'has_wifi',
		label: 'WiFi',
		badgeLabel: 'WiFi',
		icon: FluentEmojiWifi,
		tone: 'cyan'
	}
];

/** Opening hours are shown as a two-state badge, so cards handle them separately. */
export const OPENING_HOURS_AMENITY = AMENITIES[0];
export const FEATURE_AMENITIES = AMENITIES.slice(1);
