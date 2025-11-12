<!-- src/routes/station/[id]/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import FluentArrowLeft24Regular from '~icons/fluent/arrow-left-24-regular';
	import FluentEdit24Regular from '~icons/fluent/edit-24-regular';
	import FluentEmojiBed from '~icons/fluent-emoji/bed';
	import FluentEmojiHighVoltage from '~icons/fluent-emoji/high-voltage';
	import FluentEmojiToilet from '~icons/fluent-emoji/toilet';
	import FluentEmojiTwelveOclock from '~icons/fluent-emoji/twelve-oclock';
	import FluentEmojiInformation from '~icons/fluent-emoji/information';
	import FluentEmojiSatelliteAntenna from '~icons/fluent-emoji/satellite-antenna';
	import FluentEmojiWorldMap from '~icons/fluent-emoji/world-map';
	import FluentEmojiStar from '~icons/fluent-emoji/star';
	import FluentEmojiGlowingStar from '~icons/fluent-emoji/glowing-star';
	import FluentEmojiCamera from '~icons/fluent-emoji/camera';
	import FluentLocation24Regular from '~icons/fluent/location-24-regular';
	import FluentMap24Regular from '~icons/fluent/map-24-regular';
	import FluentChevronRight24Regular from '~icons/fluent/chevron-right-24-regular';
	import FluentChevronLeft24Regular from '~icons/fluent/chevron-left-24-regular';

	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	const { station, photos, photoBaseUrl, imageUrl, pdfUrl } = data;

	let isFavorite = $state(false);
	let selectedPhotoIndex = $state(0);

	// In-memory favorites storage
	let favorites = $state<number[]>([]);

	// Helper function to get status color class
	function getStatusColor(value: boolean | null | undefined): string {
		if (value === null || value === undefined) return 'text-blue-400';
		return value ? 'text-green-300' : 'text-red-300';
	}

	// Helper function to get status text
	function getStatusText(value: boolean | null | undefined): string {
		if (value === null || value === undefined) return 'Unknown';
		return value ? 'Yes' : 'No';
	}

	// Check if any field is unknown
	const hasUnknownFields = $derived(
		station.has_warm_sleep === null ||
			station.has_warm_sleep === undefined ||
			station.has_outlets === null ||
			station.has_outlets === undefined ||
			station.has_toilets === null ||
			station.has_toilets === undefined ||
			station.toilets_open_at_night === null ||
			station.toilets_open_at_night === undefined ||
			station.is_open_24h === null ||
			station.is_open_24h === undefined ||
			station.has_wifi === null ||
			station.has_wifi === undefined
	);

	function toggleFavorite() {
		const index = favorites.indexOf(station.eva);

		if (index > -1) {
			favorites.splice(index, 1);
			isFavorite = false;
		} else {
			favorites.push(station.eva);
			isFavorite = true;
		}
	}

	$effect(() => {
		isFavorite = favorites.includes(station.eva);
	});

	function goBack() {
		goto('/');
	}

	function goToEdit() {
		goto(`/station/${station.eva}/edit`);
	}

	function nextPhoto() {
		if (photos && photos.length > 0) {
			selectedPhotoIndex = (selectedPhotoIndex + 1) % photos.length;
		}
	}

	function prevPhoto() {
		if (photos && photos.length > 0) {
			selectedPhotoIndex = (selectedPhotoIndex - 1 + photos.length) % photos.length;
		}
	}
</script>

<svelte:head>
	<title>{station.name} - Station Details</title>
	<meta name="description" content="Details for {station.name} train station" />
	<meta name="view-transition" content="same-origin" />
</svelte:head>

<!-- Navigation Buttons -->
<div class="mb-6 flex items-center justify-between gap-4">
	<button
		onclick={goBack}
		class="group inline-flex items-center gap-2 text-white/80 transition-colors hover:text-white"
	>
		<FluentArrowLeft24Regular class="size-5 transition-transform group-hover:-translate-x-1" />
		<span>Back</span>
	</button>

	<button
		onclick={goToEdit}
		class="inline-flex items-center gap-2 rounded-lg bg-blue-500/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500/30"
	>
		<FluentEdit24Regular class="size-5" />
		<span>Edit Details</span>
	</button>
