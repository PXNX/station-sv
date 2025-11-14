<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { browser } from '$app/environment';
	import FluentArrowRight24Regular from '~icons/fluent/arrow-right-24-regular';
	import FluentEmojiFaceWithRaisedEyebrow from '~icons/fluent-emoji/face-with-raised-eyebrow';
	import FluentEmojiHighVoltage from '~icons/fluent-emoji/high-voltage';
	import FluentEmojiToilet from '~icons/fluent-emoji/toilet';
	import FluentEmojiStation from '~icons/fluent-emoji/station';
	import FluentEmojiTwelveOclock from '~icons/fluent-emoji/twelve-oclock';
	import FluentEmojiFire from '~icons/fluent-emoji/fire';
	import FluentEmojiCrescentMoon from '~icons/fluent-emoji/crescent-moon';
	import FluentEmojiRedCircle from '~icons/fluent-emoji/red-circle';
	import FluentEmojiGreenCircle from '~icons/fluent-emoji/green-circle';
	import FluentEmojiWifi from '~icons/fluent-emoji/antenna-bars';
	import FluentLocation24Regular from '~icons/fluent/location-24-regular';
	import OptimizedLocationImage from '$lib/components/OptimizedLocationImage.svelte';
	import type { PageData, ActionData } from './$types';
	import type { StationResult } from '$lib/types';
	import { page } from '$app/state';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	// localStorage keys
	const STORAGE_KEYS = {
		searchTerm: 'station_search_term',
		searchResults: 'station_search_results',
		filters: 'station_search_filters',
		favorites: 'station_favorites'
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

	function setToStorage(key: string, value: any): void {
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

	// Favorites count
	let favoritesCount = $state(0);

	// Station filters - initialize from URL params or localStorage
	const savedFilters = getFromStorage(STORAGE_KEYS.filters, {});

	let filterOpen24h = $state(
		hasUrlParams ? page.url.searchParams.get('open24h') === 'true' : savedFilters.open24h || false
	);

	let filterWarmSleep = $state(
		hasUrlParams
			? page.url.searchParams.get('warmSleep') === 'true'
			: savedFilters.warmSleep || false
	);

	let filterOutletAvailable = $state(
		hasUrlParams ? page.url.searchParams.get('outlets') === 'true' : savedFilters.outlets || false
	);

	let filterToiletsAtNight = $state(
		hasUrlParams
			? page.url.searchParams.get('toiletsAtNight') === 'true'
			: savedFilters.toiletsAtNight || false
	);

	let filterToilets = $state(
		hasUrlParams ? page.url.searchParams.get('toilets') === 'true' : savedFilters.toilets || false
	);

	let filterWifi = $state(
		hasUrlParams ? page.url.searchParams.get('wifi') === 'true' : savedFilters.wifi || false
	);

	// Autocomplete state
	let stationSuggestions = $state<any[]>([]);
	let showStationDropdown = $state(false);
	let suggestionLoading = $state(false);

	// Update favorites count
	function updateFavoritesCount() {
		const favorites = getFromStorage<number[]>(STORAGE_KEYS.favorites, []);
		favoritesCount = favorites.length;
	}

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
		setToStorage(STORAGE_KEYS.filters, {
			open24h: filterOpen24h,
			warmSleep: filterWarmSleep,
			outlets: filterOutletAvailable,
			toiletsAtNight: filterToiletsAtNight,
			toilets: filterToilets,
			wifi: filterWifi
		});
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

	// Check favorites count on mount
	$effect(() => {
		if (browser) {
			updateFavoritesCount();
			// Update count periodically in case it changes
			const interval = setInterval(updateFavoritesCount, 1000);
			return () => clearInterval(interval);
		}
	});

	function handleStationFormSubmit() {
		stationLoading = true;
		return async ({ update }) => {
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

		suggestionLoading = true;
		try {
			const response = await fetch(
				`https://bahn.expert/api/hafas/v1/locations?query=${encodeURIComponent(query)}`
			);
			const data = await response.json();
			stationSuggestions = data || [];
			showStationDropdown = true;
		} catch (error) {
			console.error('Failed to fetch suggestions:', error);
			stationSuggestions = [];
		} finally {
			suggestionLoading = false;
		}
	}

	function selectStationSuggestion(station: any) {
		stationSearchTerm = station.name;
		showStationDropdown = false;
		stationSuggestions = [];

		// Trigger the search by submitting the form
		const form = document.getElementById('station-search-form') as HTMLFormElement;
		if (form) {
			form.requestSubmit();
		}
	}

	function getCategoryStyles(category: number) {
		switch (category) {
			case 1:
				return {
					label: 'Major Hub',
					cardClass:
						'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/50 hover:from-purple-500/30 hover:to-pink-500/30 hover:border-purple-400/70'
				};
			case 2:
				return {
					label: 'Important',
					cardClass:
						'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-400/50 hover:from-blue-500/30 hover:to-cyan-500/30 hover:border-blue-400/70'
				};
			case 3:
				return {
					label: 'Regional Hub',
					cardClass:
						'bg-gradient-to-br from-green-500/20 to-teal-500/20 border-green-400/50 hover:from-green-500/30 hover:to-teal-500/30 hover:border-green-400/70'
				};
			case 4:
				return {
					label: 'Medium',
					cardClass:
						'bg-gradient-to-br from-orange-500/20 to-amber-500/20 border-orange-400/50 hover:from-orange-500/30 hover:to-amber-500/30 hover:border-orange-400/70'
				};
			default:
				return {
					label: 'Station',
					cardClass:
						'bg-gradient-to-br from-gray-500/20 to-slate-500/20 border-gray-400/50 hover:from-gray-500/30 hover:to-slate-500/30 hover:border-gray-400/70'
				};
		}
	}

	const showEmptyState = $derived(
		!stationLoading && searchResults.length === 0 && stationSearchTerm.length >= 2
	);
</script>

<!-- Header -->
<header class="mb-10 text-center">
	<div class="mb-4 flex justify-center">
		<FluentEmojiStation class="size-16" />
	</div>
	<h1 class="text-3xl font-bold text-white">Train Station Search</h1>
	<p class="mt-2 text-sm text-white/70">
		Find stations with amenities for travelers ·
		<a
			href="/about"
			class="text-white/60 underline decoration-white/30 underline-offset-2 transition-colors hover:text-white/90 hover:decoration-white/50"
		>
			About
		</a>
	</p>
</header>

<!-- Construction Warning -->
<div class="alert mb-6 border border-yellow-400/50 bg-yellow-400/20 shadow-lg">
	<svg
		xmlns="http://www.w3.org/2000/svg"
		class="h-6 w-6 shrink-0 stroke-yellow-200"
		fill="none"
		viewBox="0 0 24 24"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
		/>
	</svg>
	<div>
		<h3 class="font-bold text-yellow-100">Site Under Construction</h3>
		<div class="text-sm text-yellow-100/90">
			This site is still in development. All data will be reset periodically during testing.
		</div>
	</div>
</div>

<!-- Auth Navigation -->
<div class="card mb-6 border border-white/30 bg-white/10 backdrop-blur-md">
	<div class="card-body flex flex-row-reverse justify-between gap-x-2 p-1 md:p-2">
		<div class="flex gap-2">
			{#if data.session && data.user}
				<a href="/auth/logout" class="btn btn-ghost btn-sm"> Logout </a>
			{/if}

			{#if !data.session || !data.user}
				<a href="/auth/login" class="btn btn-ghost btn-sm"> Login </a>
			{/if}
		</div>

		<div class="flex gap-2">
			<a href="/favorites" class="btn btn-ghost btn-sm">
				Favorites
				{#if favoritesCount > 0}
					<span class="badge badge-sm badge-primary">{favoritesCount}</span>
				{/if}
			</a>

			{#if data.session && data.user}
				<a href="/pending" class="btn btn-ghost btn-sm">
					{#if data.session && data.user && data.user.isAdmin}
						Pending changes
					{:else}
						My pending changes
					{/if}
				</a>
			{/if}
		</div>
	</div>
</div>

<!-- Search Form -->
<div class="card mb-6 border border-white/30 bg-white/10 backdrop-blur-md">
	<div class="card-body p-4 md:p-6">
		<form
			id="station-search-form"
			method="POST"
			action="?/search"
			use:enhance={handleStationFormSubmit}
			class="space-y-4 md:space-y-6"
		>
			<!-- Station Location Input -->
			<div class="autocomplete-container relative">
				<input
					id="station-name"
					type="text"
					name="name"
					placeholder="Search by location (e.g., München, Berlin, Frankfurt)..."
					class="input w-full rounded-xl border border-white/40 bg-white/10 px-4 py-3 text-white placeholder-white/60 backdrop-blur-sm transition-all duration-200 focus:border-blue-200 focus:bg-white/30"
					bind:value={stationSearchTerm}
					oninput={() => fetchStationSuggestions(stationSearchTerm)}
					onfocus={() => stationSuggestions.length > 0 && (showStationDropdown = true)}
					onblur={() => setTimeout(() => (showStationDropdown = false), 200)}
					disabled={stationLoading}
					autocomplete="off"
				/>

				<!-- Autocomplete Dropdown -->
				{#if showStationDropdown && stationSuggestions.length > 0}
					<div
						class="absolute z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-white/40 bg-white/95 shadow-xl backdrop-blur-md"
					>
						{#each stationSuggestions as suggestion}
							<button
								type="button"
								class="block w-full px-4 py-3 text-left transition-colors hover:bg-blue-100"
								onclick={() => selectStationSuggestion(suggestion)}
							>
								<div class="flex items-center gap-2 font-semibold text-gray-800">
									<FluentLocation24Regular class="size-4" />
									{suggestion.name}
								</div>
								{#if suggestion.id}
									<div class="text-xs text-gray-600">{suggestion.id}</div>
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Filters -->
			<div class="space-y-2">
				<h3 class="text-sm font-semibold text-white/90">Filter by amenities:</h3>
				<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					<label
						class="flex cursor-pointer items-center gap-3 rounded-lg bg-white/5 p-3 transition-colors hover:bg-white/10"
					>
						<input
							type="checkbox"
							name="open24h"
							bind:checked={filterOpen24h}
							class="checkbox checkbox-sm border-white/40"
						/>
						<FluentEmojiTwelveOclock class="size-5 shrink-0" />
						<span class="text-sm text-white">Open 24/7</span>
					</label>

					<label
						class="flex cursor-pointer items-center gap-3 rounded-lg bg-white/5 p-3 transition-colors hover:bg-white/10"
					>
						<input
							type="checkbox"
							name="warmSleep"
							bind:checked={filterWarmSleep}
							class="checkbox checkbox-sm border-white/40"
						/>
						<FluentEmojiFire class="size-5 shrink-0" />
						<span class="text-sm text-white">Warm sleeping spots</span>
					</label>

					<label
						class="flex cursor-pointer items-center gap-3 rounded-lg bg-white/5 p-3 transition-colors hover:bg-white/10"
					>
						<input
							type="checkbox"
							name="outlets"
							bind:checked={filterOutletAvailable}
							class="checkbox checkbox-sm border-white/40"
						/>
						<FluentEmojiHighVoltage class="size-5 shrink-0" />
						<span class="text-sm text-white">Power outlets</span>
					</label>

					<label
						class="flex cursor-pointer items-center gap-3 rounded-lg bg-white/5 p-3 transition-colors hover:bg-white/10"
					>
						<input
							type="checkbox"
							name="toilets"
							bind:checked={filterToilets}
							class="checkbox checkbox-sm border-white/40"
						/>
						<FluentEmojiToilet class="size-5 shrink-0" />
						<span class="text-sm text-white">Toilets</span>
					</label>

					<label
						class="flex cursor-pointer items-center gap-3 rounded-lg bg-white/5 p-3 transition-colors hover:bg-white/10"
					>
						<input
							type="checkbox"
							name="toiletsAtNight"
							bind:checked={filterToiletsAtNight}
							class="checkbox checkbox-sm border-white/40"
						/>
						<FluentEmojiCrescentMoon class="size-5 shrink-0" />
						<span class="text-sm text-white">Night toilets</span>
					</label>

					<label
						class="flex cursor-pointer items-center gap-3 rounded-lg bg-white/5 p-3 transition-colors hover:bg-white/10"
					>
						<input
							type="checkbox"
							name="wifi"
							bind:checked={filterWifi}
							class="checkbox checkbox-sm border-white/40"
						/>
						<FluentEmojiWifi class="size-5 shrink-0" />
						<span class="text-sm text-white">WiFi</span>
					</label>
				</div>
			</div>

			<!-- Submit button -->
			<div class="flex flex-row-reverse">
				<button
					type="submit"
					class="btn btn-md btn-primary"
					disabled={stationLoading || stationSearchTerm.length < 2}
				>
					{#if stationLoading}
						<span class="loading loading-spinner loading-sm"></span>
					{/if}
					<span class="text-lg">Search Stations</span>
					<FluentArrowRight24Regular class="size-5" />
				</button>
			</div>
		</form>
	</div>
</div>

<!-- Error Message -->
{#if form?.error}
	<div class="alert alert-warning mb-4">
		<span>{form.error}</span>
	</div>
{/if}

<!-- Search Results Count -->
{#if !stationLoading && searchResults.length > 0}
	<div class="mb-4">
		<p class="text-sm font-medium text-white/80">
			Found <span class="text-white">{searchResults.length}</span> station{searchResults.length !==
			1
				? 's'
				: ''}
		</p>
	</div>
{/if}

<!-- Station Cards -->
{#if searchResults.length > 0}
	<div class="space-y-4">
		{#each searchResults as station (station.eva)}
			{@const categoryStyles = getCategoryStyles(station.category)}
			<a
				href={`/station/${station.eva}`}
				class="card group overflow-hidden border backdrop-blur-md transition-all duration-300 hover:scale-[1.02] {categoryStyles.cardClass}"
				style="view-transition-name: station-{station.eva}"
			>
				<div class="card-body p-0">
					<div class="flex flex-1 items-start gap-4 p-4">
						<!-- Station Photo/Icon -->
						<div class="shrink-0" style="view-transition-name: icon-{station.eva}">
							<div class="size-16 overflow-hidden rounded-2xl">
								{#if station.photoUrl}
									<OptimizedLocationImage
										src={station.photoUrl}
										alt={station.name}
										class="size-16"
									/>
								{:else}
									<div
										class="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-teal-500"
									>
										<FluentEmojiStation class="h-10 w-10" />
									</div>
								{/if}
							</div>
						</div>

						<!-- Station Info -->
						<div class="grow">
							<div class="mb-1 flex items-center gap-2">
								<h3
									class="text-lg font-bold text-white transition-colors duration-200 group-hover:text-blue-100"
								>
									{station.name}
								</h3>
							</div>
							<div
								class="text-sm text-white/70 transition-colors duration-200 group-hover:text-white/90"
							>
								<span class="font-mono text-xs">#{station.eva}</span>
								{#if station.city}
									<span> · {station.city}</span>
								{/if}
								<span> · {station.country.toUpperCase()}</span>
							</div>

							<!-- Amenities Tags -->
							<div class="mt-3 flex flex-wrap gap-2">
								{#if station.is_open_24h}
									<span
										class="badge badge-sm flex items-center gap-1 border-green-400/50 bg-green-400/20 text-green-100"
									>
										<FluentEmojiGreenCircle class="h-3 w-3" />
										24/7
									</span>
								{:else}
									<span
										class="badge badge-sm flex items-center gap-1 border-red-400/50 bg-red-400/20 text-red-100"
									>
										<FluentEmojiRedCircle class="h-3 w-3" />
										Limited Hours
									</span>
								{/if}

								{#if station.has_warm_sleep}
									<span
										class="badge badge-sm flex items-center gap-1 border-orange-400/50 bg-orange-400/20 text-orange-100"
									>
										<FluentEmojiFire class="h-3 w-3" />
										Warm Sleep
									</span>
								{/if}

								{#if station.has_outlets}
									<span
										class="badge badge-sm flex items-center gap-1 border-yellow-400/50 bg-yellow-400/20 text-yellow-100"
									>
										<FluentEmojiHighVoltage class="h-3 w-3" />
										Outlets
									</span>
								{/if}

								{#if station.has_toilets}
									<span
										class="badge badge-sm flex items-center gap-1 border-purple-400/50 bg-purple-400/20 text-purple-100"
									>
										<FluentEmojiToilet class="h-3 w-3" />
										Toilets
									</span>
								{/if}

								{#if station.toilets_open_at_night}
									<span
										class="badge badge-sm flex items-center gap-1 border-blue-300/50 bg-blue-300/20 text-blue-100"
									>
										<FluentEmojiCrescentMoon class="h-3 w-3" />
										Night Toilets
									</span>
								{/if}

								{#if station.has_wifi}
									<span
										class="badge badge-sm flex items-center gap-1 border-cyan-400/50 bg-cyan-400/20 text-cyan-100"
									>
										<FluentEmojiWifi class="h-3 w-3" />
										WiFi
									</span>
								{/if}
							</div>
						</div>

						<!-- Arrow -->
						<div class="flex shrink-0 items-center">
							<FluentArrowRight24Regular
								class="size-8 text-white/60 transition-all duration-300 group-hover:translate-x-2 group-hover:scale-110 group-hover:text-white"
							/>
						</div>
					</div>
				</div>
			</a>
		{/each}
	</div>
{/if}

<!-- Empty State -->
{#if showEmptyState}
	<div class="card border border-white/30 bg-white/10 backdrop-blur-md">
		<div class="card-body items-center justify-center gap-y-4 py-20">
			<FluentEmojiFaceWithRaisedEyebrow class="size-16" />
			<h3 class="text-2xl font-bold text-white">No stations found</h3>
			<p class="text-center text-lg text-white/70">
				Try adjusting your search or filters. Make sure to enter at least 2 characters.
			</p>
		</div>
	</div>
{/if}
