<!-- src/routes/station/[eva]/+page.svelte -->
<script lang="ts">
	import DetailImage from '$lib/components/DetailImage.svelte';
	import { browser } from '$app/environment';

	import FluentEdit24Regular from '~icons/fluent/edit-24-regular';
	import FluentEmojiBed from '~icons/fluent-emoji/bed';
	import FluentEmojiHighVoltage from '~icons/fluent-emoji/high-voltage';
	import FluentEmojiToilet from '~icons/fluent-emoji/toilet';
	import FluentEmojiTwelveOclock from '~icons/fluent-emoji/twelve-oclock';
	import FluentEmojiInformation from '~icons/fluent-emoji/information';
	import FluentEmojiSatelliteAntenna from '~icons/fluent-emoji/satellite-antenna';
	import FluentEmojiWorldMap from '~icons/fluent-emoji/world-map';
	import FluentEmojiCamera from '~icons/fluent-emoji/camera';
	import FluentLocation24Regular from '~icons/fluent/location-24-regular';
	import FluentMap24Regular from '~icons/fluent/map-24-regular';
	import FluentChevronRight24Regular from '~icons/fluent/chevron-right-24-regular';
	import FluentChevronLeft24Regular from '~icons/fluent/chevron-left-24-regular';
	import FluentHeart24Regular from '~icons/fluent/heart-24-regular';
	import FluentHeart24Filled from '~icons/fluent/heart-24-filled';
	import FluentShare24Regular from '~icons/fluent/share-24-regular';
	import BackButton from '$lib/components/BackButton.svelte';
	import { Alert, Badge, Button, Card, IconButton, StatusRow } from '$lib/components/ui';
	import { favorites } from '$lib/client/favorites.svelte';

	import type { PageData } from './$types';
	import { getCategoryStyles } from '$lib/client/categories';
	import { formatDate } from '$lib/utils/format';
	import { resolve } from '$app/paths';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	const { station, photos, photoBaseUrl, pdfUrl } = data;

	let selectedPhotoIndex = $state(0);

	const isFavorite = $derived(favorites.has(station.eva));

	// Fields nobody has filled in yet, so we can nudge visitors towards the edit form.
	const unknownFields = $derived(
		[
			station.has_warm_sleep,
			station.has_outlets,
			station.has_toilets,
			station.toilets_open_at_night,
			station.is_open_24h,
			station.has_wifi
		].filter((value) => value === null || value === undefined).length
	);

	async function shareStation() {
		if (!browser) return;

		const shareData = {
			title: `${station.name} - Station Details`,
			text: `Check out ${station.name} station`,
			url: window.location.href
		};

		try {
			if (navigator.share) {
				await navigator.share(shareData);
			} else {
				// Fallback: copy to clipboard
				await navigator.clipboard.writeText(window.location.href);
				alert('Link copied to clipboard!');
			}
		} catch (error) {
			if (error instanceof Error && error.name !== 'AbortError') {
				console.error('Error sharing:', error);
			}
		}
	}

	$effect(() => {
		favorites.load();
	});

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

	const categoryBadge = $derived.by(() => getCategoryStyles(station.category));
	const currentPhotoUrl = $derived(
		photos && photos.length > 0 ? `${photoBaseUrl}${photos[selectedPhotoIndex].path}` : null
	);
	const uploadUrl = $derived(
		`https://map.railway-stations.org/upload.php?countryCode=${station.country.toLowerCase()}&stationId=${station.station_id_ger}`
	);
</script>

<svelte:head>
	<title>{station.name} - Station Details</title>
	<meta name="description" content="Details for {station.name} train station" />
	<meta name="view-transition" content="same-origin" />
</svelte:head>

<!-- Toolbar -->
<div class="mb-6 flex items-center justify-between gap-4">
	<BackButton href={resolve('/')} />

	<div class="flex gap-2">
		<IconButton icon={FluentShare24Regular} label="Share station" onclick={shareStation} />
		<IconButton
			icon={isFavorite ? FluentHeart24Filled : FluentHeart24Regular}
			label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
			active={isFavorite}
			onclick={() => favorites.toggle(station.eva)}
		/>
		<IconButton
			icon={FluentEdit24Regular}
			label="Edit station details"
			href={resolve(`/station/${station.eva}/edit`)}
		/>
	</div>
</div>

