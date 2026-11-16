<!-- src/routes/offline/+page.svelte -->
<script lang="ts">
	import FluentCloudOffline24Regular from '~icons/fluent/cloud-offline-24-regular';
	import { Button, Card, PageHeader } from '$lib/components/ui';
	import { favorites } from '$lib/features/favorites/state.svelte';
	import { network } from '$lib/features/network/online.svelte';
	import { resolve } from '$app/paths';

	$effect(() => {
		favorites.load();
		network.start();
	});
</script>

<svelte:head>
	<title>Offline · Station Atlas</title>
	<meta name="description" content="Saved stations are still available offline." />
</svelte:head>

<div class="animate-fade-up mx-auto max-w-lg">
	<PageHeader
		title="You're offline"
		icon={FluentCloudOffline24Regular}
		description="New searches need a connection. Your saved stations are still here."
	/>

	<Card padding="lg">
		<div class="space-y-5 text-sm leading-relaxed text-white/70">
			<p>
				<a
					href={resolve('/favorites')}
					class="text-signal-300 font-semibold underline underline-offset-2"
				>
					Favorites
				</a>
				are stored on this device. Pages you opened earlier may still work from the cache.
			</p>

			{#if favorites.count > 0}
				<p class="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white/80">
					{favorites.count} saved {favorites.count === 1 ? 'station' : 'stations'} available.
				</p>
			{/if}

			<div class="flex flex-wrap gap-3">
				<Button onclick={() => location.reload()} disabled={!network.online}>Try again</Button>
				<Button variant="secondary" href={resolve('/favorites')}>View favorites</Button>
			</div>
		</div>
	</Card>
</div>
