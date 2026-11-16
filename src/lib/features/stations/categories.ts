// src/lib/features/stations/categories.ts
// The single source of truth for station importance: label, meaning and the
// colours used on result cards, detail pages and badges (all seven tiers).
import type { StationCategory } from '$lib/types';
import { normalizeCategory } from './normalize';

export interface StationCategoryStyle {
	label: string;
	description: string;
	/** Slim rail on result cards. */
	accent: string;
	/** Badge on the detail page and result cards. */
	badge: string;
	/** Coloured surface for result cards. */
	surface: string;
	/** Tinted tile behind the category icon. */
	tint: string;
}

const STYLES: Record<StationCategory, StationCategoryStyle> = {
	1: {
		label: 'Major hub',
		description: 'Major traffic hub',
		accent: 'bg-violet-400',
		badge: 'border-violet-400/50 bg-violet-500/15 text-violet-100',
		surface:
			'border-violet-400/35 bg-linear-to-br from-violet-500/15 to-fuchsia-500/8 hover:border-violet-400/60',
		tint: 'bg-violet-400/15 text-violet-200'
	},
	2: {
		label: 'Important',
		description: 'Important junction or airport connection',
		accent: 'bg-sky-400',
		badge: 'border-sky-400/50 bg-sky-500/15 text-sky-100',
		surface:
			'border-sky-400/35 bg-linear-to-br from-sky-500/15 to-cyan-500/8 hover:border-sky-400/60',
		tint: 'bg-sky-400/15 text-sky-200'
	},
	3: {
		label: 'Regional hub',
		description: 'Regional hub',
		accent: 'bg-emerald-400',
		badge: 'border-emerald-400/50 bg-emerald-500/15 text-emerald-100',
		surface:
			'border-emerald-400/35 bg-linear-to-br from-emerald-500/15 to-teal-500/8 hover:border-emerald-400/60',
		tint: 'bg-emerald-400/15 text-emerald-200'
	},
	4: {
		label: 'Medium',
		description: 'Medium-sized station',
		accent: 'bg-amber-400',
		badge: 'border-amber-400/50 bg-amber-500/15 text-amber-100',
		surface:
			'border-amber-400/35 bg-linear-to-br from-amber-500/15 to-orange-500/8 hover:border-amber-400/60',
		tint: 'bg-amber-400/15 text-amber-200'
	},
	5: {
		label: 'Small',
		description: 'Small station',
		accent: 'bg-rose-400',
		badge: 'border-rose-400/50 bg-rose-500/15 text-rose-100',
		surface:
			'border-rose-400/35 bg-linear-to-br from-rose-500/15 to-pink-500/8 hover:border-rose-400/60',
		tint: 'bg-rose-400/15 text-rose-200'
	},
	6: {
		label: 'Very small',
		description: 'Very small station',
		accent: 'bg-indigo-400',
		badge: 'border-indigo-400/50 bg-indigo-500/15 text-indigo-100',
		surface:
			'border-indigo-400/35 bg-linear-to-br from-indigo-500/15 to-blue-500/8 hover:border-indigo-400/60',
		tint: 'bg-indigo-400/15 text-indigo-200'
	},
	7: {
		label: 'Minimal',
		description: 'Minimal service station',
		accent: 'bg-slate-400',
		badge: 'border-slate-400/50 bg-slate-500/15 text-slate-100',
		surface:
			'border-slate-400/35 bg-linear-to-br from-slate-500/15 to-gray-500/8 hover:border-slate-400/60',
		tint: 'bg-slate-400/15 text-slate-200'
	}
};

/** Human-readable descriptions, keyed by category number. */
export const STATION_CATEGORY_DESCRIPTIONS = Object.fromEntries(
	Object.entries(STYLES).map(([key, style]) => [key, style.description])
) as Record<StationCategory, string>;

export function getCategoryStyles(category: number | StationCategory | null | undefined) {
	return STYLES[normalizeCategory(category)];
}
