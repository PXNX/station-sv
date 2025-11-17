<!-- src/lib/components/StationCard.svelte -->
<script lang="ts">
	import FluentArrowRight24Regular from '~icons/fluent/arrow-right-24-regular';
	import FluentEmojiHighVoltage from '~icons/fluent-emoji/high-voltage';
	import FluentEmojiToilet from '~icons/fluent-emoji/toilet';
	import FluentEmojiFire from '~icons/fluent-emoji/fire';
	import FluentEmojiCrescentMoon from '~icons/fluent-emoji/crescent-moon';
	import FluentEmojiRedCircle from '~icons/fluent-emoji/red-circle';
	import FluentEmojiGreenCircle from '~icons/fluent-emoji/green-circle';
	import FluentEmojiWifi from '~icons/fluent-emoji/antenna-bars';
	import { getCategoryStyles } from '$lib/client/categories';
	import PreviewImage from '$lib/components/PreviewImage.svelte';
	import type { StationResult } from '$lib/types';

	interface Props {
		station: StationResult;
	}

	let { station }: Props = $props();

	const categoryStyles = $derived(getCategoryStyles(station.category));
</script>

<a
	href={`/station/${station.eva}`}
	class="card group overflow-hidden border backdrop-blur-md transition-all duration-300 hover:scale-[1.02] {categoryStyles.cardClass}"
	style="view-transition-name: station-{station.eva}"
>
	<div class="card-body p-0">
		<div class="flex flex-1 items-start gap-4 p-4">
			<!-- Station Photo/Icon -->
			<div class="shrink-0" style="view-transition-name: icon-{station.eva}">
				<PreviewImage src={station.photoUrl} alt={station.name} class="size-16" />
			</div>

			<!-- Station Info -->
			<div class="grow">
				<div class="mb-1 flex items-center gap-2">
					<h3
						class="text-lg font-bold text-white transition-colors duration-200 group-hover:text-blue-100"
					>
						{station.name}
					</h3>
				</div>

				<div class="text-sm text-white/70 transition-colors duration-200 group-hover:text-white/90">
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
			</div>

			<!-- Arrow -->
			<div class="flex shrink-0 items-center">
				<FluentArrowRight24Regular
					class="size-8 text-white/60 transition-all duration-300 group-hover:translate-x-2 group-hover:scale-110 group-hover:text-white"
				/>
			</div>
		</div>
	</div>
</a>
