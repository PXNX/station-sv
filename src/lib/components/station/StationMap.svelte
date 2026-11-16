<!-- src/lib/components/station/StationMap.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import FluentMap24Regular from '~icons/fluent/map-24-regular';
	import { getCategoryStyles } from '$lib/features/stations/categories';
	import type { StationResult } from '$lib/types';

	interface Props {
		stations: StationResult[];
	}

	let { stations }: Props = $props();

	const placed = $derived(stations.filter((s) => s.latitude != null && s.longitude != null));

	/** Equirectangular projection into the viewBox, with padding. */
	const points = $derived.by(() => {
		if (placed.length === 0) return [];
		const lats = placed.map((s) => s.latitude as number);
		const lons = placed.map((s) => s.longitude as number);
		const minLat = Math.min(...lats);
		const maxLat = Math.max(...lats);
		const minLon = Math.min(...lons);
		const maxLon = Math.max(...lons);
		const spanLat = Math.max(maxLat - minLat, 0.01);
		const spanLon = Math.max(maxLon - minLon, 0.01);
		const pad = 12;

		return placed.map((station) => ({
			station,
			x: pad + (((station.longitude as number) - minLon) / spanLon) * (100 - pad * 2),
			y: pad + (1 - ((station.latitude as number) - minLat) / spanLat) * (100 - pad * 2),
			color: getCategoryStyles(station.category).color
		}));
	});

	let selected = $state<number | null>(null);
	const active = $derived(points.find((p) => p.station.eva === selected));
</script>

{#if placed.length === 0}
	<div
		class="flex h-80 flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-slate-900/60 text-white/45"
	>
		<FluentMap24Regular class="size-10 opacity-60" />
		<p class="text-sm">No coordinates available for these stations.</p>
	</div>
{:else}
	<div
		class="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 shadow-xl shadow-black/20"
	>
		<svg
			viewBox="0 0 100 100"
			preserveAspectRatio="none"
			class="h-80 w-full sm:h-96"
			role="img"
			aria-label="Map of {placed.length} stations"
		>
			{#each [20, 40, 60, 80] as line (line)}
				<line
					x1={line}
					y1="0"
					x2={line}
					y2="100"
					stroke="rgba(148,163,184,0.10)"
					stroke-width="0.3"
				/>
				<line
					x1="0"
					y1={line}
					x2="100"
					y2={line}
					stroke="rgba(148,163,184,0.10)"
					stroke-width="0.3"
				/>
			{/each}

			{#each points as point (point.station.eva)}
				<g
					role="button"
					tabindex="0"
					aria-label="Select {point.station.name}"
					class="cursor-pointer"
					onclick={() => (selected = selected === point.station.eva ? null : point.station.eva)}
					onkeydown={(event) => {
						if (event.key === 'Enter' || event.key === ' ') {
							event.preventDefault();
							selected = point.station.eva;
						}
					}}
				>
					<circle
						cx={point.x}
						cy={point.y}
						r={selected === point.station.eva ? 3.2 : 1.8}
						fill={point.color}
						stroke="rgba(6,10,18,0.85)"
						stroke-width="0.5"
						class="transition-all duration-200"
					/>
				</g>
			{/each}
		</svg>

		<div class="flex min-h-14 items-center justify-between gap-3 border-t border-white/8 px-4 py-3">
			{#if active}
				<div class="min-w-0">
					<p class="truncate text-sm font-semibold text-white">{active.station.name}</p>
					<p class="text-xs text-white/45">
						{getCategoryStyles(active.station.category).label} · {active.station.country}
					</p>
				</div>
				<button
					type="button"
					onclick={() => goto(`/station/${active.station.eva}`)}
					class="bg-signal-400 text-ink-950 hover:bg-signal-300 shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors"
				>
					Open station
				</button>
			{:else}
				<p class="text-xs text-white/40">
					{placed.length} stations plotted · select a dot for details
				</p>
			{/if}
		</div>
	</div>
{/if}
