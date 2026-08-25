<!-- src/lib/components/StationCard.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import FluentArrowRight24Regular from '~icons/fluent/arrow-right-24-regular';
	import IconLoading from '~icons/svg-spinners/90-ring-with-bg';
	import { getCategoryStyles } from '$lib/client/categories';
	import { shouldAnimateStationNavigation } from '$lib/client/station-navigation';
	import { FEATURE_AMENITIES, OPENING_HOURS_AMENITY } from '$lib/client/amenities';
	import PreviewImage from '$lib/components/PreviewImage.svelte';
	import { Badge } from '$lib/components/ui';
	import type { StationResult } from '$lib/types';

	interface Props {
		station: StationResult;
	}

	let { station }: Props = $props();

	const categoryStyles = $derived(getCategoryStyles(station.category));
	let opening = $state(false);

	async function openStation(event: MouseEvent) {
		if (!shouldAnimateStationNavigation(event)) return;

		event.preventDefault();
		if (opening) return;
		opening = true;

		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (!reduceMotion) await new Promise((resolve) => window.setTimeout(resolve, 360));
		await goto(`/station/${station.eva}`);
	}
</script>

	<a
		href={`/station/${station.eva}`}
		onclick={openStation}
	aria-busy={opening}
	class="station-card group relative flex items-start gap-4 overflow-hidden rounded-2xl border p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/25 {categoryStyles.cardClass}"
	style="view-transition-name: station-{station.eva}"
>
	<!-- Station photo -->
	<div class="shrink-0" style="view-transition-name: icon-{station.eva}">
		<PreviewImage src={station.photoUrl} alt={station.name} class="size-16" />
	</div>

	<!-- Station info -->
	<div class="min-w-0 grow">
		<h3 class="truncate text-lg font-bold text-white">{station.name}</h3>

		<div class="mt-0.5 text-sm text-white/60">
			<span class="font-mono text-xs">#{station.eva}</span>
			{#if station.city}<span> · {station.city}</span>{/if}
			<span> · {station.country.toUpperCase()}</span>
		</div>

		<!-- Amenities -->
		<div class="mt-3 flex flex-wrap gap-2">
			{#if station.is_open_24h}
				<Badge tone="success" icon={OPENING_HOURS_AMENITY.icon}>
					{OPENING_HOURS_AMENITY.badgeLabel}
				</Badge>
			{:else}
				<Badge tone="danger" icon={OPENING_HOURS_AMENITY.icon}>Limited hours</Badge>
			{/if}

			{#each FEATURE_AMENITIES as amenity (amenity.key)}
				{#if station[amenity.field]}
					<Badge tone={amenity.tone} icon={amenity.icon}>{amenity.badgeLabel}</Badge>
				{/if}
			{/each}
		</div>
	</div>

		{#if opening}
			<span class="mt-1 grid size-6 shrink-0 place-items-center text-white" role="status" aria-label="Loading station details">
				<IconLoading class="size-5" />
			</span>
		{:else}
			<FluentArrowRight24Regular
				class="mt-1 size-6 shrink-0 text-white/40 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white"
			/>
		{/if}
	</a>
