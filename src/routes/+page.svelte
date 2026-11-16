<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { browser } from '$app/environment';
	import { goto, invalidateAll } from '$app/navigation';
	import { navigating } from '$app/stores';
	import { resolve } from '$app/paths';
	import FluentArrowRight24Regular from '~icons/fluent/arrow-right-24-regular';
	import FluentSearch24Regular from '~icons/fluent/search-24-regular';
	import FluentFilter24Regular from '~icons/fluent/filter-24-regular';
	import FluentLocation24Regular from '~icons/fluent/location-24-regular';
	import FluentList24Regular from '~icons/fluent/list-24-regular';
	import FluentMap24Regular from '~icons/fluent/map-24-regular';
	import FluentCloudOffline24Regular from '~icons/fluent/cloud-offline-24-regular';
	import FluentEmojiFaceWithRaisedEyebrow from '~icons/fluent-emoji/face-with-raised-eyebrow';
	import FluentEmojiStation from '~icons/fluent-emoji/station';
	import type { PageData } from './$types';
	import type { StationResult } from '$lib/types';
	import StationCard from '$lib/components/station/StationCard.svelte';
	import StationMap from '$lib/components/station/StationMap.svelte';
	import { AMENITIES } from '$lib/features/stations/amenities';
	import { getAllCachedStations, rememberStations } from '$lib/features/stations/station-cache';
	import { recentlyViewed } from '$lib/features/stations/recent.svelte';
	import { network } from '$lib/features/network/online.svelte';
	import { INPUT_CLASS } from '$lib/design/tokens';
	import { Button, Card, EmptyState, PageHeader, Spinner } from '$lib/components/ui';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const RECENT_KEY = 'station_recent_searches';
	const FILTER_KEY = 'station_search_filters';

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

	// Seed from the URL/localStorage once; later URL changes are handled by effects.
	let query = $state(untrack(() => data.query ?? ''));
	let filters = $state<Record<string, boolean>>(
		Object.fromEntries(
			AMENITIES.map(({ key }) => [
				key,
				untrack(() => data.filters?.[key as keyof typeof data.filters]) ??
					savedFilters[key] ??
					false
			])
		)
	);
	let sort = $state<'relevance' | 'name'>('relevance');
	let view = $state<'list' | 'map'>('list');
	let recent = $state<string[]>(readJson<string[]>(RECENT_KEY, []));
	let suggestions = $state<{ id?: string; name: string }[]>([]);
	let showSuggestions = $state(false);

	// Offline searches run against the locally cached stations instead of the server.
	let localQuery = $state<string | null>(null);

	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	let request: AbortController | undefined;

	const searching = $derived($navigating !== null);

	const effectiveQuery = $derived((localQuery ?? data.query ?? '').trim());
	const offlineMode = $derived(!network.online && localQuery !== null);

	// Keep the input in sync with the URL (back/forward), but not while typing.
	$effect(() => {
		const urlQuery = data.query;
		if (urlQuery && urlQuery !== query && $navigating === null) query = urlQuery;
	});

	$effect(() => writeJson(FILTER_KEY, filters));
	$effect(() => network.start());
	$effect(() => recentlyViewed.load());
	$effect(() => rememberStations(data.stations ?? []));

	// Reconnecting: drop the local override so server results take over again.
	$effect(() => {
		if (network.online && localQuery !== null) localQuery = null;
	});

	const sourceStations = $derived(offlineMode ? getAllCachedStations() : (data.stations ?? []));
	const activeFilters = $derived(AMENITIES.filter(({ key }) => filters[key]));
	const activeFilterCount = $derived(activeFilters.length);

	const results = $derived.by(() => {
		let list: StationResult[] = sourceStations;
		const term = effectiveQuery.toLowerCase();

		if (offlineMode && term.length >= 2) {
			list = list.filter(
				(s) => s.name.toLowerCase().includes(term) || (s.city ?? '').toLowerCase().includes(term)
			);
		}
		if (activeFilters.length > 0) {
			list = list.filter((s) => activeFilters.every((a) => s[a.field] === true));
		}
		if (sort === 'name') {
			list = [...list].sort((a, b) => a.name.localeCompare(b.name));
		}
		return list;
	});

	const hasSearched = $derived(effectiveQuery.length >= 2);
	const resultsKey = $derived(`${effectiveQuery}|${activeFilterCount}|${sort}|${view}`);
	const recentStations = $derived(recentlyViewed.stations);

	function remember(term: string) {
		recent = [term, ...recent.filter((item) => item.toLowerCase() !== term.toLowerCase())].slice(
			0,
			5
		);
		writeJson(RECENT_KEY, recent);
	}

	function urlFor(term: string) {
		const params = new URLSearchParams({ name: term });
		return `${resolve('/')}?${params.toString()}`;
	}

	async function runSearch(term: string) {
		const trimmed = term.trim();
		if (trimmed.length < 2) return;
		remember(trimmed);
		showSuggestions = false;
		suggestions = [];

		if (!network.online) {
			localQuery = trimmed;
			return;
		}

		const target = urlFor(trimmed);
		if (browser && target === location.pathname + location.search) {
			await invalidateAll();
			return;
		}
		await goto(target, { noScroll: true, keepFocus: true });
	}

	function onSubmit(event: SubmitEvent) {
		const trimmed = query.trim();
		if (trimmed.length < 2) {
			event.preventDefault();
			return;
		}
		if (!network.online) {
			event.preventDefault();
			runSearch(trimmed);
			return;
		}
		remember(trimmed);
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
		if (!network.online) {
			suggestions = [];
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
	<title>Station Atlas · Explore</title>
</svelte:head>

<PageHeader
	title="Where are you heading?"
	icon={FluentEmojiStation}
	description="Find stations with the amenities you need."
/>

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
					class="animate-pop bg-ink-800/95 absolute z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-white/12 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl"
				>
					{#each suggestions as suggestion (suggestion.id || suggestion.name)}
						<button
							type="button"
							class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/8"
							onclick={() => selectSuggestion(suggestion)}
						>
							<FluentLocation24Regular class="text-signal-300 size-4 shrink-0" />
							<span class="min-w-0 grow truncate text-sm font-medium text-white">
								{suggestion.name}
							</span>
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<fieldset>
			<legend class="mb-3 flex items-center gap-2 text-sm font-semibold text-white/80">
				<FluentFilter24Regular class="text-signal-300 size-4" />
				Must have
				{#if activeFilterCount > 0}
					<span class="bg-signal-400/15 text-signal-300 rounded-full px-2 py-0.5 text-xs">
						{activeFilterCount}
					</span>
				{/if}
			</legend>
			<div class="flex flex-wrap gap-2">
				{#each AMENITIES as amenity (amenity.key)}
					<label
						class="group inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200 select-none active:scale-95 {filters[
							amenity.key
						]
							? 'border-signal-400/50 bg-signal-400/15 text-signal-200 shadow-signal-500/10 shadow-sm'
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
			<p class="text-xs text-white/40">2+ characters · filters apply instantly</p>
			<Button type="submit" loading={searching} disabled={query.trim().length < 2}>
				Search stations
				<FluentArrowRight24Regular class="size-4" />
			</Button>
		</div>
	</form>
</Card>

{#if !hasSearched}
	{#if recentStations.length > 0}
		<section class="mb-6">
			<h2 class="eyebrow mb-3">Recently viewed</h2>
			<div class="stagger space-y-3">
				{#each recentStations.slice(0, 4) as station (station.eva)}
					<StationCard {station} />
				{/each}
			</div>
		</section>
	{/if}
	{#if recent.length > 0}
		<Card padding="lg">
			<h2 class="eyebrow mb-3">Recent searches</h2>
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
		</Card>
	{/if}
{:else if results.length > 0}
	<div class="mb-4 flex flex-wrap items-end justify-between gap-3">
		<p class="text-sm text-white/60">
			<span class="text-lg font-bold text-white">{results.length}</span>
			stations for <span class="font-semibold text-white">“{effectiveQuery}”</span>
			{#if offlineMode}<span class="text-signal-300">· offline results</span>{/if}
		</p>

		<div class="flex items-center gap-2">
			<div class="bg-ink-800 flex rounded-lg border border-white/12 p-0.5">
				<button
					type="button"
					onclick={() => (view = 'list')}
					aria-label="List view"
					aria-pressed={view === 'list'}
					class="grid size-8 place-items-center rounded-md transition-colors {view === 'list'
						? 'bg-white/12 text-white'
						: 'text-white/45 hover:text-white'}"
				>
					<FluentList24Regular class="size-4" />
				</button>
				<button
					type="button"
					onclick={() => (view = 'map')}
					aria-label="Map view"
					aria-pressed={view === 'map'}
					class="grid size-8 place-items-center rounded-md transition-colors {view === 'map'
						? 'bg-white/12 text-white'
						: 'text-white/45 hover:text-white'}"
				>
					<FluentMap24Regular class="size-4" />
				</button>
			</div>
			<label class="flex items-center gap-2 text-xs text-white/50">
				Sort
				<select
					bind:value={sort}
					class="bg-ink-800 focus:border-signal-400/60 rounded-lg border border-white/12 px-2.5 py-1.5 text-xs font-medium text-white outline-none"
				>
					<option value="relevance">Best match</option>
					<option value="name">Name A–Z</option>
				</select>
			</label>
		</div>
	</div>

	{#key resultsKey}
		{#if view === 'list'}
			<div class="stagger space-y-3">
				{#each results as station (station.eva)}
					<StationCard {station} />
				{/each}
			</div>
		{:else}
			<div class="animate-fade-up">
				<StationMap stations={results} />
			</div>
		{/if}
	{/key}
{:else}
	<EmptyState
		icon={offlineMode ? FluentCloudOffline24Regular : FluentEmojiFaceWithRaisedEyebrow}
		title={offlineMode ? 'Nothing cached for that' : 'No stations found'}
		description={offlineMode
			? 'Offline search only covers stations you have already opened.'
			: activeFilterCount > 0
				? 'Try removing a filter.'
				: 'Try another spelling or a nearby city.'}
	>
		{#if activeFilterCount > 0}
			<Button variant="secondary" onclick={clearFilters}>Clear filters</Button>
		{/if}
	</EmptyState>
{/if}
