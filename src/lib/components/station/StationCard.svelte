<!-- src/lib/components/StationCard.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import FluentChevronRight24Regular from '~icons/fluent/chevron-right-24-regular';
	import FluentHeart24Regular from '~icons/fluent/heart-24-regular';
	import FluentHeart24Filled from '~icons/fluent/heart-24-filled';
	import IconLoading from '~icons/svg-spinners/90-ring-with-bg';
	import { getCategoryStyles } from '$lib/features/stations/categories';
	import { shouldAnimateStationNavigation } from '$lib/features/stations/navigation';
	import { AMENITIES } from '$lib/features/stations/amenities';
	import PreviewImage from '$lib/components/station/PreviewImage.svelte';
	import { favorites } from '$lib/features/favorites/state.svelte';
	import { rememberStations } from '$lib/features/stations/station-cache';
	import type { StationResult } from '$lib/types';

	interface Props {
		station: StationResult;
	}

	let { station }: Props = $props();

	const category = $derived(getCategoryStyles(station.category));
	const isFavorite = $derived(favorites.has(station.eva));
	let opening = $state(false);

	// Keep a local copy so the favorites page can render this station offline.
	$effect(() => rememberStations([station]));

	async function openStation(event: MouseEvent) {
		if (!shouldAnimateStationNavigation(event)) return;
		event.preventDefault();
		if (opening) return;
		opening = true;

		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (!reduceMotion) await new Promise((resolve) => window.setTimeout(resolve, 340));
		await goto(`/station/${station.eva}`);
	}
</script>

<div
	class="hover-lift group relative flex items-center gap-3.5 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-3.5 shadow-lg shadow-black/15 hover:border-white/20 hover:bg-slate-900/80 hover:shadow-xl"
	style="view-transition-name: station-{station.eva}"
>
	<span class="absolute inset-y-0 left-0 w-1 {category.accent}" aria-hidden="true"></span>

	<!-- Whole card opens the station; the favorite button sits above it. -->
	<a
		href={`/station/${station.eva}`}
		onclick={openStation}
		aria-busy={opening}
		aria-label="Open {station.name}"
		class="absolute inset-0 z-0"
	></a>

	<div class="pointer-events-none relative z-[1] flex min-w-0 flex-1 items-center gap-4">
		<div class="shrink-0" style="view-transition-name: icon-{station.eva}">
			<PreviewImage src={station.photoUrl} alt={station.name} class="size-14 rounded-xl" />
		</div>

		<div class="min-w-0 flex-1">
			<div class="flex items-center gap-2">
				<h3 class="truncate text-base font-bold text-white sm:text-lg">{station.name}</h3>
				<span class="hidden rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold text-white/45 sm:inline">
					{category.label}
				</span>
			</div>
			<p class="mt-0.5 truncate text-xs text-white/45">
				<span class="font-mono">#{station.eva}</span>
				{#if station.city}<span> · {station.city}</span>{/if}
				<span> · {station.country.toUpperCase()}</span>
			</p>

			<div class="mt-2 flex flex-wrap gap-1.5">
				{#each AMENITIES as amenity (amenity.key)}
					{@const available = station[amenity.field] === true}
					<span
						class="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold {available
							? 'bg-emerald-400/10 text-emerald-300'
							: 'bg-white/[0.04] text-white/25'}"
						title={available ? `${amenity.label}: available` : `${amenity.label}: not reported`}
					>
						<amenity.icon class="size-3" />
						<span class="hidden sm:inline">{amenity.badgeLabel}</span>
					</span>
				{/each}
			</div>
		</div>
	</div>

	<button
		type="button"
		onclick={() => favorites.toggle(station.eva)}
		aria-label={isFavorite ? `Remove ${station.name} from favorites` : `Add ${station.name} to favorites`}
		title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
		class="relative z-10 grid size-9 shrink-0 place-items-center rounded-xl border transition-all duration-200 {isFavorite
			? 'border-rose-400/40 bg-rose-500/15 text-rose-300'
			: 'border-white/10 bg-white/[0.04] text-white/35 hover:border-rose-400/40 hover:text-rose-300'}"
	>
		{#if isFavorite}
			<FluentHeart24Filled class="heart-pop size-5" />
		{:else}
			<FluentHeart24Regular class="size-5" />
		{/if}
	</button>

	{#if opening}
		<span class="relative z-[1] grid size-5 shrink-0 place-items-center text-white" role="status" aria-label="Loading station">
			<IconLoading class="size-5" />
		</span>
	{:else}
		<FluentChevronRight24Regular
			class="pointer-events-none relative z-[1] size-5 shrink-0 text-white/25 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-white"
		/>
	{/if}
</div>
