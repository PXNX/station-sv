<!-- src/routes/(authorized)/station/[eva]/edit/+page.svelte -->
<script lang="ts">
	import { goto, beforeNavigate } from '$app/navigation';
	import { enhance } from '$app/forms';
	import FluentEmojiBed from '~icons/fluent-emoji/bed';
	import FluentEmojiHighVoltage from '~icons/fluent-emoji/high-voltage';
	import FluentEmojiToilet from '~icons/fluent-emoji/toilet';
	import FluentEmojiThreeOClock from '~icons/fluent-emoji/three-oclock';
	import FluentEmojiSatelliteAntenna from '~icons/fluent-emoji/satellite-antenna';
	import FluentEmojiInformation from '~icons/fluent-emoji/information';
	import { Alert, Button, Card, CheckboxField, ConfirmDialog, PageHeader, TextField } from '$lib/components/ui';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: PageData = $props();

	let isSubmitting = $state(false);
	let hasSubmitted = $state(false);
	let showUnsavedDialog = $state(false);
	let showConfirmSaveDialog = $state(false);
	let pendingNavigationUrl: string | null = null;
	let allowNavigation = $state(false);
	let formElement: HTMLFormElement;

	function normalize(value: unknown): string {
		return typeof value === 'string' ? value : (value ?? '').toString();
	}

	const station = data.station;
	const original = {
		has_warm_sleep: station.has_warm_sleep,
		sleep_notes: normalize(station.sleep_notes),
		has_outlets: station.has_outlets,
		outlet_notes: normalize(station.outlet_notes),
		has_toilets: station.has_toilets,
		toilet_notes: normalize(station.toilet_notes),
		toilets_open_at_night: station.toilets_open_at_night,
		is_open_24h: station.is_open_24h,
		opening_hours: normalize(station.opening_hours),
		has_wifi: station.has_wifi,
		wifi_has_limit: station.wifi_has_limit,
		wifi_notes: normalize(station.wifi_notes),
		additional_info: normalize(station.additional_info)
	};

	let form = $state({ ...original });

	const hasChanges = $derived(
		(Object.keys(form) as (keyof typeof form)[]).some((key) => form[key] !== original[key])
	);
	const buttonText = $derived(
		data.isAdmin ? 'Save changes' : data.hasPendingEdit ? 'Update pending edit' : 'Submit for review'
	);
	const dialogMessage = $derived(
		data.isAdmin
			? 'These changes will be applied to the station immediately.'
			: 'An administrator will review your changes before they are published.'
	);

	function goBack() {
		if (hasChanges && !hasSubmitted) {
			pendingNavigationUrl = `/station/${station.eva}`;
			showUnsavedDialog = true;
		} else {
			goto(`/station/${station.eva}`);
		}
	}

	function confirmLeave() {
		showUnsavedDialog = false;
		allowNavigation = true;
		const url = pendingNavigationUrl ?? '/';
		pendingNavigationUrl = null;
		goto(url);
	}

	beforeNavigate(({ cancel, to }) => {
		if (hasSubmitted || allowNavigation || isSubmitting) {
			allowNavigation = false;
			return;
		}
		if (hasChanges) {
			cancel();
			pendingNavigationUrl = to?.url.pathname || '/';
			showUnsavedDialog = true;
		}
	});

	function initiateSubmit() {
		if (hasChanges && !hasSubmitted) showConfirmSaveDialog = true;
	}

	function handleSubmit() {
		isSubmitting = true;
		allowNavigation = true;
		return async ({ result, update }: { result: { type: string; location?: string }; update: () => Promise<void> }) => {
			await update();
			hasSubmitted = true;
			isSubmitting = false;
			if (result.type === 'success' || result.type === 'redirect') {
				goto(`/station/${station.eva}`);
			} else if (result.location) {
				goto(result.location);
			}
		};
	}
</script>

<svelte:head>
	<title>Edit {station.name} · Station Atlas</title>
	<meta name="description" content="Suggest changes to the details for {station.name}." />
</svelte:head>

