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
	import FluentCamera24Regular from '~icons/fluent/camera-24-regular';
	import FluentDriveTrain24Regular from '~icons/fluent/drive-train-24-regular';
	import FluentLocation24Regular from '~icons/fluent/location-24-regular';
	import FluentMap24Regular from '~icons/fluent/map-24-regular';
	import FluentInfo24Regular from '~icons/fluent/info-24-regular';
	import { Alert, Badge, Button, Card, IconButton } from '$lib/components/ui';
	import { favorites } from '$lib/features/favorites/state.svelte';
	import { getCategoryStyles } from '$lib/features/stations/categories';
	import { getTransportStyle } from '$lib/features/stations/transports';
	import { photoUrl } from '$lib/features/stations/normalize';
	import { formatDate } from '$lib/utils/format';
	import { rememberStations } from '$lib/features/stations/station-cache';
	import { recentlyViewed } from '$lib/features/stations/recent.svelte';
	import type { StationResult } from '$lib/types';
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
	const currentPhotoUrl = $derived(photoUrl(photoBaseUrl, photos?.[selectedPhotoIndex]?.path));
	const photoDate = $derived(photos?.[selectedPhotoIndex]?.createdAt);
	const uploadUrl = $derived(
		`https://map.railway-stations.org/upload.php?countryCode=${station.country.toLowerCase()}&stationId=${station.station_id_ger}`
	);
	const transports = $derived(operations?.availableTransports ?? []);
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

	function transportName(value: string) {
		const style = getTransportStyle(value);
		return style.short && style.short !== style.label
			? `${style.label} · ${style.short}`
			: style.label;
	}

	$effect(() => {
		favorites.load();
		recentlyViewed.load();
	});

	$effect(() => {
		const summary: StationResult = {
			...station,
			city: station.city ?? null,
			category: station.category as StationResult['category'],
			photoUrl: currentPhotoUrl
		};
		rememberStations([summary]);
		recentlyViewed.visit(summary);
	});

	function notify(message: string) {
		toast = message;
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => (toast = ''), 2400);
	}

	async function shareStation() {
		if (!browser) return;
		try {
			if (navigator.share) {
				await navigator.share({
					title: `${station.name} · Station Atlas`,
					url: window.location.href
				});
			} else {
				await navigator.clipboard.writeText(window.location.href);
				notify('Link copied');
			}
		} catch (error) {
			if (error instanceof Error && error.name !== 'AbortError') notify('Could not share');
		}
	}

	function nextPhoto() {
		if (photos?.length) selectedPhotoIndex = (selectedPhotoIndex + 1) % photos.length;
	}

	function prevPhoto() {
		if (photos?.length)
			selectedPhotoIndex = (selectedPhotoIndex - 1 + photos.length) % photos.length;
	}

	onDestroy(() => clearTimeout(toastTimer));
</script>

