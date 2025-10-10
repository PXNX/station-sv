<!-- src/routes/+page.svelte -->
<script lang="ts">
	import type { Station } from '$lib/types';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import FluentArrowRight24Regular from '~icons/fluent/arrow-right-24-regular';
	import type { PageData, ActionData } from './$types';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	// Tab state
	let activeTab = $state<'stations' | 'routes'>('stations');

	// Station search state
	let stationSearchTerm = $state($page.url.searchParams.get('name') || '');
	let searchResults: Station[] = $state(data.stations || []);
	let stationLoading = $state(false);

	// Station filters
	let showFavoritesOnly = $state(false);
	let filterOpen24h = $state(false);
	let filterWarmSleep = $state(false);
	let filterToiletsAtNight = $state(false);

	// Route search state
	let routeFrom = $state('');
	let routeTo = $state('');
	let routeLoading = $state(false);
	let routeResults = $state<any[]>([]);

	// Autocomplete state
	let stationSuggestions = $state<any[]>([]);
	let fromSuggestions = $state<any[]>([]);
	let toSuggestions = $state<any[]>([]);
	let showStationDropdown = $state(false);
	let showFromDropdown = $state(false);
	let showToDropdown = $state(false);
	let suggestionLoading = $state(false);

	$effect(() => {
		if (form?.stations) {
			searchResults = form.stations;
		}
	});

	$effect(() => {
		if (data?.stations) {
			searchResults = data.stations;
		}
	});

	function handleStationFormSubmit() {
		stationLoading = true;
		return async ({ update }) => {
			await update({ reset: false });
			stationLoading = false;
		};
	}

	async function handleRouteSearch(e: Event) {
		e.preventDefault();
		if (!routeFrom || !routeTo) return;

		routeLoading = true;
		try {
			const response = await fetch(
				`https://bahn.expert/api/hafas/v1/routing?start=${encodeURIComponent(routeFrom)}&destination=${encodeURIComponent(routeTo)}`
			);
			const data = await response.json();
			routeResults = data.routes || [];
		} catch (error) {
			console.error('Route search failed:', error);
			routeResults = [];
		} finally {
			routeLoading = false;
		}
	}

	async function fetchStationSuggestions(query: string, target: 'station' | 'from' | 'to') {
		if (query.length < 2) {
			if (target === 'station') stationSuggestions = [];
			if (target === 'from') fromSuggestions = [];
			if (target === 'to') toSuggestions = [];
			return;
		}

		suggestionLoading = true;
		try {
			const response = await fetch(
				`https://bahn.expert/api/hafas/v1/locations?query=${encodeURIComponent(query)}`
			);
			const data = await response.json();
			const suggestions = data || [];

			if (target === 'station') {
				stationSuggestions = suggestions;
				showStationDropdown = true;
			} else if (target === 'from') {
				fromSuggestions = suggestions;
				showFromDropdown = true;
			} else if (target === 'to') {
				toSuggestions = suggestions;
				showToDropdown = true;
			}
		} catch (error) {
			console.error('Failed to fetch suggestions:', error);
		} finally {
			suggestionLoading = false;
		}
	}

	function selectStationSuggestion(station: any) {
		stationSearchTerm = station.name;
		showStationDropdown = false;
		stationSuggestions = [];
	}

	function selectFromSuggestion(station: any) {
		routeFrom = station.name;
		showFromDropdown = false;
		fromSuggestions = [];
	}

	function selectToSuggestion(station: any) {
		routeTo = station.name;
		showToDropdown = false;
		toSuggestions = [];
	}

	const showEmptyState = $derived(
		!stationLoading && searchResults.length === 0 && stationSearchTerm
	);
</script>

<svelte:head>
	<title>Train Station & Route Search</title>
	<meta
		name="description"
		content="Search for train stations and routes in Germany. Find sleeping spots, outlets, toilets & station info"
	/>
	<meta name="view-transition" content="same-origin" />
</svelte:head>

<!-- Header -->
<header class="mb-10 text-center">
	<h1 class="mb-4 text-2xl font-bold text-white">Train Station Search</h1>
