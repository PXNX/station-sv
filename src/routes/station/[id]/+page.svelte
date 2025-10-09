<!-- src/routes/station/[id]/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import FluentArrowLeft24Regular from '~icons/fluent/arrow-left-24-regular';
	import type { PageData } from '$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	const { station } = data;

	function goBack() {
		goto('/');
	}

	function getStationMapUrl(stationId: number): string {
		return `https://www.bahnhof.de/downloads/station-plans/${stationId}.pdf`;
	}
</script>

<svelte:head>
	<title>{station.name} - Station Details</title>
	<meta name="description" content="Details for {station.name} train station" />
	<meta name="view-transition" content="same-origin" />
</svelte:head>

<!-- Back Button -->
<div class="mb-8">
	<button
		onclick={goBack}
		class="group inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-white backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-white/50 hover:bg-white/20"
	>
		<FluentArrowLeft24Regular
			class="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-1"
		/>
		<span class="font-semibold">Back to Search</span>
	</button>
</div>

<!-- Station Header Card -->
<div
	class="card mb-8 overflow-hidden border border-white/30 bg-white/10 backdrop-blur-md"
	style="view-transition-name: station-{station.station_id}"
>
	<div class="card-body p-8">
		<div class="flex flex-col items-center gap-6 text-center">
			<!-- Station Icon -->
			<div class="flex-shrink-0" style="view-transition-name: icon-{station.station_id}">
				<div
					class="flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-400 to-teal-500 ring-4 ring-white/40 ring-offset-4 ring-offset-transparent"
				>
					<svg class="h-16 w-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
			<div class="space-y-4">
				<h1
					class="bg-gradient-to-r from-white via-blue-100 to-teal-100 bg-clip-text text-4xl font-bold text-white"
				>
					{station.name}
				</h1>
				{#if station.city}
					<p class="text-xl text-white/80">
						{station.city}, {station.country}
					</p>
				{/if}
			</div>
		</div>
	</div>
	<!-- Gradient overlay -->
	<div
		class="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-500/10 to-teal-500/10 opacity-50"
	></div>
</div>

<!-- Amenities Grid -->
<div class="mb-8 grid gap-4 md:grid-cols-2">
	<!-- Sleeping Information -->
	<div class="card border border-white/30 bg-white/10 backdrop-blur-md">
		<div class="card-body p-6">
			<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-white">
				<span class="text-2xl">🛏️</span>
				Sleeping
			</h2>
			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<span class="text-white/80">Warm sleeping area:</span>
					<span class="font-semibold {station.has_warm_sleep ? 'text-green-300' : 'text-red-300'}">
						{station.has_warm_sleep ? 'Yes' : 'No'}
					</span>
				</div>
				{#if station.sleep_notes}
					<p class="rounded-lg bg-white/10 p-3 text-sm text-white/90">
						{station.sleep_notes}
					</p>
				{/if}
			</div>
		</div>
	</div>

	<!-- Outlets -->
	<div class="card border border-white/30 bg-white/10 backdrop-blur-md">
		<div class="card-body p-6">
			<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-white">
				<span class="text-2xl">⚡</span>
				Power Outlets
			</h2>
			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<span class="text-white/80">Available:</span>
					<span class="font-semibold {station.has_outlets ? 'text-green-300' : 'text-red-300'}">
						{station.has_outlets ? 'Yes' : 'No'}
					</span>
				</div>
				{#if station.outlet_notes}
					<p class="rounded-lg bg-white/10 p-3 text-sm text-white/90">
						{station.outlet_notes}
					</p>
				{/if}
			</div>
		</div>
	</div>

	<!-- Toilets -->
	<div class="card border border-white/30 bg-white/10 backdrop-blur-md">
		<div class="card-body p-6">
			<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-white">
				<span class="text-2xl">🚽</span>
				Toilets
			</h2>
			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<span class="text-white/80">Available:</span>
					<span class="font-semibold {station.has_toilets ? 'text-green-300' : 'text-red-300'}">
						{station.has_toilets ? 'Yes' : 'No'}
					</span>
				</div>
				{#if station.toilet_notes}
					<p class="rounded-lg bg-white/10 p-3 text-sm text-white/90">
						{station.toilet_notes}
					</p>
				{/if}
			</div>
		</div>
	</div>

	<!-- Opening Hours -->
	<div class="card border border-white/30 bg-white/10 backdrop-blur-md">
		<div class="card-body p-6">
			<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-white">
				<span class="text-2xl">🕐</span>
				Opening Hours
			</h2>
			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<span class="text-white/80">24/7 Access:</span>
					<span class="font-semibold {station.is_open_24h ? 'text-green-300' : 'text-red-300'}">
						{station.is_open_24h ? 'Yes' : 'No'}
					</span>
				</div>
				{#if station.opening_hours}
					<p class="rounded-lg bg-white/10 p-3 text-sm text-white/90">
						{station.opening_hours}
					</p>
				{/if}
			</div>
		</div>
	</div>
</div>

<!-- Additional Information -->
{#if station.additional_info}
	<div class="card mb-8 border border-white/30 bg-white/10 backdrop-blur-md">
		<div class="card-body p-6">
			<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-white">
				<span class="text-2xl">ℹ️</span>
				Additional Information
			</h2>
			<p class="whitespace-pre-wrap text-white/90">{station.additional_info}</p>
		</div>
	</div>
{/if}

<!-- Action Buttons -->
<div class="space-y-4">
	<!-- Download Station Map -->
	<a
		href={getStationMapUrl(station.station_id)}
		target="_blank"
		rel="noopener noreferrer"
		class="btn btn-lg w-full border-none bg-gradient-to-r from-blue-500 to-teal-600 text-white transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:to-teal-700"
	>
		<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
			/>
		</svg>
		Download Station Map (PDF)
	</a>

	<!-- Google Maps Link -->
	{#if station.latitude && station.longitude}
		<a
			href={`https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}`}
			target="_blank"
			rel="noopener noreferrer"
			class="btn btn-lg w-full border-none bg-gradient-to-r from-green-500 to-emerald-600 text-white transition-all duration-300 hover:scale-105 hover:from-green-600 hover:to-emerald-700"
		>
			<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
				/>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
				/>
			</svg>
			Open in Google Maps
		</a>
	{/if}
</div>
