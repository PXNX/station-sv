<!-- src/lib/components/StationAmenities.svelte -->
<script lang="ts">
	import FluentEmojiBed from '~icons/fluent-emoji/bed';
	import FluentEmojiHighVoltage from '~icons/fluent-emoji/high-voltage';
	import FluentEmojiToilet from '~icons/fluent-emoji/toilet';
	import FluentEmojiTwelveOclock from '~icons/fluent-emoji/twelve-oclock';
	import FluentEmojiSatelliteAntenna from '~icons/fluent-emoji/satellite-antenna';
	import { AMENITY_STATE, type IconComponent } from '$lib/design/tokens';
	import type { Station } from '$lib/types';

	interface Props {
		station: Station;
	}

	let { station }: Props = $props();

	interface Row {
		label: string;
		value: boolean | null | undefined;
		yesLabel?: string;
		noLabel?: string;
	}

	interface Group {
		title: string;
		icon: IconComponent;
		tint: string;
		rows: Row[];
		note?: string | null;
	}

	const groups = $derived<Group[]>([
		{
			title: 'Sleeping',
			icon: FluentEmojiBed,
			tint: 'bg-amber-400/12',
			rows: [{ label: 'Warm sleeping area', value: station.has_warm_sleep }],
			note: station.sleep_notes
		},
		{
			title: 'Power',
			icon: FluentEmojiHighVoltage,
			tint: 'bg-indigo-400/12',
			rows: [{ label: 'Power outlets', value: station.has_outlets }],
			note: station.outlet_notes
		},
		{
			title: 'Toilets',
			icon: FluentEmojiToilet,
			tint: 'bg-violet-400/12',
			rows: [
				{ label: 'Toilets', value: station.has_toilets },
				{ label: 'Open at night', value: station.toilets_open_at_night }
			],
			note: station.toilet_notes
		},
		{
			title: 'Access',
			icon: FluentEmojiTwelveOclock,
			tint: 'bg-sky-400/12',
			rows: [{ label: 'Open 24/7', value: station.is_open_24h }],
			note: station.opening_hours
		},
		{
			title: 'WiFi',
			icon: FluentEmojiSatelliteAntenna,
			tint: 'bg-teal-400/12',
			rows: [
				{ label: 'Hotspot', value: station.has_wifi },
				...(station.has_wifi
					? [
							{
								label: 'Data limit',
								value: station.wifi_has_limit,
								yesLabel: 'Limited',
								noLabel: 'Unlimited'
							}
						]
					: [])
			],
			note: station.wifi_notes
		}
	]);

	function stateOf(value: boolean | null | undefined) {
		return value == null ? AMENITY_STATE.unknown : value ? AMENITY_STATE.yes : AMENITY_STATE.no;
	}
</script>

<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
	{#each groups as group (group.title)}
		<div
			class="hover-lift rounded-2xl border border-white/10 bg-slate-900/60 p-4 hover:border-white/20"
		>
			<div class="flex items-center gap-3">
				<span class="grid size-10 shrink-0 place-items-center rounded-xl {group.tint}">
					<group.icon class="size-5" />
				</span>
				<h3 class="text-sm font-bold text-white">{group.title}</h3>
			</div>

			<div class="mt-4 space-y-2">
				{#each group.rows as row (row.label)}
					{@const state = stateOf(row.value)}
					<div class="flex items-center gap-2 text-xs">
						<span class="size-1.5 shrink-0 rounded-full {state.dot}"></span>
						<span class="text-white/55">{row.label}</span>
						<span class="ml-auto font-semibold {state.text}">
							{row.value == null
								? state.label
								: row.value
									? (row.yesLabel ?? 'Yes')
									: (row.noLabel ?? 'No')}
						</span>
					</div>
				{/each}
			</div>

			{#if group.note}
				<p class="mt-3 border-t border-white/8 pt-3 text-xs leading-relaxed text-white/50">
					{group.note}
				</p>
			{/if}
		</div>
	{/each}
</div>
