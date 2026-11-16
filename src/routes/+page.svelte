<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import FluentArrowRight24Regular from '~icons/fluent/arrow-right-24-regular';
	import FluentSearch24Regular from '~icons/fluent/search-24-regular';
	import FluentFilter24Regular from '~icons/fluent/filter-24-regular';
	import FluentLocation24Regular from '~icons/fluent/location-24-regular';
	import FluentEmojiFaceWithRaisedEyebrow from '~icons/fluent-emoji/face-with-raised-eyebrow';
	import FluentEmojiStation from '~icons/fluent-emoji/station';
	import type { PageData } from './$types';
	import type { StationResult } from '$lib/types';
	import StationCard from '$lib/components/StationCard.svelte';
	import { AMENITIES } from '$lib/client/amenities';
	import { INPUT_CLASS } from '$lib/design/tokens';
	import { Button, Card, EmptyState, PageHeader, Spinner } from '$lib/components/ui';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const RECENT_KEY = 'station_recent_searches';
	const FILTER_KEY = 'station_search_filters';
	const POPULAR = ['Berlin', 'München', 'Hamburg', 'Frankfurt', 'Köln'];

	function readJson<T>(key: string, fallback: T): T {
		if (!browser) return fallback;
		try {
			const raw = localStorage.getItem(key);
			return raw ? (JSON.parse(raw) as T) : fallback;
		} catch {
			return fallback;
		}
	}

	function writeJson(key: string, value: unknown) {
		if (!browser) return;
		try {
			localStorage.setItem(key, JSON.stringify(value));
		} catch (error) {
			console.error('Failed to persist search preferences:', error);
		}
	}

	const savedFilters = readJson<Record<string, boolean>>(FILTER_KEY, {});

	// Seed from the URL/localStorage once; later URL changes are handled by the effect below.
	let query = $state(untrack(() => data.query ?? ''));
	let filters = $state<Record<string, boolean>>(
		Object.fromEntries(
			AMENITIES.map(({ key }) => [key, untrack(() => data.filters?.[key]) ?? savedFilters[key] ?? false])
		)
	);
	let sort = $state<'relevance' | 'name' | 'category'>('relevance');
	let recent = $state<string[]>(readJson<string[]>(RECENT_KEY, []));
	let suggestions = $state<{ id?: string; name: string }[]>([]);
	let showSuggestions = $state(false);
	let searching = $state(false);

	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	let request: AbortController | undefined;

	// Keep the input in sync when the URL changes (back/forward buttons).
	$effect(() => {
		if (data.query && data.query !== query) query = data.query;
		searching = false;
	});

	$effect(() => writeJson(FILTER_KEY, filters));

	const activeFilters = $derived(AMENITIES.filter(({ key }) => filters[key]));
	const activeFilterCount = $derived(activeFilters.length);

	const results = $derived.by(() => {
		let list: StationResult[] = data.stations ?? [];
		if (activeFilters.length > 0) {
			list = list.filter((station) => activeFilters.every((a) => station[a.field] === true));
		}
		if (sort === 'name') {
			list = [...list].sort((a, b) => a.name.localeCompare(b.name));
		} else if (sort === 'category') {
			list = [...list].sort((a, b) => a.category - b.category || a.name.localeCompare(b.name));
		}
		return list;
	});

	const hasSearched = $derived((data.query ?? '').length >= 2);
	const resultsKey = $derived(
		`${data.query}|${activeFilterCount}|${JSON.stringify(filters)}|${sort}`
	);

	function remember(term: string) {
		recent = [term, ...recent.filter((item) => item.toLowerCase() !== term.toLowerCase())].slice(0, 5);
		writeJson(RECENT_KEY, recent);
	}

	function urlFor(term: string) {
		const params = new URLSearchParams({ name: term });
		return `${resolve('/')}?${params.toString()}`;
	}

	function runSearch(term: string) {
		const trimmed = term.trim();
		if (trimmed.length < 2) return;
		remember(trimmed);
		showSuggestions = false;
		suggestions = [];
		searching = true;
		goto(urlFor(trimmed), { noScroll: true, keepFocus: true });
	}

	/** The form navigates natively; this only saves preferences and guards short queries. */
	function onSubmit(event: SubmitEvent) {
		const trimmed = query.trim();
		if (trimmed.length < 2) {
			event.preventDefault();
			return;
		}
		remember(trimmed);
		searching = true;
		showSuggestions = false;
		suggestions = [];
	}

	function onInput() {
		clearTimeout(debounceTimer);
		request?.abort();
		if (query.trim().length < 2) {
			suggestions = [];
			showSuggestions = false;
			return;
		}
		debounceTimer = setTimeout(async () => {
			request = new AbortController();
			try {
				const response = await fetch(
					`https://bahn.expert/api/hafas/v1/locations?query=${encodeURIComponent(query.trim())}`,
					{ signal: request.signal }
				);
				const payload = await response.json();
				suggestions = Array.isArray(payload) ? payload.slice(0, 6) : [];
				showSuggestions = suggestions.length > 0;
			} catch (error) {
				if (error instanceof DOMException && error.name === 'AbortError') return;
				suggestions = [];
			}
		}, 250);
	}

	function selectSuggestion(station: { name: string }) {
		query = station.name;
		runSearch(station.name);
	}

	function clearFilters() {
		for (const amenity of AMENITIES) filters[amenity.key] = false;
	}

	onDestroy(() => {
		clearTimeout(debounceTimer);
		request?.abort();
	});
</script>

<svelte:head>
	<title>Station Atlas — find a station that has what you need</title>
</svelte:head>

<PageHeader
	title="Where are you heading?"
	eyebrow="Station Atlas"
	icon={FluentEmojiStation}
	description="Find stations with the amenities that matter on your trip."
