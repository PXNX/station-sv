<!-- src/routes/station/[id]/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import FluentArrowLeft24Regular from '~icons/fluent/arrow-left-24-regular';
	import FluentEmojiBed from '~icons/fluent-emoji/bed';
	import FluentEmojiHighVoltage from '~icons/fluent-emoji/high-voltage';
	import FluentEmojiToilet from '~icons/fluent-emoji/toilet';
	import FluentEmojiTwelveOclock from '~icons/fluent-emoji/twelve-oclock';
	import FluentEmojiInformation from '~icons/fluent-emoji/information';
	import FluentEmojiWorldMap from '~icons/fluent-emoji/world-map';
	import FluentEmojiStar from '~icons/fluent-emoji/star';
	import FluentEmojiGlowingStar from '~icons/fluent-emoji/glowing-star';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	const { station, imageUrl, pdfUrl } = data;

	let isFavorite = $state(false);
	let imageLoaded = $state(false);
	let imageError = $state(false);

	// In-memory favorites storage (no localStorage)
	let favorites = $state<number[]>([]);

	function toggleFavorite() {
		const index = favorites.indexOf(station.station_id);

		if (index > -1) {
			favorites.splice(index, 1);
			isFavorite = false;
		} else {
			favorites.push(station.station_id);
			isFavorite = true;
		}
	}

	$effect(() => {
		isFavorite = favorites.includes(station.station_id);
	});

	function goBack() {
		goto('/');
	}

	function handleImageLoad() {
		imageLoaded = true;
		imageError = false;
	}

	function handleImageError() {
		imageError = true;
		imageLoaded = false;
	}
</script>

<svelte:head>
	<title>{station.name} - Station Details</title>
	<meta name="description" content="Details for {station.name} train station" />
	<meta name="view-transition" content="same-origin" />
</svelte:head>

<!-- Back Button -->
<button
	onclick={goBack}
	class="group mb-6 inline-flex items-center gap-2 text-white/80 transition-colors hover:text-white"
>
	<FluentArrowLeft24Regular class="h-5 w-5 transition-transform group-hover:-translate-x-1" />
	<span>Back</span>
</button>

