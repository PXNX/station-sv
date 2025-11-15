<!-- src/routes/favorites/+page.svelte -->
<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import FluentEmojiGlowingStar from '~icons/fluent-emoji/glowing-star';
	import FluentEmojiFaceWithRaisedEyebrow from '~icons/fluent-emoji/face-with-raised-eyebrow';
	import FluentArrowRight24Regular from '~icons/fluent/arrow-right-24-regular';
	import FluentEmojiHighVoltage from '~icons/fluent-emoji/high-voltage';
	import FluentEmojiToilet from '~icons/fluent-emoji/toilet';
	import FluentEmojiStation from '~icons/fluent-emoji/station';
	import FluentEmojiFire from '~icons/fluent-emoji/fire';
	import FluentEmojiCrescentMoon from '~icons/fluent-emoji/crescent-moon';
	import FluentEmojiRedCircle from '~icons/fluent-emoji/red-circle';
	import FluentEmojiGreenCircle from '~icons/fluent-emoji/green-circle';
	import FluentEmojiWifi from '~icons/fluent-emoji/antenna-bars';
	import FluentDelete24Regular from '~icons/fluent/delete-24-regular';
	import BackButton from '$lib/components/BackButton.svelte';
	import type { PageData } from './$types';
	import PreviewImage from '$lib/components/PreviewImage.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const FAVORITES_KEY = 'station_favorites';

	let favorites = $state<number[]>([]);
	let isLoading = $state(true);
	let stations = $state(data.stations || []);

	function getCategoryBadge(category: number) {
		switch (category) {
			case 1:
				return { label: 'Major Hub', color: 'badge-primary' };
			case 2:
				return { label: 'Important', color: 'badge-secondary' };
			case 3:
				return { label: 'Regional Hub', color: 'badge-accent' };
			case 4:
				return { label: 'Medium', color: 'badge-info' };
			default:
				return { label: 'Station', color: 'badge-ghost' };
		}
	}

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

	function removeFavorite(eva: number) {
		favorites = favorites.filter((id) => id !== eva);
		localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
		stations = stations.filter((s) => s.eva !== eva);
	}

	function clearAllFavorites() {
		if (confirm('Are you sure you want to remove all favorites?')) {
			favorites = [];
			stations = [];
			localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
		}
	}

	async function fetchFavoriteStations() {
		if (favorites.length === 0) {
			isLoading = false;
			return;
		}

		try {
			const response = await fetch(`/favorites?evas=${favorites.join(',')}`);
			if (response.ok) {
				const data = await response.json();
				stations = data.stations || [];
			}
		} catch (error) {
			console.error('Failed to fetch favorite stations:', error);
		} finally {
			isLoading = false;
		}
	}

	onMount(() => {
		loadFavorites();
		fetchFavoriteStations();
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

<header class="mb-8 text-center">
	<div class="mb-4 flex justify-center">
		<FluentEmojiGlowingStar class="size-16" />
	</div>
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
			{@const categoryBadge = getCategoryBadge(station.category)}
			<div
				class="card group overflow-hidden border border-white/30 bg-white/10 backdrop-blur-md transition-all duration-300"
			>
				<div class="card-body p-0">
					<div class="flex flex-1 items-start gap-4 p-4">
						<!-- Station Photo/Icon -->
						<a
							href={`/station/${station.eva}`}
							class="shrink-0 transition-transform hover:scale-105"
						>
							<div class="size-16 overflow-hidden rounded-2xl">
								{#if station.photoUrl}
									<PreviewImage src={station.photoUrl} alt={station.name} class="size-16" />
								{:else}
									<div
										class="flex size-16 items-center justify-center rounded-2xl bg-linear-to-br from-blue-400 to-teal-500"
									>
										<FluentEmojiStation class="h-10 w-10" />
									</div>
								{/if}
							</div>
						</a>

						<!-- Station Info -->
						<div class="grow">
							<a href={`/station/${station.eva}`}>
								<div class="mb-1 flex items-center gap-2">
									<h3
										class="text-lg font-bold text-white transition-colors duration-200 hover:text-blue-100"
									>
										{station.name}
									</h3>
									<span class="badge badge-sm {categoryBadge.color}">
										{categoryBadge.label}
									</span>
								</div>
								<div class="text-sm text-white/70">
									<span class="font-mono text-xs">#{station.eva}</span>
									{#if station.city}
										<span> · {station.city}</span>
									{/if}
									<span> · {station.country.toUpperCase()}</span>
								</div>

								<!-- Amenities Tags -->
								<div class="mt-3 flex flex-wrap gap-2">
									{#if station.is_open_24h}
										<span
											class="badge badge-sm flex items-center gap-1 border-green-400/50 bg-green-400/20 text-green-100"
										>
											<FluentEmojiGreenCircle class="h-3 w-3" />
											24/7
										</span>
									{:else}
										<span
											class="badge badge-sm flex items-center gap-1 border-red-400/50 bg-red-400/20 text-red-100"
										>
											<FluentEmojiRedCircle class="h-3 w-3" />
											Limited Hours
										</span>
									{/if}

									{#if station.has_warm_sleep}
										<span
											class="badge badge-sm flex items-center gap-1 border-orange-400/50 bg-orange-400/20 text-orange-100"
										>
											<FluentEmojiFire class="h-3 w-3" />
											Warm Sleep
										</span>
									{/if}

									{#if station.has_outlets}
										<span
											class="badge badge-sm flex items-center gap-1 border-yellow-400/50 bg-yellow-400/20 text-yellow-100"
										>
											<FluentEmojiHighVoltage class="h-3 w-3" />
											Outlets
										</span>
									{/if}

									{#if station.has_toilets}
										<span
											class="badge badge-sm flex items-center gap-1 border-purple-400/50 bg-purple-400/20 text-purple-100"
										>
											<FluentEmojiToilet class="h-3 w-3" />
											Toilets
										</span>
									{/if}

									{#if station.toilets_open_at_night}
										<span
											class="badge badge-sm flex items-center gap-1 border-blue-300/50 bg-blue-300/20 text-blue-100"
										>
											<FluentEmojiCrescentMoon class="h-3 w-3" />
											Night Toilets
										</span>
									{/if}

									{#if station.has_wifi}
										<span
											class="badge badge-sm flex items-center gap-1 border-cyan-400/50 bg-cyan-400/20 text-cyan-100"
										>
											<FluentEmojiWifi class="h-3 w-3" />
											WiFi
										</span>
									{/if}
								</div>
							</a>
						</div>

						<!-- Actions -->
						<div class="flex shrink-0 flex-col items-end gap-2">
							<button
								onclick={() => removeFavorite(station.eva)}
								class="btn btn-error btn-sm btn-circle"
								aria-label="Remove from favorites"
							>
								<FluentEmojiGlowingStar class="size-5" />
							</button>
							<a
								href={`/station/${station.eva}`}
								class="btn btn-ghost btn-sm btn-circle"
								aria-label="View details"
							>
								<FluentArrowRight24Regular class="size-5" />
							</a>
						</div>
					</div>
				</div>
			</div>
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
			<a href="/" class="btn btn-primary mt-4">
				Search Stations
				<FluentArrowRight24Regular class="size-5" />
			</a>
		</div>
	</div>
{/if}
