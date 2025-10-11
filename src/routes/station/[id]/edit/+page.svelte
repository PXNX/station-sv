<!-- src/routes/station/[id]/edit/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { beforeNavigate } from '$app/navigation';
	import FluentArrowLeft24Regular from '~icons/fluent/arrow-left-24-regular';
	import FluentEmojiDownArrow from '~icons/fluent-emoji/down-arrow';
	import FluentEmojiBed from '~icons/fluent-emoji/bed';
	import FluentEmojiHighVoltage from '~icons/fluent-emoji/high-voltage';
	import FluentEmojiToilet from '~icons/fluent-emoji/toilet';
	import FluentEmojiThreeOClock from '~icons/fluent-emoji/three-oclock';
	import FluentEmojiInformation from '~icons/fluent-emoji/information';
	import FluentEmojiWarning from '~icons/fluent-emoji/warning';

	interface Station {
		station_id: number;
		name: string;
		city: string | null;
		country: string;
		has_warm_sleep: boolean;
		sleep_notes: string | null;
		has_outlets: boolean;
		outlet_notes: string | null;
		has_toilets: boolean;
		toilet_notes: string | null;
		toilets_open_at_night: boolean;
		is_open_24h: boolean;
		opening_hours: string | null;
		additional_info: string | null;
	}

	interface Props {
		data: {
			station: Station;
		};
	}

	let { data }: Props = $props();
	let isSubmitting = $state(false);

	// Store original values for comparison
	const originalValues = {
		has_warm_sleep: data.station.has_warm_sleep,
		sleep_notes: data.station.sleep_notes || '',
		has_outlets: data.station.has_outlets,
		outlet_notes: data.station.outlet_notes || '',
		has_toilets: data.station.has_toilets,
		toilet_notes: data.station.toilet_notes || '',
		toilets_open_at_night: data.station.toilets_open_at_night,
		is_open_24h: data.station.is_open_24h,
		opening_hours: data.station.opening_hours || '',
		additional_info: data.station.additional_info || ''
	};

	// Form state
	let formState = $state({
		has_warm_sleep: data.station.has_warm_sleep,
		sleep_notes: data.station.sleep_notes || '',
		has_outlets: data.station.has_outlets,
		outlet_notes: data.station.outlet_notes || '',
		has_toilets: data.station.has_toilets,
		toilet_notes: data.station.toilet_notes || '',
		toilets_open_at_night: data.station.toilets_open_at_night,
		is_open_24h: data.station.is_open_24h,
		opening_hours: data.station.opening_hours || '',
		additional_info: data.station.additional_info || ''
	});

	// Check if form has been modified
	const hasChanges = $derived(
		formState.has_warm_sleep !== originalValues.has_warm_sleep ||
			formState.sleep_notes !== originalValues.sleep_notes ||
			formState.has_outlets !== originalValues.has_outlets ||
			formState.outlet_notes !== originalValues.outlet_notes ||
			formState.has_toilets !== originalValues.has_toilets ||
			formState.toilet_notes !== originalValues.toilet_notes ||
			formState.toilets_open_at_night !== originalValues.toilets_open_at_night ||
			formState.is_open_24h !== originalValues.is_open_24h ||
			formState.opening_hours !== originalValues.opening_hours ||
			formState.additional_info !== originalValues.additional_info
	);

	function goBack() {
		if (hasChanges) {
			if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
				goto(`/station/${data.station.station_id}`);
			}
		} else {
			goto(`/station/${data.station.station_id}`);
		}
	}

	// Intercept navigation to warn about unsaved changes
	beforeNavigate(({ cancel }) => {
		if (hasChanges && !isSubmitting) {
			if (!confirm('You have unsaved changes. Are you sure you want to leave?')) {
				cancel();
			}
		}
	});

	function handleSubmit() {
		if (!hasChanges) {
			return;
		}

		if (!confirm('Are you sure you want to save these changes?')) {
			return ({ update }: any) => {
				// Don't proceed with submission
			};
		}

		isSubmitting = true;
		return async ({ update }: any) => {
			await update();
			isSubmitting = false;
		};
	}
</script>

<svelte:head>
	<title>Edit {data.station.name || 'Station'} - Station Details</title>
	<meta name="description" content="Edit details for {data.station.name || 'station'}" />
</svelte:head>

