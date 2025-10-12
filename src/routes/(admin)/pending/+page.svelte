<script lang="ts">
	import { enhance } from '$app/forms';
	import FluentEmojiCheckMark from '~icons/fluent-emoji/check-mark';
	import FluentEmojiCrossMark from '~icons/fluent-emoji/cross-mark';

	let { data } = $props();

	function formatDate(date: Date) {
		return new Date(date).toLocaleString('DE-de');
	}

	function showChanges(edit: any) {
		const changes = [];
		if (edit.hasWarmSleep !== undefined) changes.push(`Warm Sleep: ${edit.hasWarmSleep}`);
		if (edit.sleepNotes) changes.push(`Sleep Notes: ${edit.sleepNotes}`);

		return changes.join('\n');
	}
</script>

<div class="container mx-auto max-w-6xl px-4 py-8">
	<h1 class="mb-8 text-3xl font-bold text-white">Pending Edits</h1>

	{#if data.pendingEdits.length === 0}
		<p class="text-white/70">No pending edits to review.</p>
	{:else}
		<div class="space-y-4">
			{#each data.pendingEdits as { edit, station, user }}
				<div class="rounded-lg border border-white/20 bg-white/5 p-6 backdrop-blur-sm">
					<div class="mb-4 flex items-start justify-between">
						<div>
							<h3 class="text-xl font-semibold text-white">{station.name}</h3>
							<p class="text-sm text-white/60">
								Submitted by {user.name} ({user.email}) on {formatDate(edit.createdAt)}
							</p>
						</div>
						<a href="/station/{station.eva}" class="text-blue-400 hover:text-blue-300">
							View Station
						</a>
					</div>

					<div class="mb-4 grid gap-4 md:grid-cols-2">
						<div class="rounded bg-white/5 p-4">
							<h4 class="mb-2 font-semibold text-white">Sleeping</h4>
							<p class="text-sm text-white/80">
								Warm Sleep: {edit.hasWarmSleep ? 'Yes' : 'No'}
							</p>
							{#if edit.sleepNotes}
								<p class="mt-1 text-sm text-white/60">{edit.sleepNotes}</p>
							{/if}
						</div>

						<div class="rounded bg-white/5 p-4">
							<h4 class="mb-2 font-semibold text-white">Outlets</h4>
							<p class="text-sm text-white/80">
								Available: {edit.hasOutlets ? 'Yes' : 'No'}
							</p>
							{#if edit.outletNotes}
								<p class="mt-1 text-sm text-white/60">{edit.outletNotes}</p>
							{/if}
						</div>
					</div>

					<div class="flex gap-3">
						<form method="POST" action="?/approve" use:enhance>
							<input type="hidden" name="editId" value={edit.id} />
							<button
								type="submit"
								class="flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
							>
								<FluentEmojiCheckMark class="h-5 w-5" />
								Approve
							</button>
						</form>

						<form method="POST" action="?/reject" use:enhance>
							<input type="hidden" name="editId" value={edit.id} />
							<button
								type="submit"
								class="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
							>
								<FluentEmojiCrossMark class="h-5 w-5" />
								Reject
							</button>
						</form>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
