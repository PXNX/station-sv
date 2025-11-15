<!-- src/routes/station/[id]/+page.svelte -->
<script lang="ts">
	import { browser } from '$app/environment';

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
	import BackButton from '$lib/components/BackButton.svelte';
	import OptimizedLocationImage from '$lib/components/OptimizedLocationImage.svelte';

	import type { PageData } from './$types';
	import { getCategoryStyles } from '$lib/client/categories';
	import { formatDate } from '$lib/utils/format';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	const { station, photos, photoBaseUrl, pdfUrl } = data;

	const FAVORITES_KEY = 'station_favorites';

	let isFavorite = $state(false);
	let selectedPhotoIndex = $state(0);
	let isImageLoading = $state(true);
	let imageError = $state(false);

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

	function loadFavorites() {
		if (!browser) return;
		try {
			const stored = localStorage.getItem(FAVORITES_KEY);
			if (stored) {
				favorites = JSON.parse(stored);
			}
		} catch (error) {
			console.error('Failed to load favorites:', error);
			favorites = [];
		}
	}

	function saveFavorites() {
		if (!browser) return;
		try {
			localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
		} catch (error) {
			console.error('Failed to save favorites:', error);
		}
	}

	function toggleFavorite() {
		const index = favorites.indexOf(station.eva);

		if (index > -1) {
			favorites.splice(index, 1);
			isFavorite = false;
		} else {
			favorites.push(station.eva);
			isFavorite = true;
		}
		saveFavorites();
	}

	$effect(() => {
		loadFavorites();
		isFavorite = favorites.includes(station.eva);
	});

	function nextPhoto() {
		if (photos && photos.length > 0) {
			isImageLoading = true;
			imageError = false;
			selectedPhotoIndex = (selectedPhotoIndex + 1) % photos.length;
		}
	}

	function prevPhoto() {
		if (photos && photos.length > 0) {
			isImageLoading = true;
			imageError = false;
			selectedPhotoIndex = (selectedPhotoIndex - 1 + photos.length) % photos.length;
		}
	}

	function handleImageLoad() {
		isImageLoading = false;
		imageError = false;
	}

	function handleImageError() {
		isImageLoading = false;
		imageError = true;
	}

	// Reset loading state when photo changes
	$effect(() => {
		if (photos && photos.length > 0) {
			isImageLoading = true;
			imageError = false;
		}
		// Track selectedPhotoIndex to trigger effect
		void selectedPhotoIndex;
	});

	const categoryBadge = $derived.by(() => getCategoryStyles(station.category));
</script>

<svelte:head>
	<title>{station.name} - Station Details</title>
	<meta name="description" content="Details for {station.name} train station" />
	<meta name="view-transition" content="same-origin" />
</svelte:head>