/>

<!-- Search form: a plain GET so every search is a shareable URL. -->
<Card class="mb-6 overflow-visible" padding="lg">
	<form method="GET" action={resolve('/')} onsubmit={onSubmit} class="space-y-6">
		<div class="relative">
			<div class="relative">
				<FluentSearch24Regular
					class="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-white/35"
				/>
				<input
					id="station-name"
					type="text"
					name="name"
					placeholder="Search a station, city or region…"
					class="{INPUT_CLASS} py-4 pr-12 pl-12 text-base"
					bind:value={query}
					oninput={onInput}
					onfocus={() => suggestions.length > 0 && (showSuggestions = true)}
					onblur={() => setTimeout(() => (showSuggestions = false), 160)}
					autocomplete="off"
					aria-label="Station or city"
				/>
				{#if searching}
					<Spinner size="sm" class="absolute top-1/2 right-4 -translate-y-1/2" />
				{/if}
			</div>

			{#if showSuggestions && suggestions.length > 0}
				<div
					class="animate-pop absolute z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-white/12 bg-ink-800/95 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl"
				>
					{#each suggestions as suggestion (suggestion.id || suggestion.name)}
						<button
							type="button"
							class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/8"
							onclick={() => selectSuggestion(suggestion)}
						>
							<FluentLocation24Regular class="size-4 shrink-0 text-signal-300" />
							<span class="min-w-0 grow truncate text-sm font-medium text-white">
								{suggestion.name}
							</span>
							{#if suggestion.id}
								<span class="shrink-0 font-mono text-[10px] text-white/30">{suggestion.id}</span>
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<fieldset>
			<legend class="mb-3 flex items-center gap-2 text-sm font-semibold text-white/80">
				<FluentFilter24Regular class="size-4 text-signal-300" />
				Must have
				{#if activeFilterCount > 0}
					<span class="rounded-full bg-signal-400/15 px-2 py-0.5 text-xs text-signal-300">
						{activeFilterCount}
					</span>
				{/if}
			</legend>
			<div class="flex flex-wrap gap-2">
				{#each AMENITIES as amenity (amenity.key)}
					<label
						class="group inline-flex cursor-pointer select-none items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200 {filters[
							amenity.key
						]
							? 'border-signal-400/50 bg-signal-400/15 text-signal-200 shadow-sm shadow-signal-500/10'
							: 'border-white/12 bg-white/[0.04] text-white/60 hover:border-white/25 hover:text-white'}"
					>
						<input
							type="checkbox"
							name={amenity.key}
							value="true"
							class="sr-only"
							bind:checked={filters[amenity.key]}
						/>
						<amenity.icon class="size-4" />
						{amenity.label}
					</label>
				{/each}
				{#if activeFilterCount > 0}
					<button
						type="button"
						onclick={clearFilters}
						class="rounded-full px-3 py-2 text-sm font-medium text-white/45 transition-colors hover:text-white"
					>
						Clear filters
					</button>
				{/if}
			</div>
		</fieldset>

		<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<p class="text-xs text-white/40">At least 2 characters · filters apply as you type</p>
			<Button type="submit" loading={searching} disabled={query.trim().length < 2}>
				Search stations
				<FluentArrowRight24Regular class="size-4" />
			</Button>
		</div>
	</form>
</Card>

{#if !hasSearched}
	<Card padding="lg">
		<p class="eyebrow mb-3">Popular right now</p>
		<div class="flex flex-wrap gap-2">
			{#each POPULAR as city (city)}
				<button
					type="button"
					onclick={() => runSearch(city)}
					class="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/70 transition-all hover:-translate-y-0.5 hover:border-signal-400/40 hover:text-white"
				>
					{city}
				</button>
			{/each}
		</div>
		{#if recent.length > 0}
			<div class="mt-6 border-t border-white/8 pt-5">
				<p class="eyebrow mb-3">Recent searches</p>
				<div class="flex flex-wrap gap-2">
					{#each recent as term (term)}
						<button
							type="button"
							onclick={() => runSearch(term)}
							class="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3.5 py-1.5 text-sm text-white/60 transition-colors hover:text-white"
						>
							<FluentSearch24Regular class="size-3.5" />
							{term}
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</Card>
{:else if results.length > 0}
	<div class="mb-4 flex flex-wrap items-end justify-between gap-3">
		<p class="text-sm text-white/60">
			<span class="text-lg font-bold text-white">{results.length}</span>
			{results.length === 1 ? 'station' : 'stations'} for
			<span class="font-semibold text-white">“{data.query}”</span>
		</p>
		<label class="flex items-center gap-2 text-xs text-white/50">
			Sort
			<select
				bind:value={sort}
				class="rounded-lg border border-white/12 bg-ink-800 px-2.5 py-1.5 text-xs font-medium text-white outline-none focus:border-signal-400/60"
			>
				<option value="relevance">Best match</option>
				<option value="name">Name A–Z</option>
				<option value="category">Station size</option>
			</select>
		</label>
	</div>

	{#key resultsKey}
		<div class="stagger space-y-3">
			{#each results as station (station.eva)}
				<StationCard {station} />
			{/each}
		</div>
	{/key}
{:else}
	<EmptyState
		icon={FluentEmojiFaceWithRaisedEyebrow}
		title="No stations found"
		description={activeFilterCount > 0
			? 'No matches with these filters. Try removing a few and search again.'
			: 'Try a nearby city or check the spelling — search also tolerates small typos.'}
	>
		{#if activeFilterCount > 0}
			<Button variant="secondary" onclick={clearFilters}>Clear filters</Button>
		{:else}
			<Button onclick={() => runSearch('Berlin')}>Try “Berlin”</Button>
		{/if}
	</EmptyState>
{/if}
