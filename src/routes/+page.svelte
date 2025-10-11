<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
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
	import FluentLocation24Regular from '~icons/fluent/location-24-regular';
	import type { PageData, ActionData } from './$types';
	import type { StationResult } from '$lib/types';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	// Station search state
	let stationSearchTerm = $state($page.url.searchParams.get('name') || '');
	let searchResults: StationResult[] = $state(data.stations || []);
	let stationLoading = $state(false);

	// Station filters - initialize from URL params
	let showFavoritesOnly = $state(false);
	let filterOpen24h = $state($page.url.searchParams.get('open24h') === 'true');
	let filterWarmSleep = $state($page.url.searchParams.get('warmSleep') === 'true');
	let filterOutletAvailable = $state($page.url.searchParams.get('outlets') === 'true');
	let filterToiletsAtNight = $state($page.url.searchParams.get('toiletsAtNight') === 'true');

	// Autocomplete state
	let stationSuggestions = $state<any[]>([]);
	let showStationDropdown = $state(false);
	let suggestionLoading = $state(false);

	// Update search results when form response comes back
	$effect(() => {
		if (form?.stations) {
			searchResults = form.stations;
		}
	});

	// Update search results when page data changes
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
	}

	// Close dropdown when clicking outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.autocomplete-container')) {
			showStationDropdown = false;
		}
	}

	const showEmptyState = $derived(
		!stationLoading && searchResults.length === 0 && stationSearchTerm.length >= 2
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
	<div class="mb-4 flex justify-center">
		<FluentEmojiStation class="h-16 w-16" />
	</div>
	<h1 class="text-3xl font-bold text-white">Train Station Search</h1>
	<p class="mt-2 text-white/70">Find stations with sleeping spots, outlets & facilities</p>
</header>

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
									<FluentLocation24Regular class="h-4 w-4" />
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
			<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
				<label class="flex cursor-pointer items-center gap-3 rounded-lg bg-white/5 p-3">
					<input
						type="checkbox"
						name="open24h"
						bind:checked={filterOpen24h}
						class="checkbox checkbox-sm border-white/40"
					/>
					<FluentEmojiTwelveOclock class="h-5 w-5" />
					<span class="text-sm text-white">Open 24/7</span>
				</label>

				<label class="flex cursor-pointer items-center gap-3 rounded-lg bg-white/5 p-3">
					<input
						type="checkbox"
						name="outlets"
						bind:checked={filterOutletAvailable}
						class="checkbox checkbox-sm border-white/40"
					/>
					<FluentEmojiHighVoltage class="h-5 w-5" />
					<span class="text-sm text-white">Outlet available</span>
				</label>

				<label class="flex cursor-pointer items-center gap-3 rounded-lg bg-white/5 p-3">
					<input
						type="checkbox"
						name="warmSleep"
						bind:checked={filterWarmSleep}
						class="checkbox checkbox-sm border-white/40"
					/>
					<FluentEmojiFire class="h-5 w-5" />
					<span class="text-sm text-white">Warm sleeping spots</span>
				</label>

				<label class="flex cursor-pointer items-center gap-3 rounded-lg bg-white/5 p-3">
					<input
						type="checkbox"
						name="toiletsAtNight"
						bind:checked={filterToiletsAtNight}
						class="checkbox checkbox-sm border-white/40"
					/>
					<FluentEmojiCrescentMoon class="h-5 w-5" />
					<span class="text-sm text-white">Toilets at night</span>
				</label>
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
					<FluentArrowRight24Regular class="h-5 w-5" />
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

<!-- Error Message -->
{#if form?.error}
	<div class="alert alert-warning mb-4">
		<span>{form.error}</span>
	</div>
{/if}

<!-- Search Results -->
{#if !stationLoading && searchResults.length > 0}
	<div class="mb-4">
		<p class="text-sm text-white/70">Found {searchResults.length} station(s)</p>
	</div>
{/if}

{$inspect(searchResults)}

<!--  Station Card section -->
{#if searchResults.length > 0}
	<div class="space-y-4">
		{#each searchResults as station (station.eva)}
			<a
				href={`/station/${station.eva}`}
				class="card group overflow-hidden border border-white/30 bg-white/10 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-white/50 hover:bg-white/20"
				style="view-transition-name: station-{station.eva}"
			>
				<div class="card-body p-0">
					<div class="flex flex-1 items-start gap-4 p-4">
						<div class="flex-shrink-0" style="view-transition-name: icon-{station.eva}">
							<div
								class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-teal-500 transition-all duration-300"
							>
								{#if station.photoUrl}
									<img
										src={station.photoUrl}
										alt={station.name}
										class="h-full w-full rounded-2xl object-cover transition-transform duration-300 group-hover:scale-110"
										style="view-transition-name: photo-{station.eva}"
									/>
								{:else}
									<FluentEmojiStation class="h-10 w-10" />
								{/if}
							</div>
						</div>

						<!-- Station Info -->
						<div class="flex-grow">
							<h3
								class="mb-1 text-lg font-bold text-white transition-colors duration-200 group-hover:text-blue-100"
							>
								{station.name}
							</h3>
							<div
								class="text-sm text-white/70 transition-colors duration-200 group-hover:text-white/90"
							>
								#{station.eva} ·

								{#if station.city}
									<span>{station.city}, </span>
								{/if}
								{station.country.toUpperCase()}
							</div>

							<!-- Amenities Tags -->
							<div class="mt-3 flex flex-wrap gap-2">
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

								{#if station.toilets_open_at_night}
									<span
										class="badge badge-sm flex items-center gap-1 border-blue-300/50 bg-blue-300/20 text-blue-100"
									>
										<FluentEmojiCrescentMoon class="h-3 w-3" />
										Night Toilets
									</span>
								{/if}
								{#if station.is_open_24h}
									<span
										class="badge badge-sm flex items-center gap-1 border-green-400/50 bg-green-400/20 text-green-100"
									>
										<FluentEmojiGreenCircle class="h-3 w-3" />
										24/7 Open
									</span>
								{:else}
									<span
										class="badge badge-sm flex items-center gap-1 border-red-400/50 bg-red-400/20 text-red-100"
									>
										<FluentEmojiRedCircle class="h-3 w-3" />
										Limited Hours
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
	</div>
{/if}

<!-- Empty State -->
{#if showEmptyState}
	<div class="card border border-white/30 bg-white/10 backdrop-blur-md">
		<div class="card-body items-center justify-center gap-y-4 py-20">
			<FluentEmojiFaceWithRaisedEyebrow class="h-16 w-16" />
			<h3 class="text-2xl font-bold text-white">No stations found</h3>
			<p class="text-center text-lg text-white/70">
				Try adjusting your search or filters. Make sure to enter at least 2 characters.
			</p>
		</div>
	</div>
{/if}