<!-- Navigation Buttons -->
<div class="mb-6 flex items-center justify-between gap-4">
	<BackButton href="/" label="Back" />

	<div class="flex gap-2">
		<button
			onclick={toggleFavorite}
			class="btn btn-ghost btn-sm"
			aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
		>
			{#if isFavorite}
				<FluentEmojiGlowingStar class="size-6" />
			{:else}
				<FluentEmojiStar class="size-6" />
			{/if}
		</button>

		<a
			href={`/station/${station.eva}/edit`}
			class="inline-flex items-center gap-2 rounded-lg bg-blue-500/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500/30"
		>
			<FluentEdit24Regular class="size-5" />
			<span>Edit Details</span>
		</a>
	</div>
</div>

<!-- Station Header -->
<div class="mb-8" style="view-transition-name: station-{station.eva}">
	<div class="mb-4">
		<h1 class="mb-2 text-3xl font-bold text-white">
			{station.name}
		</h1>
		<div class="flex items-center gap-2">
			<span
				class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {categoryBadge.color}"
			>
				{categoryBadge.label}
			</span>
			{#if station.city}
				<p class="text-lg text-white/70">
					{station.city}, {station.country.toUpperCase()}
				</p>
			{/if}
		</div>
	</div>

	<!-- Community Photos -->
	{#if photos && photos.length > 0}
		<div class="mb-4">
			<!-- Main Photo Display -->
			<div
				class="relative overflow-hidden rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm"
			>
				<div class="relative h-80 w-full">
					{#if isImageLoading && !imageError}
						<div
							class="absolute inset-0 flex items-center justify-center bg-white/5"
							aria-label="Loading image"
						>
							<div class="loading loading-spinner loading-lg text-white/50"></div>
						</div>
					{/if}

					{#if imageError}
						<div class="flex h-full items-center justify-center bg-white/5">
							<p class="text-white/50">Failed to load image</p>
						</div>
					{:else}
						<OptimizedLocationImage
							src="{photoBaseUrl}{photos[selectedPhotoIndex].path}"
							alt="Station photo by {photos[selectedPhotoIndex].photographer}"
							priority={selectedPhotoIndex === 0}
							class="h-80"
							onload={handleImageLoad}
							onerror={handleImageError}
						/>
					{/if}
				</div>

				<!-- Photo Navigation Arrows -->
				{#if photos.length > 1}
					<button
						onclick={prevPhoto}
						disabled={isImageLoading}
						class="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-50"
						aria-label="Previous photo"
					>
						<FluentChevronLeft24Regular class="size-6" />
					</button>
					<button
						onclick={nextPhoto}
						disabled={isImageLoading}
						class="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-50"
						aria-label="Next photo"
					>
						<FluentChevronRight24Regular class="size-6" />
					</button>
				{/if}

				<!-- Photo Info -->
				<div
					class="absolute right-0 bottom-0 left-0 bg-linear-to-t from-black/80 to-transparent p-4"
				>
					<a
						href="https://map.railway-stations.org/station.php?countryCode=de&stationId={photos[
							selectedPhotoIndex
						].id}"
						target="_blank"
						rel="noopener noreferrer"
						class="group flex items-center gap-2 text-sm text-white/90 transition-colors hover:text-white"
					>
						<FluentEmojiCamera class="size-4" />
						<span
							class="underline decoration-white/40 underline-offset-2 group-hover:decoration-white"
						>
							Photo by {photos[selectedPhotoIndex].photographer}
						</span>
					</a>
					{#if photos[selectedPhotoIndex].createdAt}
						<p class="text-xs text-white/60">
							{formatDate(photos[selectedPhotoIndex].createdAt)}
						</p>
					{/if}
				</div>
			</div>

			<!-- Photo Contribution Hint -->
			<div class="mt-3 rounded-lg bg-white/5 p-3 backdrop-blur-sm">
				<p class="text-center text-sm text-white/70">
					Help improve this station! <a
						href={`https://map.railway-stations.org/upload.php?countryCode=${station.country.toLowerCase()}&stationId=${station.station_id_ger}`}
						target="_blank"
						rel="noopener noreferrer"
						class="font-medium text-blue-400 underline decoration-blue-400/40 underline-offset-2 transition-colors hover:text-blue-300 hover:decoration-blue-300/60"
					>
						Contribute your own photos
					</a> to help other travelers.
				</p>
			</div>
		</div>
	{:else}
		<!-- Fallback message when no photos available -->
		<div class="mb-4 rounded-lg border border-white/20 bg-white/5 p-8 text-center backdrop-blur-sm">
			<FluentEmojiCamera class="mx-auto mb-3 h-12 w-12 opacity-50" />
			<p class="text-white/60">No photos available for this station yet</p>
			<p class="mt-1 text-sm text-white/40">
				Be the first to <a
					href={`https://map.railway-stations.org/upload.php?countryCode=${station.country.toLowerCase()}&stationId=${station.station_id_ger}`}
					target="_blank"
					rel="noopener noreferrer"
					class="font-medium text-blue-400 underline decoration-blue-400/40 underline-offset-2 transition-colors hover:text-blue-300"
				>
					contribute a photo
				</a>!
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
	{#if pdfUrl}
		<a
			href={pdfUrl}
			target="_blank"
			rel="noopener noreferrer"
			class="flex items-center justify-center gap-2 rounded-lg bg-blue-500/20 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500/30"
		>
			<FluentEmojiWorldMap class="size-5" />
			Location and platform plan (PDF)
		</a>
	{/if}

	{#if station.latitude && station.longitude}
		<a
			href="https://www.google.com/maps/search/?api=1&query={station.latitude},{station.longitude}"
			target="_blank"
			rel="noopener noreferrer"
			class="flex items-center justify-center gap-2 rounded-lg bg-green-500/20 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-green-500/30"
		>
			<FluentLocation24Regular class="size-5" />
			Google Maps
		</a>

		<a
			href="https://www.openstreetmap.org/?mlat={station.latitude}&mlon={station.longitude}&zoom=17"
			target="_blank"
			rel="noopener noreferrer"
			class="flex items-center justify-center gap-2 rounded-lg bg-orange-500/20 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-orange-500/30"
		>
			<FluentMap24Regular class="size-5" />
			OpenStreetMap
		</a>
	{/if}
</div>
