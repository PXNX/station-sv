<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import FluentArrowRight24Regular from '~icons/fluent/arrow-right-24-regular';
	import FluentEmojiFaceWithRaisedEyebrow from '~icons/fluent-emoji/face-with-raised-eyebrow';
	import FluentEmojiStation from '~icons/fluent-emoji/station';
	import FluentLocation24Regular from '~icons/fluent/location-24-regular';
	import FluentHeart24Regular from '~icons/fluent/heart-24-regular';
	import type { PageData, ActionData } from './$types';
	import type { StationResult } from '$lib/types';
	import StationCard from '$lib/components/StationCard.svelte';
	import { AMENITIES } from '$lib/client/amenities';
	import { favorites } from '$lib/client/favorites.svelte';
	import { INPUT_CLASS } from '$lib/design/tokens';
	import {
		Alert,
		Badge,
		Button,
		Card,
		CheckboxField,
		EmptyState,
		PageHeader
	} from '$lib/components/ui';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	// localStorage keys
	const STORAGE_KEYS = {
		searchTerm: 'station_search_term',
		searchResults: 'station_search_results',
		filters: 'station_search_filters'
	};

	// Helper functions for localStorage
	function getFromStorage<T>(key: string, defaultValue: T): T {
		if (!browser) return defaultValue;
		try {
			const item = localStorage.getItem(key);
			return item ? JSON.parse(item) : defaultValue;
		} catch {
			return defaultValue;
		}
	}

	function setToStorage(key: string, value: unknown): void {
		if (!browser) return;
		try {
			localStorage.setItem(key, JSON.stringify(value));
		} catch (error) {
			console.error('Failed to save to localStorage:', error);
		}
	}

	// Initialize from URL params, then fall back to localStorage
	const urlSearchTerm = page.url.searchParams.get('name');
	const hasUrlParams = urlSearchTerm !== null;

	// Station search state
	let stationSearchTerm = $state(urlSearchTerm || getFromStorage(STORAGE_KEYS.searchTerm, ''));

	let searchResults: StationResult[] = $state(
		data.stations?.length > 0 ? data.stations : getFromStorage(STORAGE_KEYS.searchResults, [])
	);

	let stationLoading = $state(false);

	// Amenity filters, keyed by search form field name. Taken from the URL when it
	// carries params, otherwise from the filters saved in the last session.
	const savedFilters = getFromStorage<Record<string, boolean>>(STORAGE_KEYS.filters, {});

	let filters = $state<Record<string, boolean>>(
		Object.fromEntries(
			AMENITIES.map(({ key }) => [
				key,
				hasUrlParams ? page.url.searchParams.get(key) === 'true' : savedFilters[key] || false
			])
		)
	);

	// Autocomplete state
	let stationSuggestions = $state<{ id?: string; name: string }[]>([]);
	let showStationDropdown = $state(false);

	// Persist search term to localStorage
	$effect(() => {
		setToStorage(STORAGE_KEYS.searchTerm, stationSearchTerm);
	});

	// Persist search results to localStorage
	$effect(() => {
		if (searchResults.length > 0) {
			setToStorage(STORAGE_KEYS.searchResults, searchResults);
		}
	});

	// Persist filters to localStorage
	$effect(() => {
		setToStorage(STORAGE_KEYS.filters, filters);
	});

	// Update search results when form response comes back
	$effect(() => {
		if (form?.stations) {
			searchResults = form.stations;
		}
	});

	// Update search results when page data changes
	$effect(() => {
		if (data?.stations && data.stations.length > 0) {
			searchResults = data.stations;
		}
	});

	$effect(() => {
		favorites.load();
	});

	function handleStationFormSubmit() {
		stationLoading = true;
		return async ({ update }: { update: (options?: { reset?: boolean }) => Promise<void> }) => {
			await update({ reset: false });
			stationLoading = false;
		};
	}

	async function fetchStationSuggestions(query: string) {
		if (query.length < 2) {
			stationSuggestions = [];
			showStationDropdown = false;
			return;
		}

		try {
			const response = await fetch(
				`https://bahn.expert/api/hafas/v1/locations?query=${encodeURIComponent(query)}`
			);
			stationSuggestions = (await response.json()) || [];
			showStationDropdown = true;
		} catch (error) {
			console.error('Failed to fetch suggestions:', error);
			stationSuggestions = [];
		}
	}

	function selectStationSuggestion(station: { name: string }) {
		stationSearchTerm = station.name;
		showStationDropdown = false;
		stationSuggestions = [];

		// Trigger the search by submitting the form
		const searchForm = document.getElementById('station-search-form') as HTMLFormElement | null;
		searchForm?.requestSubmit();
	}

	const showEmptyState = $derived(
		!stationLoading && searchResults.length === 0 && stationSearchTerm.length >= 2
	);