<div class="container mx-auto max-w-4xl px-4 py-8">
	<!-- Back Button -->
	<button
		onclick={goBack}
		type="button"
		class="group mb-6 inline-flex items-center gap-2 text-white/80 transition-colors hover:text-white"
	>
		<FluentArrowLeft24Regular class="h-5 w-5 transition-transform group-hover:-translate-x-1" />
		<span>Back to Station</span>
	</button>

	<!-- Page Header -->
	<div class="mb-8">
		<h1 class="mb-2 text-3xl font-bold text-white">Edit Station Details</h1>
		<p class="text-lg text-white/70">{data.station.name}</p>
		{#if data.station.city}
			<p class="text-sm text-white/50">{data.station.city}, {data.station.country}</p>
		{/if}
	</div>

	<!-- Edit Form -->
	<form method="POST" use:enhance={handleSubmit} class="space-y-6">
		<!-- Sleeping Section -->
		<div class="rounded-lg border border-white/20 bg-white/5 p-6 backdrop-blur-sm">
			<h2 class="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
				<FluentEmojiBed class="h-6 w-6" />
				<span>Sleeping Facilities</span>
			</h2>

			<label class="mb-4 flex cursor-pointer items-center gap-3">
				<input
					type="checkbox"
					name="has_warm_sleep"
					bind:checked={formState.has_warm_sleep}
					class="h-5 w-5 rounded border-white/40 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-400"
				/>
				<span class="text-white">Warm sleeping area available</span>
			</label>

			<div>
				<label for="sleep_notes" class="mb-2 block text-sm font-medium text-white/80">
					Sleep Notes
				</label>
				<textarea
					id="sleep_notes"
					name="sleep_notes"
					rows="3"
					bind:value={formState.sleep_notes}
					class="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/50 backdrop-blur-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-400/50 focus:outline-none"
					placeholder="Describe sleeping conditions, bench locations, comfort level..."
				></textarea>
			</div>
		</div>

		<!-- Outlets Section -->
		<div class="rounded-lg border border-white/20 bg-white/5 p-6 backdrop-blur-sm">
			<h2 class="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
				<FluentEmojiHighVoltage class="h-6 w-6" />
				<span>Power Outlets</span>
			</h2>

			<label class="mb-4 flex cursor-pointer items-center gap-3">
				<input
					type="checkbox"
					name="has_outlets"
					bind:checked={formState.has_outlets}
					class="h-5 w-5 rounded border-white/40 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-400"
				/>
				<span class="text-white">Outlets available</span>
			</label>

			<div>
				<label for="outlet_notes" class="mb-2 block text-sm font-medium text-white/80">
					Outlet Notes
				</label>
				<textarea
					id="outlet_notes"
					name="outlet_notes"
					rows="3"
					bind:value={formState.outlet_notes}
					class="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/50 backdrop-blur-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-400/50 focus:outline-none"
					placeholder="Describe outlet locations, accessibility, charging conditions..."
				></textarea>
			</div>
		</div>

		<!-- Toilets Section -->
		<div class="rounded-lg border border-white/20 bg-white/5 p-6 backdrop-blur-sm">
			<h2 class="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
				<FluentEmojiToilet class="h-6 w-6" />
				<span>Toilet Facilities</span>
			</h2>

			<label class="mb-3 flex cursor-pointer items-center gap-3">
				<input
					type="checkbox"
					name="has_toilets"
					bind:checked={formState.has_toilets}
					class="h-5 w-5 rounded border-white/40 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-400"
				/>
				<span class="text-white">Toilets available</span>
			</label>

			<label class="mb-4 flex cursor-pointer items-center gap-3">
				<input
					type="checkbox"
					name="toilets_open_at_night"
					bind:checked={formState.toilets_open_at_night}
					class="h-5 w-5 rounded border-white/40 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-400"
				/>
				<span class="text-white">Toilets open at night</span>
			</label>

			<div>
				<label for="toilet_notes" class="mb-2 block text-sm font-medium text-white/80">
					Toilet Notes
				</label>
				<textarea
					id="toilet_notes"
					name="toilet_notes"
					rows="3"
					bind:value={formState.toilet_notes}
					class="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/50 backdrop-blur-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-400/50 focus:outline-none"
					placeholder="Describe cleanliness, fees, location, accessibility..."
				></textarea>
			</div>
		</div>

		<!-- Opening Hours Section -->
		<div class="rounded-lg border border-white/20 bg-white/5 p-6 backdrop-blur-sm">
			<h2 class="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
				<FluentEmojiThreeOClock class="h-6 w-6" />
				<span>Opening Hours</span>
			</h2>

			<label class="mb-4 flex cursor-pointer items-center gap-3">
				<input
					type="checkbox"
					name="is_open_24h"
					bind:checked={formState.is_open_24h}
					class="h-5 w-5 rounded border-white/40 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-400"
				/>
				<span class="text-white">Open 24/7</span>
			</label>

			<div>
				<label for="opening_hours" class="mb-2 block text-sm font-medium text-white/80">
					Opening Hours
				</label>
				<input
					type="text"
					id="opening_hours"
					name="opening_hours"
					bind:value={formState.opening_hours}
					class="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/50 backdrop-blur-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-400/50 focus:outline-none"
					placeholder="e.g., 04:00 - 01:00 or Open 24 hours"
				/>
			</div>
		</div>

		<!-- Additional Information -->
		<div class="rounded-lg border border-white/20 bg-white/5 p-6 backdrop-blur-sm">
			<h2 class="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
				<FluentEmojiInformation class="h-6 w-6" />
				<span>Additional Information</span>
			</h2>

			<div>
				<label for="additional_info" class="mb-2 block text-sm font-medium text-white/80">
					Additional Notes
				</label>
				<textarea
					id="additional_info"
					name="additional_info"
					rows="4"
					bind:value={formState.additional_info}
					class="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/50 backdrop-blur-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-400/50 focus:outline-none"
					placeholder="Any other useful information about the station..."
				></textarea>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
			<button
				type="submit"
				class="flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
				disabled={isSubmitting || !hasChanges}
				title={!hasChanges ? 'No changes to save' : ''}
			>
				{#if isSubmitting}
					<span
						class="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
					></span>
					<span>Saving...</span>
				{:else}
					<FluentEmojiDownArrow class="h-5 w-5" />
					<span>Save Changes</span>
				{/if}
			</button>
		</div>

		{#if hasChanges}
			<p class="flex items-center justify-center gap-2 text-center text-sm text-yellow-400/80">
				<FluentEmojiWarning class="h-5 w-5" />
				<span>You have unsaved changes</span>
			</p>
		{/if}
	</form>
</div>
