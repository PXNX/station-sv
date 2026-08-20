<!-- src/routes/favorites/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import FluentEmojiGlowingStar from '~icons/fluent-emoji/glowing-star';
	import FluentArrowRight24Regular from '~icons/fluent/arrow-right-24-regular';
	import FluentDelete24Regular from '~icons/fluent/delete-24-regular';
	import BackButton from '$lib/components/BackButton.svelte';
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
	let stations: StationResult[] = $state(data.stations || []);
	let showClearDialog = $state(false);

	function clearAllFavorites() {
		favorites.clear();
		stations = [];
	}

	async function fetchFavoriteStations(favoriteIds: number[]) {
		if (favoriteIds.length === 0) {
			isLoading = false;
			stations = [];
			return;
		}

		try {
			const response = await fetch(`/favorites?evas=${favoriteIds.join(',')}`);
			if (response.ok) {
				const payload = await response.json();
				stations = payload.stations || [];
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
	<title>My Favorites - Train Station Search</title>
	<meta name="description" content="Your favorite train stations" />
</svelte:head>

<div class="mb-6 flex items-center justify-between gap-4">
	<BackButton href={resolve('/')} />

	{#if stations.length > 0}
		<Button variant="danger" size="sm" outline onclick={() => (showClearDialog = true)}>
			<FluentDelete24Regular class="size-4" />
			Clear all
		</Button>
	{/if}
</div>

<PageHeader
	title="My Favorite Stations"
	icon={FluentEmojiGlowingStar}
	align="start"
	description={`${stations.length} ${stations.length === 1 ? 'station' : 'stations'} saved`}
/>

{#if isLoading}
	<div class="flex justify-center py-10">
		<div
			class="flex items-center gap-3 rounded-full border border-white/12 bg-white/6 px-6 py-3 backdrop-blur-md"
		>
			<Spinner />
			<span class="text-sm font-medium text-white">Loading favorites...</span>
		</div>
	</div>
{:else if stations.length > 0}
	<div class="space-y-4">
		{#each stations as station (station.eva)}
			<StationCard {station} />
		{/each}
	</div>
{:else}
	<EmptyState
		icon={FluentEmojiGlowingStar}
		title="No favorites yet"
		description="Start adding stations to your favorites by tapping the heart icon on a station's detail page."
	>
		<Button href={resolve('/')}>
			Search stations
			<FluentArrowRight24Regular class="size-5" />
		</Button>
	</EmptyState>
{/if}

<ConfirmDialog
	bind:open={showClearDialog}
	title="Remove all favorites?"
	message="This clears every station from your favorites. It cannot be undone."
	confirmLabel="Clear all"
	tone="danger"
	onconfirm={clearAllFavorites}
/>
