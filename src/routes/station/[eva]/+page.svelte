<!-- src/routes/station/[eva]/+page.svelte -->
<script lang="ts">
	import { onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { resolve } from '$app/paths';
	import DetailImage from '$lib/components/station/DetailImage.svelte';
	import StationAmenities from '$lib/components/station/StationAmenities.svelte';
	import BackButton from '$lib/components/shell/BackButton.svelte';
	import FluentEdit24Regular from '~icons/fluent/edit-24-regular';
	import FluentShare24Regular from '~icons/fluent/share-24-regular';
	import FluentHeart24Regular from '~icons/fluent/heart-24-regular';
	import FluentHeart24Filled from '~icons/fluent/heart-24-filled';
	import FluentChevronRight24Regular from '~icons/fluent/chevron-right-24-regular';
	import FluentChevronLeft24Regular from '~icons/fluent/chevron-left-24-regular';
	import FluentEmojiCamera from '~icons/fluent-emoji/camera';
	import FluentEmojiWorldMap from '~icons/fluent-emoji/world-map';
	import FluentLocation24Regular from '~icons/fluent/location-24-regular';
	import FluentMap24Regular from '~icons/fluent/map-24-regular';
	import { Alert, Badge, Button, Card, IconButton } from '$lib/components/ui';
	import { favorites } from '$lib/features/favorites/state.svelte';
	import { getCategoryStyles } from '$lib/features/stations/categories';
	import { formatDate } from '$lib/utils/format';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	const { station, photos, photoBaseUrl, pdfUrl, operations } = data;

	let selectedPhotoIndex = $state(0);
	let toast = $state('');
	let toastTimer: ReturnType<typeof setTimeout> | undefined;

	const isFavorite = $derived(favorites.has(station.eva));
	const category = $derived(getCategoryStyles(station.category));
	const currentPhotoUrl = $derived(
		photos?.length ? `${photoBaseUrl}${photos[selectedPhotoIndex].path}` : null
	);
	const uploadUrl = $derived(
		`https://map.railway-stations.org/upload.php?countryCode=${station.country.toLowerCase()}&stationId=${station.station_id_ger}`
	);
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

	$effect(() => {
		favorites.load();
	});

	function notify(message: string) {
		toast = message;
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => (toast = ''), 2400);
	}

	async function shareStation() {
		if (!browser) return;
		const shareData = {
			title: `${station.name} · Station Atlas`,
			text: `See what ${station.name} has to offer`,
			url: window.location.href
		};
		try {
			if (navigator.share) {
				await navigator.share(shareData);
			} else {
				await navigator.clipboard.writeText(window.location.href);
				notify('Link copied to clipboard');
			}
		} catch (error) {
			if (error instanceof Error && error.name !== 'AbortError') notify('Could not share this link');
		}
	}

	function nextPhoto() {
		if (photos?.length) selectedPhotoIndex = (selectedPhotoIndex + 1) % photos.length;
	}

	function prevPhoto() {
		if (photos?.length) selectedPhotoIndex = (selectedPhotoIndex - 1 + photos.length) % photos.length;
	}

	onDestroy(() => clearTimeout(toastTimer));
</script>

<svelte:head>
	<title>{station.name} · Station Atlas</title>
	<meta name="description" content="Amenities and practical information for {station.name} station." />
	<meta name="view-transition" content="same-origin" />
</svelte:head>