<!-- Station header -->
<div class="mb-6" style="view-transition-name: station-{station.eva}">
	<h1 class="mb-2 text-3xl font-bold text-white">{station.name}</h1>
	<div class="flex flex-wrap items-center gap-2">
		<Badge class={categoryBadge.badgeClass}>{categoryBadge.label}</Badge>
		{#if station.city}
			<p class="text-white/60">{station.city}, {station.country.toUpperCase()}</p>
		{/if}
	</div>
</div>

<!-- Community photos -->
{#if photos && photos.length > 0}
	<div class="mb-6 space-y-3">
		<div class="relative overflow-hidden rounded-2xl border border-white/12 bg-white/5">
			<DetailImage
				src={currentPhotoUrl}
				alt="Station photo by {photos[selectedPhotoIndex].photographer}"
				class="h-80 w-full"
			/>

			{#if photos.length > 1}
				<IconButton
					icon={FluentChevronLeft24Regular}
					label="Previous photo"
					class="absolute top-1/2 left-3 -translate-y-1/2 border-0 bg-black/50 hover:bg-black/70"
					onclick={prevPhoto}
				/>
				<IconButton
					icon={FluentChevronRight24Regular}
					label="Next photo"
					class="absolute top-1/2 right-3 -translate-y-1/2 border-0 bg-black/50 hover:bg-black/70"
					onclick={nextPhoto}
				/>
			{/if}

			<!-- Photo credit -->
			<div class="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 to-transparent p-4">
				<a
					href="https://map.railway-stations.org/station.php?countryCode=de&stationId={photos[
						selectedPhotoIndex
					].id}"
					target="_blank"
					rel="noopener noreferrer"
					class="group flex items-center gap-2 text-sm text-white/90 transition-colors hover:text-white"
				>
					<FluentEmojiCamera class="size-4" />
					<span class="underline decoration-white/40 underline-offset-2 group-hover:decoration-white">
						Photo by {photos[selectedPhotoIndex].photographer}
					</span>
				</a>
				{#if photos[selectedPhotoIndex].createdAt}
					<p class="mt-0.5 text-xs text-white/50">
						{formatDate(photos[selectedPhotoIndex].createdAt)}
					</p>
				{/if}
			</div>

			{#if photos.length > 1}
				<div class="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-0.5 text-xs text-white">
					{selectedPhotoIndex + 1} / {photos.length}
				</div>
			{/if}
		</div>

		<Card variant="inset" padding="sm">
			<p class="text-center text-sm text-white/60">
				Help improve this station!
				<a
					href={uploadUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="font-medium text-sky-300 underline decoration-sky-300/40 underline-offset-2 transition-colors hover:text-sky-200"
				>
					Contribute your own photos
				</a>
				to help other travelers.
			</p>
		</Card>
	</div>
{:else}
	<Card variant="inset" padding="lg" class="mb-6 text-center">
		<FluentEmojiCamera class="mx-auto mb-3 size-12 opacity-50" />
		<p class="text-white/60">No photos available for this station yet</p>
		<p class="mt-1 text-sm text-white/40">
			Be the first to
			<a
				href={uploadUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="font-medium text-sky-300 underline decoration-sky-300/40 underline-offset-2 transition-colors hover:text-sky-200"
			>
				contribute a photo
			</a>!
		</p>
	</Card>
{/if}

{#if unknownFields > 0}
	<Alert tone="info" class="mb-6">
		<strong>Missing information?</strong>
		{unknownFields} of this station's details are still unknown. Use the edit button above to fill in
		what you know.
	</Alert>
{/if}

<!-- Amenities -->
<div class="mb-6 grid gap-4 sm:grid-cols-2">
	<Card variant="inset" title="Sleeping" icon={FluentEmojiBed}>
		<StatusRow label="Warm area" value={station.has_warm_sleep} />
		{#if station.sleep_notes}
			<p class="mt-2 text-sm text-white/60">{station.sleep_notes}</p>
		{/if}
	</Card>

	<Card variant="inset" title="Power outlets" icon={FluentEmojiHighVoltage}>
		<StatusRow label="Available" value={station.has_outlets} />
		{#if station.outlet_notes}
			<p class="mt-2 text-sm text-white/60">{station.outlet_notes}</p>
		{/if}
	</Card>

	<Card variant="inset" title="Toilets" icon={FluentEmojiToilet}>
		<div class="space-y-1">
			<StatusRow label="Available" value={station.has_toilets} />
			<StatusRow label="Open at night" value={station.toilets_open_at_night} />
		</div>
		{#if station.toilet_notes}
			<p class="mt-2 text-sm text-white/60">{station.toilet_notes}</p>
		{/if}
	</Card>

	<Card variant="inset" title="Opening hours" icon={FluentEmojiTwelveOclock}>
		<StatusRow label="24/7 access" value={station.is_open_24h} />
		{#if station.opening_hours}
			<p class="mt-2 text-sm text-white/60">{station.opening_hours}</p>
		{/if}
	</Card>

	<Card variant="inset" title="WiFi hotspot" icon={FluentEmojiSatelliteAntenna}>
		<div class="space-y-1">
			<StatusRow label="Available" value={station.has_wifi} />
			{#if station.has_wifi}
				<StatusRow label="Limited data" value={station.wifi_has_limit} />
			{/if}
		</div>
		{#if station.wifi_notes}
			<p class="mt-2 text-sm text-white/60">{station.wifi_notes}</p>
		{/if}
	</Card>

	{#if station.additional_info}
		<Card variant="inset" title="Additional information" icon={FluentEmojiInformation}>
			<p class="text-sm whitespace-pre-wrap text-white/60">{station.additional_info}</p>
		</Card>
	{/if}
</div>

<!-- External links -->
<div class="grid gap-3 sm:grid-cols-2">
	{#if pdfUrl}
		<Button variant="secondary" href={pdfUrl} external>
			<FluentEmojiWorldMap class="size-5" />
			Location and platform plan
		</Button>
	{/if}

	{#if station.latitude && station.longitude}
		<Button
			variant="secondary"
			href="https://www.google.com/maps/search/?api=1&query={station.latitude},{station.longitude}"
			external
		>
			<FluentLocation24Regular class="size-5" />
			Google Maps
		</Button>

		<Button
			variant="secondary"
			href="https://www.openstreetmap.org/?mlat={station.latitude}&mlon={station.longitude}&zoom=17"
			external
		>
			<FluentMap24Regular class="size-5" />
			OpenStreetMap
		</Button>
	{/if}
</div>