</script>

<PageHeader title="Train Station Search" icon={FluentEmojiStation}>
	Find stations with amenities for travelers ·
	<a
		href={resolve('/about')}
		class="underline decoration-white/30 underline-offset-2 transition-colors hover:text-white hover:decoration-white/60"
	>
		About
	</a>
</PageHeader>

<Alert tone="warning" title="Site under construction" class="mb-6">
	This site is still in development. All data will be reset periodically during testing.
</Alert>

<!-- Account and library navigation -->
<Card padding="sm" class="mb-6">
	<div class="flex flex-wrap items-center justify-between gap-2">
		<div class="flex flex-wrap items-center gap-1">
			<Button variant="ghost" size="sm" href={resolve('/favorites')}>
				<FluentHeart24Regular class="size-4" />
				Favorites
				{#if favorites.count > 0}
					<Badge tone="info">{favorites.count}</Badge>
				{/if}
			</Button>

			{#if data.session && data.user}
				<Button variant="ghost" size="sm" href={resolve('/pending')}>
					{data.user.isAdmin ? 'Pending changes' : 'My pending changes'}
				</Button>
			{/if}
		</div>

		{#if data.session && data.user}
			<Button variant="ghost" size="sm" href={resolve('/auth/logout')}>Logout</Button>
		{:else}
			<Button variant="secondary" size="sm" href={resolve('/auth/login')}>Login</Button>
		{/if}
	</div>
</Card>

<!-- Search form -->
<Card class="mb-6">
	<form
		id="station-search-form"
		method="POST"
		action="?/search"
		use:enhance={handleStationFormSubmit}
		class="space-y-5"
	>
		<!-- Location input with autocomplete -->
		<div class="relative">
			<input
				id="station-name"
				type="text"
				name="name"
				placeholder="Search by location (e.g., München, Berlin, Frankfurt)..."
				class={INPUT_CLASS}
				bind:value={stationSearchTerm}
				oninput={() => fetchStationSuggestions(stationSearchTerm)}
				onfocus={() => stationSuggestions.length > 0 && (showStationDropdown = true)}
				onblur={() => setTimeout(() => (showStationDropdown = false), 200)}
				disabled={stationLoading}
				autocomplete="off"
			/>

			{#if showStationDropdown && stationSuggestions.length > 0}
				<div
					class="absolute z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-white/12 bg-slate-900/95 shadow-xl backdrop-blur-md"
				>
					{#each stationSuggestions as suggestion (suggestion.id || suggestion.name)}
						<button
							type="button"
							class="block w-full border-b border-white/5 px-4 py-3 text-left transition-colors last:border-0 hover:bg-white/10"
							onclick={() => selectStationSuggestion(suggestion)}
						>
							<div class="flex items-center gap-2 font-medium text-white">
								<FluentLocation24Regular class="size-4 shrink-0 text-white/50" />
								{suggestion.name}
							</div>
							{#if suggestion.id}
								<div class="mt-0.5 pl-6 text-xs text-white/40">{suggestion.id}</div>
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Amenity filters -->
		<fieldset class="space-y-2">
			<legend class="text-sm font-semibold text-white/80">Filter by amenities</legend>
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{#each AMENITIES as amenity (amenity.key)}
					<CheckboxField
						variant="tile"
						name={amenity.key}
						label={amenity.label}
						icon={amenity.icon}
						bind:checked={filters[amenity.key]}
					/>
				{/each}
			</div>
		</fieldset>

		<div class="flex justify-end">
			<Button
				type="submit"
				loading={stationLoading}
				disabled={stationSearchTerm.length < 2}
				title={stationSearchTerm.length < 2 ? 'Enter at least 2 characters' : undefined}
			>
				Search stations
				<FluentArrowRight24Regular class="size-5" />
			</Button>
		</div>
	</form>
</Card>

{#if form?.error}
	<Alert tone="danger" class="mb-4">{form.error}</Alert>
{/if}

{#if !stationLoading && searchResults.length > 0}
	<p class="mb-4 text-sm text-white/60">
		Found <span class="font-semibold text-white">{searchResults.length}</span>
		{searchResults.length === 1 ? 'station' : 'stations'}
	</p>
{/if}

{#if searchResults.length > 0}
	<div class="space-y-4">
		{#each searchResults as station (station.eva)}
			<StationCard {station} />
		{/each}
	</div>
{/if}

{#if showEmptyState}
	<EmptyState
		icon={FluentEmojiFaceWithRaisedEyebrow}
		title="No stations found"
		description="Try adjusting your search or filters. Make sure to enter at least 2 characters."
	/>
{/if}
