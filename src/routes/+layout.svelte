<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import '../app.css';
	import AppHeader from '$lib/components/shell/AppHeader.svelte';
	import AppFooter from '$lib/components/shell/AppFooter.svelte';
	import InstallHint from '$lib/components/shell/InstallHint.svelte';
	import CookieBanner from '$lib/components/shell/CookieBanner.svelte';
	import type { LayoutData } from './$types';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();
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

	<main class="mx-auto w-full max-w-6xl flex-1 px-4 pt-8 sm:px-6">
		{@render children()}
	</main>

	<div class="mx-auto w-full max-w-6xl px-4 sm:px-6">
		<AppFooter />
	</div>
</div>

<InstallHint />
<CookieBanner />
