// src/lib/design/tokens.ts
// Single source of truth for the visual language: surfaces, tones and controls.
// Class strings are written out literally so Tailwind can pick them up.
import type { Component } from 'svelte';
import type { SvelteHTMLElements } from 'svelte/elements';

/** Any icon imported via `~icons/...`. */
export type IconComponent = Component<SvelteHTMLElements['svg']>;

/**
 * Semantic colour roles. `neutral`/`info`/`success`/`warning`/`danger` carry
 * meaning; `brand`/`rail`/`violet`/`cyan` are accents used to tell amenities apart.
 */
export type Tone =
	'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'danger' | 'violet' | 'cyan';

/** Raised surface — cards, dialogs, anything sitting on the page background. */
export const SURFACE_PANEL =
	'rounded-2xl border border-white/10 bg-slate-900/70 shadow-xl shadow-black/25';

/** Recessed surface — nested blocks inside a panel. */
export const SURFACE_INSET = 'rounded-xl border border-white/8 bg-white/[0.035]';

/** Interactive recessed surface — filter chips, list rows. */
export const SURFACE_INTERACTIVE =
	'rounded-xl border border-white/10 bg-white/[0.035] transition-colors hover:border-white/20 hover:bg-white/[0.07]';

/** Text inputs, textareas and selects. */
export const INPUT_CLASS =
	'w-full rounded-xl border border-white/12 bg-ink-950/60 px-4 py-3 text-white placeholder-white/35 transition-colors outline-none focus:border-signal-400/70 focus:bg-ink-950/80 focus:ring-2 focus:ring-signal-400/25 disabled:cursor-not-allowed disabled:opacity-60';

/** Checkboxes. */
export const CHECKBOX_CLASS =
	'checkbox checkbox-sm shrink-0 border-white/30 bg-white/10 checked:border-signal-400 checked:bg-signal-500';

export const BUTTON_BASE =
	'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50';

export const BUTTON_VARIANTS = {
	primary: 'bg-signal-400 text-ink-950 shadow-lg shadow-signal-500/20 hover:bg-signal-300',
	secondary:
		'border border-white/12 bg-white/[0.06] text-white hover:border-white/25 hover:bg-white/[0.11]',
	ghost: 'text-white/70 hover:bg-white/[0.07] hover:text-white',
	danger:
		'border border-rose-400/30 bg-rose-500/15 text-rose-200 hover:border-rose-400/60 hover:bg-rose-500/25',
	success: 'border border-emerald-400/30 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25'
} as const;

export const BUTTON_SIZES = {
	sm: 'px-3 py-1.5 text-sm',
	md: 'px-4 py-2.5 text-sm',
	lg: 'px-5 py-3 text-base'
} as const;

export const ICON_BUTTON_BASE =
	'inline-grid size-10 shrink-0 place-items-center rounded-xl border border-white/12 bg-white/[0.06] text-white/80 transition-colors hover:border-white/25 hover:bg-white/[0.12] hover:text-white disabled:cursor-not-allowed disabled:opacity-50';

export const BADGE_TONE: Record<Tone, string> = {
	neutral: 'border-white/15 bg-white/[0.07] text-white/70',
	brand: 'border-signal-400/40 bg-signal-400/12 text-signal-300',
	info: 'border-sky-400/40 bg-sky-400/12 text-sky-200',
	success: 'border-emerald-400/40 bg-emerald-400/12 text-emerald-200',
	warning: 'border-amber-400/40 bg-amber-400/12 text-amber-200',
	danger: 'border-rose-400/40 bg-rose-400/12 text-rose-200',
	violet: 'border-violet-400/40 bg-violet-400/12 text-violet-200',
	cyan: 'border-teal-400/40 bg-teal-400/12 text-teal-200'
};

export const ALERT_TONE: Record<Tone, string> = {
	neutral: 'border-white/12 bg-white/[0.05] text-white',
	brand: 'border-signal-400/30 bg-signal-400/10 text-signal-100',
	info: 'border-sky-400/30 bg-sky-400/10 text-sky-50',
	success: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-50',
	warning: 'border-amber-400/30 bg-amber-400/10 text-amber-50',
	danger: 'border-rose-400/30 bg-rose-400/10 text-rose-50',
	violet: 'border-violet-400/30 bg-violet-400/10 text-violet-50',
	cyan: 'border-teal-400/30 bg-teal-400/10 text-teal-50'
};

export const TEXT_TONE: Record<Tone, string> = {
	neutral: 'text-white/45',
	brand: 'text-signal-300',
	info: 'text-sky-300',
	success: 'text-emerald-300',
	warning: 'text-amber-300',
	danger: 'text-rose-300',
	violet: 'text-violet-300',
	cyan: 'text-teal-300'
};

/** Yes / No / Unknown presentation shared by amenity status rows. */
export const AMENITY_STATE = {
	yes: { label: 'Available', dot: 'bg-emerald-400', text: 'text-emerald-300' },
	no: { label: 'Unavailable', dot: 'bg-rose-400', text: 'text-rose-300' },
	unknown: { label: 'Unknown', dot: 'bg-white/30', text: 'text-white/50' }
} as const;

/** Joins class names, dropping empty ones. */
export function cx(...parts: (string | false | null | undefined)[]): string {
	return parts.filter(Boolean).join(' ');
}
