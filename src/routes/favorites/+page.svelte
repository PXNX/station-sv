<!-- src/routes/favorites/+page.svelte -->
<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import FluentEmojiGlowingStar from '~icons/fluent-emoji/glowing-star';
	import FluentEmojiFaceWithRaisedEyebrow from '~icons/fluent-emoji/face-with-raised-eyebrow';
	import FluentArrowRight24Regular from '~icons/fluent/arrow-right-24-regular';

	import FluentDelete24Regular from '~icons/fluent/delete-24-regular';
	import BackButton from '$lib/components/BackButton.svelte';
	import type { PageData } from './$types';

	import { resolve } from '$app/paths';
	import StationCard from '$lib/components/StationCard.svelte';
	import type { StationResult } from '$lib/types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const FAVORITES_KEY = 'station_favorites';

	let favorites = $state<number[]>([]);
	let isLoading = $state(true);
	let stations: StationResult[] = $state(data.stations || []);

	function loadFavorites() {
		if (!browser) return [];
		try {
			const stored = localStorage.getItem(FAVORITES_KEY);
			if (stored) {
				return JSON.parse(stored);
			}
		} catch (error) {
			console.error('Failed to load favorites:', error);
		}
		return [];
	}

	function clearAllFavorites() {
		if (confirm('Are you sure you want to remove all favorites?')) {
			favorites = [];
			stations = [];
			localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
		}
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
				const data = await response.json();
				stations = data.stations || [];
			}
		} catch (error) {
			console.error('Failed to fetch favorite stations:', error);
			stations = [];
		} finally {
			isLoading = false;
		}
	}

	onMount(() => {
		// Load favorites synchronously first, then fetch
		const loadedFavorites = loadFavorites();
		favorites = loadedFavorites;

		// Now fetch the station data
		fetchFavoriteStations(loadedFavorites);
	});
</script>

<svelte:head>
	<title>My Favorites - Train Station Search</title>
	<meta name="description" content="Your favorite train stations" />
</svelte:head>

<!-- Header -->
<div class="mb-6 flex items-center justify-between">
	<BackButton href="/" />

	{#if stations.length > 0}
		<button onclick={clearAllFavorites} class="btn btn-error btn-sm btn-outline">
			<FluentDelete24Regular class="size-4" />
			Clear All
		</button>
	{/if}
</div>

<header class="mb-6">
	<h1 class="text-3xl font-bold text-white">My Favorite Stations</h1>
	<p class="mt-2 text-sm text-white/70">
		{stations.length} station{stations.length !== 1 ? 's' : ''} saved
	</p>
</header>

<!-- Loading State -->
{#if isLoading}
	<div class="mb-8 flex justify-center py-8">
		<div
			class="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-6 py-3 backdrop-blur-md"
		>
			<span class="loading loading-ring loading-md"></span>
			<span class="font-medium text-white">Loading favorites...</span>
		</div>
	</div>
{/if}

<!-- Station Cards -->
{#if !isLoading && stations.length > 0}
	<div class="space-y-4">
		{#each stations as station (station.eva)}
			<StationCard {station} />
		{/each}
	</div>
{/if}

<!-- Empty State -->
{#if !isLoading && stations.length === 0}
	<div class="card border border-white/30 bg-white/10 backdrop-blur-md">
		<div class="card-body items-center justify-center gap-y-4 py-20">
			<FluentEmojiFaceWithRaisedEyebrow class="size-16" />
			<h3 class="text-2xl font-bold text-white">No favorites yet</h3>
			<p class="text-center text-lg text-white/70">
				Start adding stations to your favorites by clicking the star icon on station detail pages.
			</p>
			<a href={resolve('/')} class="btn btn-primary mt-4">
				Search Stations
				<FluentArrowRight24Regular class="size-5" />
			</a>
		</div>
	</div>
{/if}
