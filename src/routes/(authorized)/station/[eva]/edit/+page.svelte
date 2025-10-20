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
	import FluentEmojiSatelliteAntenna from '~icons/fluent-emoji/satellite-antenna';
	import type { Station } from '$lib/types';

	interface Props {
		data: {
			station: Station;
			originalStation: any;
			isAdmin: boolean;
			hasPendingEdit: boolean;
			pendingEditId: number | null;
		};
	}

	let { data }: Props = $props();
	let isSubmitting = $state(false);
	let hasSubmitted = $state(false);

	// Dialog states
	let showUnsavedDialog = $state(false);
	let showConfirmSaveDialog = $state(false);
	let pendingNavigation: (() => void) | null = null;

	// Helper function to normalize values (null/undefined to empty string)
	function normalize(value: any): string | boolean {
		if (typeof value === 'boolean') return value;
		return value ?? '';
	}

	// Store original values for comparison (from the station data which already includes pending edits)
	const originalValues = {
		has_warm_sleep: data.station.has_warm_sleep,
		sleep_notes: normalize(data.station.sleep_notes),
		has_outlets: data.station.has_outlets,
		outlet_notes: normalize(data.station.outlet_notes),
		has_toilets: data.station.has_toilets,
		toilet_notes: normalize(data.station.toilet_notes),
		toilets_open_at_night: data.station.toilets_open_at_night,
		is_open_24h: data.station.is_open_24h,
		opening_hours: normalize(data.station.opening_hours),
		has_wifi: data.station.has_wifi,
		wifi_has_limit: data.station.wifi_has_limit,
		wifi_notes: normalize(data.station.wifi_notes),
		additional_info: normalize(data.station.additional_info)
	};

	// Form state
	let formState = $state({
		has_warm_sleep: data.station.has_warm_sleep,
		sleep_notes: normalize(data.station.sleep_notes),
		has_outlets: data.station.has_outlets,
		outlet_notes: normalize(data.station.outlet_notes),
		has_toilets: data.station.has_toilets,
		toilet_notes: normalize(data.station.toilet_notes),
		toilets_open_at_night: data.station.toilets_open_at_night,
		is_open_24h: data.station.is_open_24h,
		opening_hours: normalize(data.station.opening_hours),
		has_wifi: data.station.has_wifi,
		wifi_has_limit: data.station.wifi_has_limit,
		wifi_notes: normalize(data.station.wifi_notes),
		additional_info: normalize(data.station.additional_info)
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
			formState.has_wifi !== originalValues.has_wifi ||
			formState.wifi_has_limit !== originalValues.wifi_has_limit ||
			formState.wifi_notes !== originalValues.wifi_notes ||
			formState.additional_info !== originalValues.additional_info
	);

	// Determine button text based on admin status and pending edit
	// 'Update Pending Change' shows when user is editing their existing pending edit
	const buttonText = $derived(
		data.isAdmin ? 'Save Changes' : data.hasPendingEdit ? 'Update Pending Change' : 'Submit Changes'
	);

	function goBack() {
		if (hasChanges && !hasSubmitted) {
			pendingNavigation = () => goto(`/station/${data.station.eva}`);
			showUnsavedDialog = true;
		} else {
			goto(`/station/${data.station.eva}`);
		}
	}

	function confirmLeave() {
		showUnsavedDialog = false;
		if (pendingNavigation) {
			pendingNavigation();
			pendingNavigation = null;
		}
	}

	function cancelLeave() {
		showUnsavedDialog = false;
		pendingNavigation = null;
	}

	// Intercept navigation to warn about unsaved changes
	beforeNavigate(({ cancel }) => {
		if (hasChanges && !isSubmitting && !hasSubmitted) {
			cancel();
			pendingNavigation = null;
			showUnsavedDialog = true;
		}
	});

	let formElement: HTMLFormElement;

	function initiateSubmit() {
		if (!hasChanges || hasSubmitted) {
			return;
		}
		showConfirmSaveDialog = true;
	}

	function confirmSave() {
		showConfirmSaveDialog = false;
		if (formElement) {
			formElement.requestSubmit();
		}
	}

	function cancelSave() {
		showConfirmSaveDialog = false;
	}

	function handleSubmit() {
		isSubmitting = true;
		return async ({ result, update }: any) => {
			await update();
			hasSubmitted = true;
			isSubmitting = false;

			// Redirect on success
			if (result.type === 'redirect') {
				goto(result.location);
			}
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
		<p class="text-sm text-white/50">
			#{data.station.eva} ·
			{#if data.station.city}
				{data.station.city}, {data.station.country}
			{/if}
		</p>
		{#if !data.isAdmin}
			{#if data.hasPendingEdit}
				<div class="mt-4 rounded-lg border border-yellow-400/30 bg-yellow-500/10 p-3">
					<p class="text-sm text-yellow-300">
						<FluentEmojiWarning class="inline h-4 w-4" />
						You are editing your pending changes. The form has been pre-filled with your previously submitted
						values.
					</p>
				</div>
			{:else}
				<div class="mt-4 rounded-lg border border-blue-400/30 bg-blue-500/10 p-3">
					<p class="text-sm text-blue-300">
						<FluentEmojiInformation class="inline h-4 w-4" />
						Your changes will be reviewed by administrators before being applied to the station.
					</p>
				</div>
			{/if}
		{/if}
	</div>

	<!-- Edit Form -->
	<form bind:this={formElement} method="POST" use:enhance={handleSubmit} class="space-y-6">
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

		<!-- WiFi Section -->
		<div class="rounded-lg border border-white/20 bg-white/5 p-6 backdrop-blur-sm">
			<h2 class="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
				<FluentEmojiSatelliteAntenna class="h-6 w-6" />
				<span>WiFi Hotspot</span>
			</h2>

			<label class="mb-4 flex cursor-pointer items-center gap-3">
				<input
					type="checkbox"
					name="has_wifi"
					bind:checked={formState.has_wifi}
					class="h-5 w-5 rounded border-white/40 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-400"
				/>
				<span class="text-white">WiFi available</span>
			</label>

			{#if formState.has_wifi}
				<label class="mb-4 flex cursor-pointer items-center gap-3">
					<input
						type="checkbox"
						name="wifi_has_limit"
						bind:checked={formState.wifi_has_limit}
						class="h-5 w-5 rounded border-white/40 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-400"
					/>
					<span class="text-white">WiFi has data usage limit</span>
				</label>
			{/if}

			<div>
				<label for="wifi_notes" class="mb-2 block text-sm font-medium text-white/80">
					WiFi Notes
				</label>
				<textarea
					id="wifi_notes"
					name="wifi_notes"
					rows="3"
					bind:value={formState.wifi_notes}
					class="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/50 backdrop-blur-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-400/50 focus:outline-none"
					placeholder="Describe WiFi network name, data limits (e.g., 100MB per day), speed, reliability..."
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

			{#if formState.has_toilets}
				<label class="mb-4 flex cursor-pointer items-center gap-3">
					<input
						type="checkbox"
						name="toilets_open_at_night"
						bind:checked={formState.toilets_open_at_night}
						class="h-5 w-5 rounded border-white/40 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-400"
					/>
					<span class="text-white">Toilets open at night</span>
				</label>
			{/if}

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
				type="button"
				onclick={initiateSubmit}
				class="flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
				disabled={isSubmitting || !hasChanges || hasSubmitted}
				title={!hasChanges ? 'No changes to save' : hasSubmitted ? 'Already submitted' : ''}
			>
				{#if isSubmitting}
					<span
						class="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
					></span>
					<span>Saving...</span>
				{:else}
					<FluentEmojiDownArrow class="h-5 w-5" />
					<span>{buttonText}</span>
				{/if}
			</button>
		</div>

		{#if hasChanges && !hasSubmitted}
			<p class="flex items-center justify-center gap-2 text-center text-sm text-yellow-400/80">
				<FluentEmojiWarning class="h-5 w-5" />
				<span>You have unsaved changes</span>
			</p>
		{/if}
	</form>
</div>
<!-- Unsaved Changes Dialog -->
{#if showUnsavedDialog}
	<dialog class="modal modal-open" open>
		<div class="modal-box bg-gray-800 text-white">
			<h3 class="text-lg font-bold">Unsaved Changes</h3>
			<p class="py-4">You have unsaved changes. Are you sure you want to leave?</p>
			<div class="modal-action">
				<button onclick={cancelLeave} type="button" class="btn btn-ghost">Cancel</button>
				<button onclick={confirmLeave} type="button" class="btn btn-error"
					>Leave Without Saving</button
				>
			</div>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button onclick={cancelLeave} type="button">close</button>
		</form>
	</dialog>
{/if}

<!-- Confirm Save Dialog -->
{#if showConfirmSaveDialog}
	<dialog class="modal modal-open" open>
		<div class="modal-box bg-gray-800 text-white">
			<h3 class="text-lg font-bold">
				{data.isAdmin
					? 'Confirm Changes'
					: data.hasPendingEdit
						? 'Update Pending Changes'
						: 'Submit for Review'}
			</h3>
			<p class="py-4">
				{#if data.isAdmin}
					Are you sure you want to save these changes? They will be applied immediately.
				{:else if data.hasPendingEdit}
					Are you sure you want to update your pending changes? Your previous submission will be
					replaced with these new values.
				{:else}
					Are you sure you want to submit these changes? An administrator will review them before
					they are applied.
				{/if}
			</p>
			<div class="modal-action">
				<button onclick={cancelSave} type="button" class="btn btn-ghost">Cancel</button>
				<button onclick={confirmSave} type="button" class="btn btn-primary">
					{data.isAdmin
						? 'Save Changes'
						: data.hasPendingEdit
							? 'Update Pending Changes'
							: 'Submit for Review'}
				</button>
			</div>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button onclick={cancelSave} type="button">close</button>
		</form>
	</dialog>
{/if}
