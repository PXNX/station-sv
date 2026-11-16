<!-- src/routes/(admin)/pending/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import FluentEmojiCheckMark from '~icons/fluent-emoji/check-mark';
	import FluentEmojiCrossMark from '~icons/fluent-emoji/cross-mark';
	import FluentEmojiHourglass from '~icons/fluent-emoji/hourglass-not-done';
	import { Alert, Badge, Button, Card, EmptyState, PageHeader } from '$lib/components/ui';
	import { resolve } from '$app/paths';

	let { data, form } = $props();

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleString('en-GB', {
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatValue(value: unknown): string {
		if (value === null || value === undefined || value === '') return 'Not set';
		if (typeof value === 'boolean') return value ? 'Yes' : 'No';
		return String(value);
	}

	interface DiffField {
		label: string;
		oldValue: unknown;
		newValue: unknown;
		hasChanged: boolean;
	}

	function getChanges(
		edit: Record<string, unknown>,
		station: Record<string, unknown>
	): DiffField[] {
		const fields: DiffField[] = [
			['Warm sleeping area', 'hasWarmSleep', 'has_warm_sleep'],
			['Sleep notes', 'sleepNotes', 'sleep_notes'],
			['Power outlets', 'hasOutlets', 'has_outlets'],
			['Outlet notes', 'outletNotes', 'outlet_notes'],
			['Toilets', 'hasToilets', 'has_toilets'],
			['Toilet notes', 'toiletNotes', 'toilet_notes'],
			['Night toilets', 'toiletsOpenAtNight', 'toilets_open_at_night'],
			['Open 24/7', 'isOpen24h', 'is_open_24h'],
			['Opening hours', 'openingHours', 'opening_hours'],
			['WiFi', 'hasWifi', 'has_wifi'],
			['WiFi data limit', 'wifiHasLimit', 'wifi_has_limit'],
			['WiFi notes', 'wifiNotes', 'wifi_notes'],
			['Additional info', 'additionalInfo', 'additional_info']
		].map(([label, editKey, stationKey]) => ({
			label: label as string,
			oldValue: station[stationKey as string],
			newValue: edit[editKey as string],
			hasChanged:
				edit[editKey as string] !== null &&
				edit[editKey as string] !== undefined &&
				edit[editKey as string] !== station[stationKey as string]
		}));

		return fields.filter((f) => f.hasChanged);
	}
</script>

<svelte:head>
	<title>Pending edits · Station Atlas</title>
	<meta name="description" content="Review community submissions." />
</svelte:head>

<div class="animate-fade-up">
	<PageHeader
		title={data.isAdmin ? 'Pending edits' : 'My pending edits'}
		icon={FluentEmojiHourglass}
		eyebrow="Contributions"
		description={data.isAdmin
			? 'Community submissions waiting for your review.'
			: 'Your submissions are waiting for an administrator to review them.'}
	/>

	{#if form?.error}
		<Alert tone="danger" class="mb-5">{form.error}</Alert>
	{/if}

	{#if data.pendingEdits.length === 0}
		<EmptyState
			icon={FluentEmojiCheckMark}
			title="All caught up"
			description={data.isAdmin
				? 'No submissions are waiting for review.'
				: 'You have no pending edits.'}
		>
			<Button href={resolve('/')}>Find a station</Button>
		</EmptyState>
	{:else}
		<div class="space-y-5">
			{#each data.pendingEdits as { edit, station, user } (edit.id)}
				{@const changes = getChanges(edit, station)}
				<Card>
					{#snippet actions()}
						<a
							href={resolve(`/station/${station.eva}`)}
							class="text-signal-300 decoration-signal-300/40 hover:text-signal-200 text-xs font-semibold underline underline-offset-2"
						>
							View station
						</a>
					{/snippet}

					<div class="flex flex-wrap items-start justify-between gap-3">
						<div>
							<h2 class="text-xl font-bold text-white">{station.name}</h2>
							<p class="mt-1 text-xs text-white/45">
								{#if data.isAdmin}Submitted by {user.name} ·
								{/if}
								{formatDate(edit.createdAt)}
							</p>
						</div>
						<Badge tone="warning"
							>{changes.length} {changes.length === 1 ? 'change' : 'changes'}</Badge
						>
					</div>

					{#if !data.isAdmin}
						<p class="mt-3 text-xs text-amber-300">Awaiting admin review</p>
					{/if}

					<div class="mt-5 space-y-2">
						{#each changes as change (change.label)}
							<div class="rounded-xl border border-white/8 bg-white/[0.03] p-3">
								<h3 class="mb-2 text-xs font-bold text-white/80">{change.label}</h3>
								<div class="grid gap-1.5 text-xs sm:grid-cols-2">
									<div class="rounded-lg border-l-2 border-rose-400/70 bg-rose-500/8 px-3 py-2">
										<span class="mr-2 font-mono text-rose-300">−</span>
										<span class="text-white/60">{formatValue(change.oldValue)}</span>
									</div>
									<div
										class="rounded-lg border-l-2 border-emerald-400/70 bg-emerald-500/8 px-3 py-2"
									>
										<span class="mr-2 font-mono text-emerald-300">+</span>
										<span class="text-white/85">{formatValue(change.newValue)}</span>
									</div>
								</div>
							</div>
						{/each}
					</div>

					<div class="mt-5 flex flex-wrap gap-2">
						{#if data.isAdmin}
							<form method="POST" action="?/approve" use:enhance>
								<input type="hidden" name="editId" value={edit.id} />
								<Button type="submit" variant="success" size="sm">
									<FluentEmojiCheckMark class="size-4" />
									Approve
								</Button>
							</form>
							<form method="POST" action="?/reject" use:enhance>
								<input type="hidden" name="editId" value={edit.id} />
								<Button type="submit" variant="danger" size="sm">
									<FluentEmojiCrossMark class="size-4" />
									Reject
								</Button>
							</form>
						{:else}
							<form method="POST" action="?/remove" use:enhance>
								<input type="hidden" name="editId" value={edit.id} />
								<Button type="submit" variant="danger" size="sm">
									<FluentEmojiCrossMark class="size-4" />
									Cancel submission
								</Button>
							</form>
						{/if}
					</div>
				</Card>
			{/each}
		</div>
	{/if}
</div>
