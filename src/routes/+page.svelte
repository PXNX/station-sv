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

	const COUNTRY_OPTIONS = [
		{ value: 'DE', label: 'Germany' },
		{ value: 'AT', label: 'Austria' },
		{ value: 'CH', label: 'Switzerland' },
		{ value: 'FR', label: 'France' },
		{ value: 'IT', label: 'Italy' }
	];

	let { data, form }: Props = $props();

	let searchTerm = $state($page.url.searchParams.get('name') || '');
	let selectedCountry = $state($page.url.searchParams.get('country') || '');
	let searchResults: Station[] = $state(data.stations || []);
	let loading = $state(false);

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

	function handleFormSubmit() {
		loading = true;
		return async ({ update }) => {
			await update({ reset: false });
			loading = false;
		};
	}

	const showEmptyState = $derived(
		!loading && searchResults.length === 0 && (searchTerm || selectedCountry)
	);
</script>

<svelte:head>
	<title>Train Station Search</title>
	<meta
		name="description"
		content="Search for train stations and find information about sleeping, outlets, toilets, and more"
	/>
	<meta name="view-transition" content="same-origin" />
</svelte:head>

<!-- Header -->
<header class="mb-10 text-center">
	<h1 class="mb-4 text-2xl font-bold text-white">Train Station Search</h1>
	<p class="text-lg text-white/80">Find sleeping spots, outlets, toilets & station info</p>
</header>

<!-- Search Form -->
<div class="card mb-6 border border-white/30 bg-white/10 backdrop-blur-md">
	<div class="card-body p-4 md:p-6">
		<form
			method="POST"
			action="?/search"
			use:enhance={handleFormSubmit}
			class="space-y-4 md:space-y-6"
		>
			<!-- Station Name Input -->
			<input
				id="station-name"
				type="text"
				name="name"
				placeholder="Search stations (e.g., München Hbf, Berlin)..."
				class="input w-full rounded-xl border border-white/40 bg-white/10 px-4 py-3 text-white placeholder-white/60 backdrop-blur-sm transition-all duration-200 focus:border-blue-200 focus:bg-white/30"
				bind:value={searchTerm}
				disabled={loading}
			/>

			<!-- Country Select -->
			<select
				id="country-select"
				name="country"
				class="select w-full rounded-xl border border-white/40 bg-white/10 px-4 py-3 text-white backdrop-blur-sm transition-all duration-200 focus:border-blue-200 focus:bg-white/30"
				bind:value={selectedCountry}
				disabled={loading}
			>
				<option value="" class="bg-white/10 text-white">🌍 All Countries</option>
				{#each COUNTRY_OPTIONS as option}
					<option value={option.value} class="bg-white/10 text-white">
						{option.label}
					</option>
				{/each}
			</select>

			<!-- Submit button -->
			<div class="flex">
				<button
					type="submit"
					class="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-400 via-teal-400 to-green-400 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-blue-300 hover:to-green-300 md:ml-auto md:w-auto"
					disabled={loading}
				>
					<span class="text-lg">Search Stations</span>
					<FluentArrowRight24Regular class="h-6 w-6" />
				</button>
			</div>
		</form>
	</div>
</div>

<!-- Loading State -->
{#if loading}
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
{#if !loading || searchResults.length > 0}
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
									{station.city}, {station.country}
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
					<p class="text-lg text-white/70">
						Try adjusting your search criteria or explore different countries
					</p>
				</div>
			</div>
		{/if}
	</div>
{/if}