<div class="animate-fade-up mx-auto max-w-3xl">
	<Button variant="ghost" size="sm" onclick={goBack} class="mb-4 -ml-2">
		← Back to station
	</Button>

	<PageHeader
		title="Edit station details"
		icon={FluentEmojiInformation}
		eyebrow={data.isAdmin ? 'Administrator' : 'Community contribution'}
		description="{station.name} · EVA {station.eva}"
	/>

	{#if !data.isAdmin}
		<Alert tone={data.hasPendingEdit ? 'warning' : 'info'} class="mb-5">
			<strong>{data.hasPendingEdit ? 'You have a pending edit.' : 'Changes need review.'}</strong>
			{data.hasPendingEdit
				? 'The form is pre-filled with your previously submitted values.'
				: 'An administrator will review your suggestions before they go live.'}
		</Alert>
	{/if}

	<form bind:this={formElement} method="POST" use:enhance={handleSubmit} class="space-y-4">
		<Card title="Sleeping" icon={FluentEmojiBed}>
			<div class="space-y-4">
				<CheckboxField
					name="has_warm_sleep"
					label="Warm sleeping area available"
					bind:checked={form.has_warm_sleep}
				/>
				<TextField
					label="Sleep notes"
					name="sleep_notes"
					rows={3}
					placeholder="Bench locations, comfort, shelter…"
					bind:value={form.sleep_notes}
				/>
			</div>
		</Card>

		<Card title="Power outlets" icon={FluentEmojiHighVoltage}>
			<div class="space-y-4">
				<CheckboxField name="has_outlets" label="Outlets available" bind:checked={form.has_outlets} />
				<TextField
					label="Outlet notes"
					name="outlet_notes"
					rows={3}
					placeholder="Where they are, whether they work…"
					bind:value={form.outlet_notes}
				/>
			</div>
		</Card>

		<Card title="Toilets" icon={FluentEmojiToilet}>
			<div class="space-y-4">
				<CheckboxField name="has_toilets" label="Toilets available" bind:checked={form.has_toilets} />
				{#if form.has_toilets}
					<CheckboxField
						name="toilets_open_at_night"
						label="Open at night"
						bind:checked={form.toilets_open_at_night}
					/>
				{/if}
				<TextField
					label="Toilet notes"
					name="toilet_notes"
					rows={3}
					placeholder="Cleanliness, fees, accessibility…"
					bind:value={form.toilet_notes}
				/>
			</div>
		</Card>

		<Card title="Opening hours" icon={FluentEmojiThreeOClock}>
			<div class="space-y-4">
				<CheckboxField name="is_open_24h" label="Open 24/7" bind:checked={form.is_open_24h} />
				<TextField
					label="Opening hours"
					name="opening_hours"
					placeholder="e.g. 04:00 – 01:00"
					bind:value={form.opening_hours}
				/>
			</div>
		</Card>

		<Card title="WiFi" icon={FluentEmojiSatelliteAntenna}>
			<div class="space-y-4">
				<CheckboxField name="has_wifi" label="WiFi available" bind:checked={form.has_wifi} />
				{#if form.has_wifi}
					<CheckboxField
						name="wifi_has_limit"
						label="Has a data limit"
						bind:checked={form.wifi_has_limit}
					/>
				{/if}
				<TextField
					label="WiFi notes"
					name="wifi_notes"
					rows={3}
					placeholder="Network name, daily limit, reliability…"
					bind:value={form.wifi_notes}
				/>
			</div>
		</Card>

		<Card title="Anything else" icon={FluentEmojiInformation}>
			<TextField
				label="Additional information"
				name="additional_info"
				rows={4}
				placeholder="Anything else a traveler should know…"
				bind:value={form.additional_info}
			/>
		</Card>

		<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<p class="text-xs text-white/40">
				{hasChanges ? 'You have unsaved changes.' : 'No changes yet.'}
			</p>
			<Button type="button" onclick={initiateSubmit} loading={isSubmitting} disabled={!hasChanges || hasSubmitted}>
				{buttonText}
			</Button>
		</div>
	</form>
</div>

<ConfirmDialog
	bind:open={showUnsavedDialog}
	title="Leave without saving?"
	message="Your changes have not been saved yet."
	confirmLabel="Leave anyway"
	tone="danger"
	onconfirm={confirmLeave}
	oncancel={() => {
		pendingNavigationUrl = null;
	}}
/>

<ConfirmDialog
	bind:open={showConfirmSaveDialog}
	title={data.isAdmin ? 'Confirm changes' : 'Submit for review'}
	message={dialogMessage}
	confirmLabel={buttonText}
	onconfirm={() => formElement?.requestSubmit()}
/>