</div>

<!-- Station Header -->
<div class="mb-8" style="view-transition-name: station-{station.eva}">
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
			class="shrink-0 rounded-lg p-2 transition-colors hover:bg-white/10"
			aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
		>
			{#if isFavorite}
				<FluentEmojiGlowingStar class="size-8" />
			{:else}
				<FluentEmojiStar class="size-8" />
			{/if}
		</button>
	</div>

	<!-- Community Photos -->
	{#if photos && photos.length > 0}
		<div class="mb-4">
			<!-- Main Photo Display -->
			<div
				class="relative overflow-hidden rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm"
			>
				<img
					src="{photoBaseUrl}{photos[selectedPhotoIndex].path}"
					alt="Station photo by {photos[selectedPhotoIndex].photographer}"
					class="h-80 w-full object-cover"
				/>

				<!-- Photo Navigation Arrows -->
				{#if photos.length > 1}
					<button
						onclick={prevPhoto}
						class="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/70"
						aria-label="Previous photo"
					>
						<FluentChevronLeft24Regular class="h-6 w-6" />
					</button>
					<button
						onclick={nextPhoto}
						class="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/70"
						aria-label="Next photo"
					>
						<FluentChevronRight24Regular class="h-6 w-6" />
					</button>
				{/if}

				<!-- Photo Info -->
				<div
					class="absolute right-0 bottom-0 left-0 bg-linear-to-t from-black/80 to-transparent p-4"
				>
					<p class="flex items-center gap-2 text-sm text-white/90">
						<FluentEmojiCamera class="h-4 w-4" />
						<span>Photo by {photos[selectedPhotoIndex].photographer}</span>
					</p>
					{#if photos[selectedPhotoIndex].createdAt}
						<p class="text-xs text-white/60">
							{(() => {
								const date = new Date(photos[selectedPhotoIndex].createdAt);
								const day = String(date.getDate()).padStart(2, '0');
								const month = String(date.getMonth() + 1).padStart(2, '0');
								const year = date.getFullYear();
								return `${day}.${month}.${year}`;
							})()}
						</p>
					{/if}
				</div>
			</div>
		</div>
	{:else}
		<!-- Fallback message when no photos available -->
		<div class="mb-4 rounded-lg border border-white/20 bg-white/5 p-8 text-center backdrop-blur-sm">
			<FluentEmojiCamera class="mx-auto mb-3 h-12 w-12 opacity-50" />
			<p class="text-white/60">No photos available for this station yet</p>
			<p class="mt-1 text-sm text-white/40">
				Be the first to <a
					href="https://map.railway-stations.org/upload.php?countryCode={station.country.toLowerCase()}&stationId=Z{station.station_id_ger}"
					class="text-blue-500">contribute</a
				> a photo!
			</p>
		</div>
	{/if}
</div>

<!-- Help Hint for Unknown Fields -->
{#if hasUnknownFields}
	<div class="mb-6 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 backdrop-blur-sm">
		<div class="flex items-start gap-3">
			<FluentEmojiInformation class="mt-0.5 size-5 shrink-0" />
			<div>
				<p class="text-sm text-white/80">
					<strong>Missing information?</strong> Help improve this station's data by clicking the
					<strong>Edit Details</strong> button above to add any unknown information.
				</p>
			</div>
		</div>
	</div>
{/if}

<!-- Amenities Grid -->
<div class="mb-6 grid gap-4 sm:grid-cols-2">
	<!-- Sleeping -->
	<div class="rounded-lg border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
		<div class="mb-3 flex items-center gap-2">
			<FluentEmojiBed class="size-5" />
			<h2 class="font-semibold text-white">Sleeping</h2>
		</div>
		<div class="mb-2 flex items-center justify-between text-sm">
			<span class="text-white/70">Warm area:</span>
			<span class={getStatusColor(station.has_warm_sleep)}>
				{getStatusText(station.has_warm_sleep)}
			</span>
		</div>
		{#if station.sleep_notes}
			<p class="text-sm text-white/60">{station.sleep_notes}</p>
		{/if}
	</div>

	<!-- Outlets -->
	<div class="rounded-lg border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
		<div class="mb-3 flex items-center gap-2">
			<FluentEmojiHighVoltage class="size-5" />
			<h2 class="font-semibold text-white">Power Outlets</h2>
		</div>
		<div class="mb-2 flex items-center justify-between text-sm">
			<span class="text-white/70">Available:</span>
			<span class={getStatusColor(station.has_outlets)}>
				{getStatusText(station.has_outlets)}
			</span>
		</div>
		{#if station.outlet_notes}
			<p class="text-sm text-white/60">{station.outlet_notes}</p>
		{/if}
	</div>

	<!-- Toilets -->
	<div class="rounded-lg border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
		<div class="mb-3 flex items-center gap-2">
			<FluentEmojiToilet class="size-5" />
			<h2 class="font-semibold text-white">Toilets</h2>
		</div>
		<div class="mb-2 flex items-center justify-between text-sm">
			<span class="text-white/70">Available:</span>
			<span class={getStatusColor(station.has_toilets)}>
				{getStatusText(station.has_toilets)}
			</span>
		</div>
		<div class="mb-2 flex items-center justify-between text-sm">
			<span class="text-white/70">Open at night:</span>
			<span class={getStatusColor(station.toilets_open_at_night)}>
				{getStatusText(station.toilets_open_at_night)}
			</span>
		</div>
		{#if station.toilet_notes}
			<p class="text-sm text-white/60">{station.toilet_notes}</p>
		{/if}
	</div>

	<!-- Opening Hours -->
	<div class="rounded-lg border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
		<div class="mb-3 flex items-center gap-2">
			<FluentEmojiTwelveOclock class="size-5" />
			<h2 class="font-semibold text-white">Opening Hours</h2>
		</div>
		<div class="mb-2 flex items-center justify-between text-sm">
			<span class="text-white/70">24/7 Access:</span>
			<span class={getStatusColor(station.is_open_24h)}>
				{getStatusText(station.is_open_24h)}
			</span>
		</div>
		{#if station.opening_hours}
			<p class="text-sm text-white/60">{station.opening_hours}</p>
		{/if}
	</div>

	<!-- WiFi -->
	<div class="rounded-lg border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
		<div class="mb-3 flex items-center gap-2">
			<FluentEmojiSatelliteAntenna class="size-5" />
			<h2 class="font-semibold text-white">WiFi Hotspot</h2>
		</div>
		<div class="mb-2 flex items-center justify-between text-sm">
			<span class="text-white/70">Available:</span>
			<span class={getStatusColor(station.has_wifi)}>
				{getStatusText(station.has_wifi)}
			</span>
		</div>
		{#if station.has_wifi}
			<div class="flex items-center justify-between text-sm">
				<span class="text-white/70">Limited data:</span>
				<span class={getStatusColor(station.wifi_has_limit)}>
					{getStatusText(station.wifi_has_limit)}
				</span>
			</div>
		{/if}
		{#if station.wifi_notes}
			<p class="text-sm text-white/60">{station.wifi_notes}</p>
		{/if}
	</div>
</div>

<!-- Additional Information -->
{#if station.additional_info}
	<div class="mb-6 rounded-lg border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
		<div class="mb-3 flex items-center gap-2">
			<FluentEmojiInformation class="size-5" />
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
		<FluentEmojiWorldMap class="size-5" />
		Location and platform plan (PDF)
	</a>

	<!-- todo: add link to bahnhof.de map for the currently selected station-->

	{#if station.latitude && station.longitude}
		<a
			href={`https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}`}
			target="_blank"
			rel="noopener noreferrer"
			class="flex items-center justify-center gap-2 rounded-lg bg-green-500/20 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-green-500/30"
		>
			<FluentLocation24Regular class="size-5" />
			Google Maps
		</a>

		<a
			href={`https://www.openstreetmap.org/?mlat=${station.latitude}&mlon=${station.longitude}&zoom=17`}
			target="_blank"
			rel="noopener noreferrer"
			class="flex items-center justify-center gap-2 rounded-lg bg-orange-500/20 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-orange-500/30"
		>
			<FluentMap24Regular class="size-5" />
			OpenStreetMap
		</a>
	{/if}
</div>