<svelte:head>
	<title>{station.name} · Station Atlas</title>
	<meta
		name="description"
		content="Amenities, train types and practical information for {station.name}."
	/>
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

	<!-- Identity -->
	<div class="mb-6" style="view-transition-name: station-{station.eva}">
		<div class="flex flex-wrap items-center gap-3">
			<Badge class="animate-pop {category.badge}">{category.label}</Badge>
			{#if operations?.ds100}
				<span class="font-mono text-xs text-white/35">DS100 {operations.ds100}</span>
			{/if}
		</div>
		<h1 class="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">{station.name}</h1>
		{#if station.city}
			<p class="mt-2 text-lg text-white/55">{station.city}, {station.country.toUpperCase()}</p>
		{/if}
	</div>

	<!-- Photo -->
	<div
		class="relative mb-6 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 shadow-xl shadow-black/20"
	>
		{#if currentPhotoUrl}
			<DetailImage
				src={currentPhotoUrl}
				alt="Station photo by {photos[selectedPhotoIndex].photographer}"
				class="h-64 w-full sm:h-96"
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
				<span
					class="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-0.5 text-xs text-white"
				>
					{selectedPhotoIndex + 1} / {photos.length}
				</span>
			{/if}

			<div
				class="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-2 bg-linear-to-t from-black/90 via-black/45 to-transparent p-4 pt-12"
			>
				<a
					href="https://map.railway-stations.org/station.php?countryCode={station.country.toLowerCase()}&stationId={station.station_id_ger}"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-2 text-sm text-white/90 transition-colors hover:text-white"
				>
					<FluentCamera24Regular class="size-4" />
					<span class="underline decoration-white/40 underline-offset-2">
						Photo by {photos[selectedPhotoIndex].photographer}
					</span>
				</a>
				{#if photoDate}
					<span class="text-xs text-white/50">{formatDate(photoDate)}</span>
				{/if}
			</div>
		{:else}
			<div class="flex h-48 flex-col items-center justify-center gap-2 text-center sm:h-64">
				<FluentCamera24Regular class="size-10 text-white/30" />
				<p class="text-sm text-white/50">No photo for this station yet.</p>
				<a
					href={uploadUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="text-signal-300 decoration-signal-300/40 hover:text-signal-200 text-sm font-semibold underline underline-offset-2"
				>
					Add one
				</a>
			</div>
		{/if}
	</div>

	{#if unknownFields > 0}
		<Alert tone="info" class="mb-5">
			<strong
				>{unknownFields} amenity {unknownFields === 1 ? 'detail is' : 'details are'} unknown.</strong
			>
			Help fill them in if you know.
		</Alert>
	{/if}

	<section class="mb-6">
		<h2 class="mb-3 text-lg font-bold text-white">At a glance</h2>
		<StationAmenities {station} />
	</section>

	{#if station.additional_info}
		<Card class="mb-6" title="Good to know" icon={FluentInfo24Regular}>
			<p class="text-sm leading-relaxed whitespace-pre-wrap text-white/65">
				{station.additional_info}
			</p>
		</Card>
	{/if}

	<div class="grid gap-4 lg:grid-cols-2">
		<Card title="Trains & services" icon={FluentDriveTrain24Regular}>
			{#if transports.length > 0}
				<div class="flex flex-wrap gap-2">
					{#each transports as transport (transport)}
						{@const style = getTransportStyle(transport)}
						<Badge tone={style.tone}>{transportName(transport)}</Badge>
					{/each}
				</div>
			{:else}
				<p class="text-sm text-white/45">No service data available.</p>
			{/if}

			{#if operations}
				<div class="mt-4 flex flex-wrap gap-2 border-t border-white/8 pt-4">
					<Badge tone={operations.isActiveRis ? 'success' : 'neutral'}>
						RIS {operations.isActiveRis ? 'active' : 'inactive'}
					</Badge>
					<Badge tone={operations.isActiveIris ? 'success' : 'neutral'}>
						IRIS {operations.isActiveIris ? 'active' : 'inactive'}
					</Badge>
				</div>
				<p class="mt-2 text-xs text-white/30">Operational data from {operations.sourceName}.</p>
			{/if}
		</Card>

		<Card title="Station identifiers" icon={FluentInfo24Regular}>
			<dl class="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
				<div>
					<dt class="eyebrow">EVA number</dt>
					<dd class="mt-1 font-mono text-white/90">{station.eva}</dd>
				</div>
				{#if station.station_id_ger}
					<div>
						<dt class="eyebrow">Station ID</dt>
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
		</Card>
	</div>

	<Card class="mt-4" title="Find it on a map" icon={FluentLocation24Regular}>
		<div class="flex flex-wrap gap-2">
			{#if pdfUrl}
				<Button variant="secondary" href={pdfUrl} external>
					<FluentMap24Regular class="size-4" />
					Platform plan
				</Button>
			{/if}
			{#if station.latitude && station.longitude}
				<Button
					variant="secondary"
					href="https://www.google.com/maps/search/?api=1&query={station.latitude},{station.longitude}"
					external
				>
					<FluentLocation24Regular class="size-4" />
					Google Maps
				</Button>
				<Button
					variant="secondary"
					href="https://www.openstreetmap.org/?mlat={station.latitude}&mlon={station.longitude}&zoom=17"
					external
				>
					<FluentMap24Regular class="size-4" />
					OpenStreetMap
				</Button>
			{/if}
		</div>
	</Card>
</div>

{#if toast}
	<div
		class="animate-pop bg-ink-800/95 fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white shadow-2xl backdrop-blur-xl"
		role="status"
	>
		{toast}
	</div>
{/if}
