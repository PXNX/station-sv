<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import '../app.css';
	import AppHeader from '$lib/components/shell/AppHeader.svelte';
	import AppFooter from '$lib/components/shell/AppFooter.svelte';
	import InstallHint from '$lib/components/shell/InstallHint.svelte';
	import CookieBanner from '$lib/components/shell/CookieBanner.svelte';
	import { network } from '$lib/features/network/online.svelte';
	import FluentCloudOffline24Regular from '~icons/fluent/cloud-offline-24-regular';
	import { resolve } from '$app/paths';
	import type { LayoutData } from './$types';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();

	$effect(() => network.start());
</script>

<svelte:head>
	<title>Station Atlas</title>
	<meta
		name="description"
		content="Find train stations with the amenities that matter to you — community-maintained, open data, across Europe."
	/>
	<meta name="theme-color" content="#060a12" />
	<meta name="view-transition" content="same-origin" />
</svelte:head>

<div class="flex min-h-dvh flex-col">
	<AppHeader user={data.user} />

	{#if !network.online}
		<a
			href={resolve('/offline')}
			class="flex items-center justify-center gap-2 border-b border-amber-400/20 bg-amber-400/10 px-4 py-2 text-center text-xs font-medium text-amber-100 transition-colors hover:bg-amber-400/15"
		>
			<FluentCloudOffline24Regular class="size-4" />
			You're offline — saved stations still work.
		</a>
	{/if}

	<main class="mx-auto w-full max-w-6xl flex-1 px-4 pt-8 sm:px-6">
		{@render children()}
	</main>

	<div class="mx-auto w-full max-w-6xl px-4 sm:px-6">
		<AppFooter />
	</div>
</div>

<InstallHint />
<CookieBanner />
