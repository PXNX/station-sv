// src/lib/design/tokens.ts
// Single source of truth for the visual language: surfaces, tones and form fields.
// Class strings are written out literally so Tailwind can pick them up.
import type { Component } from 'svelte';
import type { SvelteHTMLElements } from 'svelte/elements';

/** Any icon imported via `~icons/...`. */
export type IconComponent = Component<SvelteHTMLElements['svg']>;

/**
 * Semantic colour roles. `neutral`/`info`/`success`/`warning`/`danger` carry
 * meaning; `violet`/`cyan`/`brand` are accents used to tell amenities apart.
 */
export type Tone =
	| 'neutral'
	| 'brand'
	| 'info'
	| 'success'
	| 'warning'
	| 'danger'
	| 'violet'
	| 'cyan';

/** Raised glass surface — cards, dialogs, anything sitting on the page background. */
export const SURFACE_PANEL =
	'rounded-2xl border border-white/12 bg-white/6 shadow-lg shadow-black/20 backdrop-blur-md';

/** Recessed surface — nested blocks inside a panel. */
export const SURFACE_INSET = 'rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm';

/** Interactive recessed surface — filter tiles, list rows. */
export const SURFACE_INTERACTIVE =
	'rounded-xl border border-white/10 bg-white/5 transition-colors hover:border-white/20 hover:bg-white/10';

/** Text inputs, textareas and selects. */
export const INPUT_CLASS =
	'w-full rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-white placeholder-white/40 transition-colors outline-none focus:border-sky-300/60 focus:bg-white/12 focus:ring-2 focus:ring-sky-400/30 disabled:cursor-not-allowed disabled:opacity-60';

/** Checkboxes. */
export const CHECKBOX_CLASS =
	'checkbox checkbox-sm shrink-0 border-white/30 bg-white/10 checked:border-sky-400 checked:bg-sky-500';

export const BADGE_TONE: Record<Tone, string> = {
	neutral: 'border-white/20 bg-white/10 text-white/80',
	brand: 'border-indigo-400/40 bg-indigo-400/15 text-indigo-100',
	info: 'border-sky-400/40 bg-sky-400/15 text-sky-100',
	success: 'border-emerald-400/40 bg-emerald-400/15 text-emerald-100',
	warning: 'border-amber-400/40 bg-amber-400/15 text-amber-100',
	danger: 'border-rose-400/40 bg-rose-400/15 text-rose-100',
	violet: 'border-violet-400/40 bg-violet-400/15 text-violet-100',
	cyan: 'border-cyan-400/40 bg-cyan-400/15 text-cyan-100'
};

export const ALERT_TONE: Record<Tone, string> = {
	neutral: 'border-white/15 bg-white/6 text-white',
	brand: 'border-indigo-400/30 bg-indigo-400/10 text-indigo-50',
	info: 'border-sky-400/30 bg-sky-400/10 text-sky-50',
	success: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-50',
	warning: 'border-amber-400/30 bg-amber-400/10 text-amber-50',
	danger: 'border-rose-400/30 bg-rose-400/10 text-rose-50',
	violet: 'border-violet-400/30 bg-violet-400/10 text-violet-50',
	cyan: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-50'
};

export const TEXT_TONE: Record<Tone, string> = {
	neutral: 'text-white/50',
	brand: 'text-indigo-300',
	info: 'text-sky-300',
	success: 'text-emerald-300',
	warning: 'text-amber-300',
	danger: 'text-rose-300',
	violet: 'text-violet-300',
	cyan: 'text-cyan-300'
};

/** Joins class names, dropping empty ones. */
export function cx(...parts: (string | false | null | undefined)[]): string {
	return parts.filter(Boolean).join(' ');
}