<!-- Station Header with Image -->
<div class="mb-8" style="view-transition-name: station-{station.station_id}">
	<div class="mb-4 flex items-start justify-between gap-4">
		<div>
			<h1 class="mb-2 text-3xl font-bold text-white">
				{station.name}
			</h1>
			{#if station.city}
				<p class="text-lg text-white/70">
					{station.city}, {station.country}
				</p>
			{/if}
		</div>
		<button
			onclick={toggleFavorite}
			class="flex-shrink-0 rounded-lg p-2 transition-colors hover:bg-white/10"
			aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
		>
			{#if isFavorite}
				<FluentEmojiGlowingStar class="h-8 w-8" />
			{:else}
				<FluentEmojiStar class="h-8 w-8" />
			{/if}
		</button>
	</div>

	<!-- Station Image -->
	{#if imageUrl}
		<div
			class="relative overflow-hidden rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm"
		>
			{#if !imageLoaded && !imageError}
				<div class="flex h-64 items-center justify-center">
					<div class="text-white/50">Loading image...</div>
				</div>
			{/if}

			{#if !imageError}
				<img
					src={imageUrl}
					alt="{station.name} station"
					class="h-auto max-h-96 w-full object-cover"
					class:hidden={!imageLoaded}
					onload={handleImageLoad}
					onerror={handleImageError}
				/>
			{:else}
				<div class="flex h-48 items-center justify-center">
					<div class="text-center text-white/50">
						<p>Station image not available</p>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<!-- Amenities Grid -->
<div class="mb-6 grid gap-4 sm:grid-cols-2">
	<!-- Sleeping -->
	<div class="rounded-lg border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
		<div class="mb-3 flex items-center gap-2">
			<FluentEmojiBed class="h-5 w-5" />
			<h2 class="font-semibold text-white">Sleeping</h2>
		</div>
		<div class="mb-2 flex items-center justify-between text-sm">
			<span class="text-white/70">Warm area:</span>
			<span class={station.has_warm_sleep ? 'text-green-300' : 'text-red-300'}>
				{station.has_warm_sleep ? 'Yes' : 'No'}
			</span>
		</div>
		{#if station.sleep_notes}
			<p class="text-sm text-white/60">{station.sleep_notes}</p>
		{/if}
	</div>

	<!-- Outlets -->
	<div class="rounded-lg border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
		<div class="mb-3 flex items-center gap-2">
			<FluentEmojiHighVoltage class="h-5 w-5" />
			<h2 class="font-semibold text-white">Power Outlets</h2>
		</div>
		<div class="mb-2 flex items-center justify-between text-sm">
			<span class="text-white/70">Available:</span>
			<span class={station.has_outlets ? 'text-green-300' : 'text-red-300'}>
				{station.has_outlets ? 'Yes' : 'No'}
			</span>
		</div>
		{#if station.outlet_notes}
			<p class="text-sm text-white/60">{station.outlet_notes}</p>
		{/if}
	</div>

	<!-- Toilets -->
	<div class="rounded-lg border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
		<div class="mb-3 flex items-center gap-2">
			<FluentEmojiToilet class="h-5 w-5" />
			<h2 class="font-semibold text-white">Toilets</h2>
		</div>
		<div class="mb-2 flex items-center justify-between text-sm">
			<span class="text-white/70">Available:</span>
			<span class={station.has_toilets ? 'text-green-300' : 'text-red-300'}>
				{station.has_toilets ? 'Yes' : 'No'}
			</span>
		</div>
		{#if station.toilet_notes}
			<p class="text-sm text-white/60">{station.toilet_notes}</p>
		{/if}
	</div>

	<!-- Opening Hours -->
	<div class="rounded-lg border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
		<div class="mb-3 flex items-center gap-2">
			<FluentEmojiTwelveOclock class="h-5 w-5" />
			<h2 class="font-semibold text-white">Opening Hours</h2>
		</div>
		<div class="mb-2 flex items-center justify-between text-sm">
			<span class="text-white/70">24/7 Access:</span>
			<span class={station.is_open_24h ? 'text-green-300' : 'text-red-300'}>
				{station.is_open_24h ? 'Yes' : 'No'}
			</span>
		</div>
		{#if station.opening_hours}
			<p class="text-sm text-white/60">{station.opening_hours}</p>
		{/if}
	</div>
</div>

<!-- Additional Information -->
{#if station.additional_info}
	<div class="mb-6 rounded-lg border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
		<div class="mb-3 flex items-center gap-2">
			<FluentEmojiInformation class="h-5 w-5" />
			<h2 class="font-semibold text-white">Additional Information</h2>
		</div>
		<p class="text-sm whitespace-pre-wrap text-white/70">{station.additional_info}</p>
	</div>
{/if}

<!-- Action Links -->
<div class="flex flex-col gap-3 sm:flex-row">
	<a
		href={pdfUrl}
		target="_blank"
		rel="noopener noreferrer"
		class="flex items-center justify-center gap-2 rounded-lg bg-blue-500/20 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500/30"
	>
		<FluentEmojiWorldMap class="h-5 w-5" />
		Station Map
	</a>

	{#if station.latitude && station.longitude}
		<a
			href={`https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}`}
			target="_blank"
			rel="noopener noreferrer"
			class="flex items-center justify-center gap-2 rounded-lg bg-green-500/20 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-green-500/30"
		>
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
			Google Maps
		</a>

		<a
			href={`https://www.openstreetmap.org/?mlat=${station.latitude}&mlon=${station.longitude}&zoom=17`}
			target="_blank"
			rel="noopener noreferrer"
			class="flex items-center justify-center gap-2 rounded-lg bg-orange-500/20 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-orange-500/30"
		>
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
				/>
			</svg>
			OpenStreetMap
		</a>
	{/if}
</div>