</header>

<!-- Tabs -->
<div role="tablist" class="tabs tabs-boxed card mb-6 bg-white/10 backdrop-blur-md">
	<button
		role="tab"
		class="tab"
		class:tab-active={activeTab === 'stations'}
		onclick={() => (activeTab = 'stations')}
	>
		🚉 Station
	</button>
	<button
		role="tab"
		class="tab"
		class:tab-active={activeTab === 'routes'}
		onclick={() => (activeTab = 'routes')}
	>
		🗺️ Route
	</button>
</div>

<!-- Station Search Tab -->
{#if activeTab === 'stations'}
	<!-- Search Form -->
	<div class="card mb-6 border border-white/30 bg-white/10 backdrop-blur-md">
		<div class="card-body p-4 md:p-6">
			<form
				method="POST"
				action="?/search"
				use:enhance={handleStationFormSubmit}
				class="space-y-4 md:space-y-6"
			>
				<!-- Station Location Input -->
				<div class="relative">
					<input
						id="station-name"
						type="text"
						name="name"
						placeholder="Search by location (e.g., München, Berlin, Frankfurt)..."
						class="input w-full rounded-xl border border-white/40 bg-white/10 px-4 py-3 text-white placeholder-white/60 backdrop-blur-sm transition-all duration-200 focus:border-blue-200 focus:bg-white/30"
						bind:value={stationSearchTerm}
						oninput={() => fetchStationSuggestions(stationSearchTerm, 'station')}
						onfocus={() => stationSuggestions.length > 0 && (showStationDropdown = true)}
						disabled={stationLoading}
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
									<div class="font-semibold text-gray-800">{suggestion.name}</div>
									{#if suggestion.id}
										<div class="text-xs text-gray-600">{suggestion.id}</div>
									{/if}
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Hidden country field (Germany only) -->
				<input type="hidden" name="country" value="DE" />

				<!-- Filters -->

				<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
					<label class="flex cursor-pointer items-center gap-3 rounded-lg bg-white/5 p-3">
						<input
							type="checkbox"
							bind:checked={showFavoritesOnly}
							class="checkbox checkbox-sm border-white/40"
						/>
						<span class="text-sm text-white">⭐ Favorites only</span>
					</label>

					<label class="flex cursor-pointer items-center gap-3 rounded-lg bg-white/5 p-3">
						<input
							type="checkbox"
							bind:checked={filterOpen24h}
							class="checkbox checkbox-sm border-white/40"
						/>
						<span class="text-sm text-white">🕐 Open 24/7</span>
					</label>

					<label class="flex cursor-pointer items-center gap-3 rounded-lg bg-white/5 p-3">
						<input
							type="checkbox"
							bind:checked={filterWarmSleep}
							class="checkbox checkbox-sm border-white/40"
						/>
						<span class="text-sm text-white">🔥 Warm sleeping spots</span>
					</label>

					<label class="flex cursor-pointer items-center gap-3 rounded-lg bg-white/5 p-3">
						<input
							type="checkbox"
							bind:checked={filterToiletsAtNight}
							class="checkbox checkbox-sm border-white/40"
						/>
						<span class="text-sm text-white">🚽 Toilets at night</span>
					</label>
				</div>

				<!-- Submit button -->
				<div class="flex">
					<button
						type="submit"
						class="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-400 via-teal-400 to-green-400 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-blue-300 hover:to-green-300 md:ml-auto md:w-auto"
						disabled={stationLoading}
					>
						<span class="text-lg">Search Stations</span>
						<FluentArrowRight24Regular class="h-6 w-6" />
					</button>
				</div>
			</form>
		</div>
	</div>

	<!-- Loading State -->
	{#if stationLoading}
		<div class="mb-8 flex justify-center py-8">
			<div
				class="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-6 py-3 backdrop-blur-md"
			>
				<span class="loading loading-ring loading-md"></span>
				<span class="font-medium text-white">Searching stations...</span>
			</div>
		</div>
	{/if}

	<!-- Search Results -->
	{#if !stationLoading || searchResults.length > 0}
		<div class="space-y-4">
			{#each searchResults as station (station.station_id)}
				<a
					href={`/station/${station.station_id}`}
					class="card group overflow-hidden border border-white/30 bg-white/10 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-white/50 hover:bg-white/20"
					style="view-transition-name: station-{station.station_id}"
				>
					<div class="card-body p-4">
						<div class="flex items-start gap-4">
							<!-- Station Icon -->
							<div class="flex-shrink-0" style="view-transition-name: icon-{station.station_id}">
								<div
									class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-teal-500 ring-4 ring-white/40 ring-offset-4 ring-offset-transparent transition-all duration-300 group-hover:ring-white/60"
								>
									<svg
										class="h-8 w-8 text-white"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
										/>
									</svg>
								</div>
							</div>

							<!-- Station Info -->
							<div class="flex-grow">
								<h3
									class="mb-1 text-lg font-bold text-white transition-colors duration-200 group-hover:text-blue-100"
								>
									{station.name}
								</h3>
								{#if station.city}
									<p
										class="text-sm text-white/70 transition-colors duration-200 group-hover:text-white/90"
									>
										{station.city}, Germany
									</p>
								{/if}

								<!-- Amenities Tags -->
								<div class="mt-3 flex flex-wrap gap-2">
									{#if station.has_warm_sleep}
										<span
											class="badge badge-sm border-orange-400/50 bg-orange-400/20 text-orange-100"
										>
											🔥 Warm Sleep
										</span>
									{/if}
									{#if station.has_outlets}
										<span
											class="badge badge-sm border-yellow-400/50 bg-yellow-400/20 text-yellow-100"
										>
											⚡ Outlets
										</span>
									{/if}
									{#if station.has_toilets}
										<span class="badge badge-sm border-blue-400/50 bg-blue-400/20 text-blue-100">
											🚽 Toilets
										</span>
									{/if}
									{#if station.is_open_24h}
										<span class="badge badge-sm border-green-400/50 bg-green-400/20 text-green-100">
											🕐 24/7 Open
										</span>
									{:else}
										<span class="badge badge-sm border-red-400/50 bg-red-400/20 text-red-100">
											🕐 Limited Hours
										</span>
									{/if}
								</div>
							</div>

							<!-- Arrow -->
							<div class="flex flex-shrink-0 items-center">
								<FluentArrowRight24Regular
									class="size-8 text-white/60 transition-all duration-300 group-hover:translate-x-2 group-hover:scale-110 group-hover:text-white"
								/>
							</div>
						</div>
					</div>
				</a>
			{/each}

			<!-- Empty State -->
			{#if showEmptyState}
				<div class="card border border-white/30 bg-white/10 backdrop-blur-md">
					<div class="card-body py-20 text-center">
						<div
							class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm"
						>
							<svg
								class="h-12 w-12 text-white/60"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
						</div>
						<h3 class="mb-3 text-2xl font-bold text-white">No stations found</h3>
						<p class="text-lg text-white/70">Try adjusting your search or filters</p>
					</div>
				</div>
			{/if}
		</div>
	{/if}
{/if}

<!-- Route Search Tab -->
{#if activeTab === 'routes'}
	<div class="card border border-white/30 bg-white/10 backdrop-blur-md">
		<div class="card-body p-4 md:p-6">
			<form onsubmit={handleRouteSearch} class="space-y-4 md:space-y-6">
				<!-- From Input -->
				<div class="relative">
					<input
						type="text"
						placeholder="From (e.g., München Hbf)"
						class="input w-full rounded-xl border border-white/40 bg-white/10 px-4 py-3 text-white placeholder-white/60 backdrop-blur-sm transition-all duration-200 focus:border-blue-200 focus:bg-white/30"
						bind:value={routeFrom}
						oninput={() => fetchStationSuggestions(routeFrom, 'from')}
						onfocus={() => fromSuggestions.length > 0 && (showFromDropdown = true)}
						disabled={routeLoading}
					/>

					<!-- From Autocomplete Dropdown -->
					{#if showFromDropdown && fromSuggestions.length > 0}
						<div
							class="absolute z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-white/40 bg-white/95 shadow-xl backdrop-blur-md"
						>
							{#each fromSuggestions as suggestion}
								<button
									type="button"
									class="block w-full px-4 py-3 text-left transition-colors hover:bg-blue-100"
									onclick={() => selectFromSuggestion(suggestion)}
								>
									<div class="font-semibold text-gray-800">{suggestion.name}</div>
									{#if suggestion.id}
										<div class="text-xs text-gray-600">{suggestion.id}</div>
									{/if}
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<!-- To Input -->
				<div class="relative">
					<input
						type="text"
						placeholder="To (e.g., Berlin Hbf)"
						class="input w-full rounded-xl border border-white/40 bg-white/10 px-4 py-3 text-white placeholder-white/60 backdrop-blur-sm transition-all duration-200 focus:border-blue-200 focus:bg-white/30"
						bind:value={routeTo}
						oninput={() => fetchStationSuggestions(routeTo, 'to')}
						onfocus={() => toSuggestions.length > 0 && (showToDropdown = true)}
						disabled={routeLoading}
					/>

					<!-- To Autocomplete Dropdown -->
					{#if showToDropdown && toSuggestions.length > 0}
						<div
							class="absolute z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-white/40 bg-white/95 shadow-xl backdrop-blur-md"
						>
							{#each toSuggestions as suggestion}
								<button
									type="button"
									class="block w-full px-4 py-3 text-left transition-colors hover:bg-blue-100"
									onclick={() => selectToSuggestion(suggestion)}
								>
									<div class="font-semibold text-gray-800">{suggestion.name}</div>
									{#if suggestion.id}
										<div class="text-xs text-gray-600">{suggestion.id}</div>
									{/if}
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Submit button -->
				<div class="flex">
					<button
						type="submit"
						class="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-400 via-teal-400 to-green-400 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-blue-300 hover:to-green-300 md:ml-auto md:w-auto"
						disabled={routeLoading || !routeFrom || !routeTo}
					>
						<span class="text-lg">Find Routes</span>
						<FluentArrowRight24Regular class="h-6 w-6" />
					</button>
				</div>
			</form>
		</div>
	</div>

	<!-- Route Loading State -->
	{#if routeLoading}
		<div class="mt-6 flex justify-center py-8">
			<div
				class="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-6 py-3 backdrop-blur-md"
			>
				<span class="loading loading-ring loading-md"></span>
				<span class="font-medium text-white">Finding routes...</span>
			</div>
		</div>
	{/if}

	<!-- Route Results -->
	{#if !routeLoading && routeResults.length > 0}
		<div class="mt-6 space-y-4">
			{#each routeResults as route, i}
				<div
					class="card border border-white/30 bg-white/10 backdrop-blur-md transition-all duration-300 hover:border-white/50 hover:bg-white/20"
				>
					<div class="card-body p-4">
						<div class="flex items-center justify-between">
							<div>
								<h3 class="text-lg font-bold text-white">Route {i + 1}</h3>
								<p class="text-sm text-white/70">
									{new Date(route.departure).toLocaleTimeString('de-DE', {
										hour: '2-digit',
										minute: '2-digit'
									})}
									→
									{new Date(route.arrival).toLocaleTimeString('de-DE', {
										hour: '2-digit',
										minute: '2-digit'
									})}
								</p>
							</div>
							<div class="text-right">
								<div class="text-sm font-semibold text-white">
									{Math.floor(route.duration / 60)}h {route.duration % 60}m
								</div>
								<div class="text-xs text-white/60">{route.changes || 0} changes</div>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else if !routeLoading && routeFrom && routeTo && routeResults.length === 0}
		<div class="card mt-6 border border-white/30 bg-white/10 backdrop-blur-md">
			<div class="card-body py-20 text-center">
				<h3 class="mb-3 text-2xl font-bold text-white">No routes found</h3>
				<p class="text-lg text-white/70">Try different station names</p>
			</div>
		</div>
	{/if}
{/if}
