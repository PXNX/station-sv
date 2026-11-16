<!-- src/routes/favorites/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import FluentCloudOffline24Regular from '~icons/fluent/cloud-offline-24-regular';
	import FluentDelete24Regular from '~icons/fluent/delete-24-regular';
	import FluentEmojiGlowingStar from '~icons/fluent-emoji/glowing-star';
	import FluentArrowRight24Regular from '~icons/fluent/arrow-right-24-regular';
	import StationCard from '$lib/components/station/StationCard.svelte';
	import { Button, ConfirmDialog, EmptyState, PageHeader, Spinner } from '$lib/components/ui';
	import { favorites } from '$lib/features/favorites/state.svelte';
	import { getCachedStations, rememberStations } from '$lib/features/stations/station-cache';
	import { network } from '$lib/features/network/online.svelte';
	import { resolve } from '$app/paths';
	import type { StationResult } from '$lib/types';

	let isLoading = $state(true);
	let isRefreshing = $state(false);
	let isStale = $state(false);
	let stations: StationResult[] = $state([]);
	let showClearDialog = $state(false);

	// Only stations still in the favorites list are shown. Removing a heart on a
	// card updates this immediately, without waiting for a refetch.
	const visibleStations = $derived(stations.filter((s) => favorites.has(s.eva)));

	let request: AbortController | undefined;

	async function refresh(evas: number[], timeoutMs = 4000) {
		request?.abort();
		request = new AbortController();
		const timer = setTimeout(() => request?.abort(), timeoutMs);
		isRefreshing = true;

		try {
			const response = await fetch(`/api/favorites?evas=${evas.join(',')}`, {
				signal: request.signal
			});
			if (!response.ok) throw new Error(`HTTP ${response.status}`);
			const payload = await response.json();
			const fresh: StationResult[] = payload.stations ?? [];
			rememberStations(fresh);

			// Keep the user's ordering, and keep cached entries the API omitted.
			const byEva = new Map([...stations, ...fresh].map((s) => [s.eva, s]));
			stations = evas.flatMap((eva) => {
				const station = byEva.get(eva);
				return station ? [station] : [];
			});
			isStale = false;
		} catch {
			// Offline, slow or failed: cached stations stay on screen.
			isStale = visibleStations.length > 0;
		} finally {
			clearTimeout(timer);
			isRefreshing = false;
			isLoading = false;
		}
	}

	onMount(() => {
		favorites.load();
		network.start();
		const evas = favorites.evas;

		if (evas.length === 0) {
			isLoading = false;
			return;
		}

		// Render cached favorites immediately — no spinner on slow connections.
		stations = getCachedStations(evas);

		if (network.online) {
			refresh(evas);
		} else {
			isStale = stations.length > 0;
			isLoading = false;
		}

		return () => request?.abort();
	});

	function clearAllFavorites() {
		favorites.clear();
		stations = [];
		isStale = false;
	}

	// One batched write instead of one per card (a search can render dozens).
	$effect(() => rememberStations(visibleStations));
</script>

<svelte:head>
	<title>Favorites · Station Atlas</title>
	<meta name="description" content="Your saved stations." />
</svelte:head>

<div class="animate-fade-up">
	<PageHeader
		title="Saved stations"
		icon={FluentEmojiGlowingStar}
		eyebrow="Your shortlist"
		description={`${favorites.count} ${favorites.count === 1 ? 'station' : 'stations'} saved on this device`}
	>
		{#snippet actions()}
			{#if visibleStations.length > 0}
				<Button variant="danger" size="sm" onclick={() => (showClearDialog = true)}>
					<FluentDelete24Regular class="size-4" />
					Clear all
				</Button>
			{/if}
		{/snippet}
	</PageHeader>

	{#if isStale}
		<div class="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
			<span class="inline-flex items-center gap-2">
				<FluentCloudOffline24Regular class="size-4" />
				Showing saved copies — {network.online ? 'the connection is too slow' : "you're offline"}.
			</span>
			<Button size="sm" variant="secondary" onclick={() => refresh(favorites.evas)} disabled={isRefreshing}>
				{isRefreshing ? 'Retrying…' : 'Retry'}
			</Button>
		</div>
	{/if}

	{#if isLoading}
		<div class="flex justify-center py-16">
			<div class="flex items-center gap-3 rounded-full border border-white/10 bg-slate-900/70 px-6 py-3">
				<Spinner />
				<span class="text-sm font-medium text-white/80">Loading your stations…</span>
			</div>
		</div>
	{:else if visibleStations.length > 0}
		<div class="stagger space-y-3">
			{#each visibleStations as station (station.eva)}
				<StationCard {station} />
			{/each}
		</div>
	{:else if favorites.count > 0}
		<EmptyState
			icon={FluentCloudOffline24Regular}
			title="Couldn't load these stations"
			description="Your saved list is on this device, but the station details aren't available yet. Check your connection and retry."
		>
			<Button onclick={() => refresh(favorites.evas)} disabled={isRefreshing}>
				{isRefreshing ? 'Retrying…' : 'Try again'}
			</Button>
		</EmptyState>
	{:else}
		<EmptyState
			icon={FluentEmojiGlowingStar}
			title="No favorites yet"
			description="Tap the heart on any station to keep it here for later. Your list stays on this device."
		>
			<Button href={resolve('/')}>
				Find a station
				<FluentArrowRight24Regular class="size-4" />
			</Button>
		</EmptyState>
	{/if}
</div>

<ConfirmDialog
	bind:open={showClearDialog}
	title="Remove all favorites?"
	message="This clears every saved station. This cannot be undone."
	confirmLabel="Clear all"
	tone="danger"
	onconfirm={clearAllFavorites}
/>