<div class="animate-fade-up">
	<div class="mb-5 flex items-center justify-between gap-3">
		<BackButton href={resolve('/')} label="All stations" />
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

	<!-- Hero: photo + identity -->
	<div class="mb-6 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
		<div class="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 shadow-xl shadow-black/20">
			{#if currentPhotoUrl}
				<DetailImage
					src={currentPhotoUrl}
					alt="Station photo by {photos[selectedPhotoIndex].photographer}"
					class="h-72 w-full sm:h-96"
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
					<span class="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-0.5 text-xs text-white">
						{selectedPhotoIndex + 1} / {photos.length}
					</span>
				{/if}

				<div class="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/45 to-transparent p-4 pt-12">
					<a
						href="https://map.railway-stations.org/station.php?countryCode={station.country.toLowerCase()}&stationId={station.station_id_ger}"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-2 text-sm text-white/90 transition-colors hover:text-white"
					>
						<FluentEmojiCamera class="size-4" />
						<span class="underline decoration-white/40 underline-offset-2">Photo by {photos[selectedPhotoIndex].photographer}</span>
					</a>
					{#if photos[selectedPhotoIndex].createdAt}
						<p class="mt-0.5 text-xs text-white/50">{formatDate(photos[selectedPhotoIndex].createdAt)}</p>
					{/if}
				</div>
			{:else}
				<div class="flex h-72 flex-col items-center justify-center gap-3 text-center sm:h-96">
					<FluentEmojiCamera class="size-12 opacity-40" />
					<p class="text-sm text-white/50">No photos for this station yet.</p>
					<a
						href={uploadUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="text-sm font-semibold text-signal-300 underline decoration-signal-300/40 underline-offset-2 hover:text-signal-200"
					>
						Be the first to add one
					</a>
				</div>
			{/if}
		</div>

		<div class="flex flex-col justify-center" style="view-transition-name: station-{station.eva}">
			<p class="eyebrow">{category.label} · {station.country.toUpperCase()}</p>
			<h1 class="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">{station.name}</h1>
			{#if station.city}
				<p class="mt-2 text-lg text-white/55">{station.city}, {station.country.toUpperCase()}</p>
			{/if}

			<div class="mt-5 flex flex-wrap gap-2">
				<Badge class={category.badgeClass}>{category.label}</Badge>
				<Badge tone="neutral">EVA {station.eva}</Badge>
				{#if operations?.ds100}<Badge tone="info">DS100 {operations.ds100}</Badge>{/if}
			</div>

			{#if operations?.availableTransports?.length}
				<div class="mt-5">
					<p class="eyebrow mb-2">Trains serving this station</p>
					<div class="flex flex-wrap gap-1.5">
						{#each operations.availableTransports as transport (transport)}
							<Badge tone="neutral">{transport}</Badge>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>

	{#if unknownFields > 0}
		<Alert tone="info" class="mb-5">
			<strong>Help complete this station.</strong>
			{unknownFields} amenity {unknownFields === 1 ? 'detail is' : 'details are'} still unknown — use the edit
			button above to fill in what you know.
		</Alert>
	{/if}

	<section class="mb-6 animate-fade-up">
		<div class="mb-3 flex items-center justify-between">
			<h2 class="text-lg font-bold text-white">At a glance</h2>
			<span class="text-xs text-white/40">Community-maintained</span>
		</div>
		<StationAmenities {station} />
	</section>

	{#if station.additional_info}
		<Card class="mb-6" title="Good to know" icon={FluentEmojiWorldMap}>
			<p class="text-sm leading-relaxed whitespace-pre-wrap text-white/65">{station.additional_info}</p>
		</Card>
	{/if}

	<div class="grid gap-4 lg:grid-cols-2">
		<Card title="Station identifiers" icon={FluentEmojiWorldMap}>
			<dl class="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
				<div>
					<dt class="eyebrow">EVA number</dt>
					<dd class="mt-1 font-mono text-white/90">{station.eva}</dd>
				</div>
				{#if station.station_id_ger}
					<div>
						<dt class="eyebrow">German station ID</dt>
						<dd class="mt-1 font-mono text-white/90">{station.station_id_ger}</dd>
					</div>
				{/if}
				{#if operations?.ds100}
					<div>
						<dt class="eyebrow">DS100</dt>
						<dd class="mt-1 font-mono text-white/90">{operations.ds100}</dd>
					</div>
				{/if}
				{#if operations?.metaEvas?.length}
					<div>
						<dt class="eyebrow">Related EVAs</dt>
						<dd class="mt-1 font-mono text-white/90">{operations.metaEvas.join(' · ')}</dd>
					</div>
				{/if}
			</dl>
			{#if operations}
				<div class="mt-4 flex flex-wrap gap-2 border-t border-white/8 pt-3">
					<Badge tone={operations.isActiveRis ? 'success' : 'neutral'}>
						{operations.isActiveRis ? 'RIS active' : 'RIS inactive'}
					</Badge>
					<Badge tone={operations.isActiveIris ? 'success' : 'neutral'}>
						{operations.isActiveIris ? 'IRIS active' : 'IRIS inactive'}
					</Badge>
				</div>
				<p class="mt-2 text-xs text-white/35">Operational data from {operations.sourceName}.</p>
			{/if}
		</Card>

		<Card title="Plan your visit" icon={FluentLocation24Regular}>
			<div class="flex flex-col gap-2">
				{#if pdfUrl}
					<Button variant="secondary" href={pdfUrl} external>
						<FluentEmojiWorldMap class="size-5" />
						Location & platform plan
					</Button>
				{/if}
				{#if station.latitude && station.longitude}
					<Button
						variant="secondary"
						href="https://www.google.com/maps/search/?api=1&query={station.latitude},{station.longitude}"
						external
					>
						<FluentLocation24Regular class="size-5" />
						Open in Google Maps
					</Button>
					<Button
						variant="secondary"
						href="https://www.openstreetmap.org/?mlat={station.latitude}&mlon={station.longitude}&zoom=17"
						external
					>
						<FluentMap24Regular class="size-5" />
						Open in OpenStreetMap
					</Button>
				{/if}
			</div>
		</Card>
	</div>
</div>

{#if toast}
	<div
		class="animate-pop fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/15 bg-ink-800/95 px-5 py-2.5 text-sm font-medium text-white shadow-2xl backdrop-blur-xl"
		role="status"
	>
		{toast}
	</div>
{/if}
