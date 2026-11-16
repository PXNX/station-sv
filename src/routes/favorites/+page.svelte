<!-- src/routes/favorites/+page.svelte -->
<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import FluentDelete24Regular from '~icons/fluent/delete-24-regular';
	import FluentEmojiGlowingStar from '~icons/fluent-emoji/glowing-star';
	import FluentArrowRight24Regular from '~icons/fluent/arrow-right-24-regular';
	import StationCard from '$lib/components/StationCard.svelte';
	import { Button, ConfirmDialog, EmptyState, PageHeader, Spinner } from '$lib/components/ui';
	import { favorites } from '$lib/client/favorites.svelte';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';
	import type { StationResult } from '$lib/types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let isLoading = $state(true);
	let stations: StationResult[] = $state(untrack(() => data.stations ?? []));
	let showClearDialog = $state(false);

	function clearAllFavorites() {
		favorites.clear();
		stations = [];
	}

	async function fetchFavoriteStations(evas: number[]) {
		if (evas.length === 0) {
			isLoading = false;
			stations = [];
			return;
		}
		try {
			const response = await fetch(`/api/favorites?evas=${evas.join(',')}`);
			if (response.ok) {
				const payload = await response.json();
				stations = payload.stations ?? [];
			}
		} catch (error) {
			console.error('Failed to fetch favorite stations:', error);
			stations = [];
		} finally {
			isLoading = false;
		}
	}

	onMount(() => {
		favorites.load();
		fetchFavoriteStations(favorites.evas);
	});
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
		description={`${stations.length} ${stations.length === 1 ? 'station' : 'stations'} saved on this device`}
	>
		{#snippet actions()}
			{#if stations.length > 0}
				<Button variant="danger" size="sm" onclick={() => (showClearDialog = true)}>
					<FluentDelete24Regular class="size-4" />
					Clear all
				</Button>
			{/if}
		{/snippet}
	</PageHeader>

	{#if isLoading}
		<div class="flex justify-center py-16">
			<div class="flex items-center gap-3 rounded-full border border-white/10 bg-slate-900/70 px-6 py-3">
				<Spinner />
				<span class="text-sm font-medium text-white/80">Loading your stations…</span>
			</div>
		</div>
	{:else if stations.length > 0}
		<div class="stagger space-y-3">
			{#each stations as station (station.eva)}
				<StationCard {station} />
			{/each}
		</div>
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
