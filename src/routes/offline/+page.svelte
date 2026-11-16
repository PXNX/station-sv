<!-- src/routes/offline/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import FluentCloudOffline24Regular from '~icons/fluent/cloud-offline-24-regular';
	import { Button, Card, PageHeader } from '$lib/components/ui';
	import { favorites } from '$lib/features/favorites/state.svelte';
	import { resolve } from '$app/paths';

	let online = $state(true);

	onMount(() => {
		favorites.load();
		online = navigator.onLine;
		const setOnline = () => (online = navigator.onLine);
		window.addEventListener('online', setOnline);
		window.addEventListener('offline', setOnline);
		return () => {
			window.removeEventListener('online', setOnline);
			window.removeEventListener('offline', setOnline);
		};
	});
</script>

<svelte:head>
	<title>Offline · Station Atlas</title>
	<meta
		name="description"
		content="You are offline. Previously viewed pages and your favorites are still available."
	/>
</svelte:head>

<div class="animate-fade-up mx-auto max-w-xl">
	<PageHeader
		title="You're offline"
		icon={FluentCloudOffline24Regular}
		eyebrow="No connection"
		description="New searches need the internet. Saved stations still work."
	/>

	<Card padding="lg">
		<div class="space-y-5 text-sm leading-relaxed text-white/70">
			<p>
				Your
				<a
					href={resolve('/favorites')}
					class="text-signal-300 font-semibold underline underline-offset-2">Favorites</a
				>
				are stored on this device. Pages you opened earlier may also be available from the cache.
			</p>
			{#if favorites.count > 0}
				<p class="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white/80">
					{favorites.count}
					{favorites.count === 1 ? 'station is' : 'stations are'} saved on this device.
				</p>
			{/if}
			<div class="flex flex-wrap gap-3">
				<Button onclick={() => location.reload()} disabled={!online}>Try again</Button>
				<Button variant="secondary" href={resolve('/favorites')}>View favorites</Button>
			</div>
		</div>
	</Card>
</div>
