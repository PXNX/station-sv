<script lang="ts">
	import CookieBanner from '$lib/components/CookieBanner.svelte';
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Train Station Search</title>
	<meta
		name="description"
		content="Search for train stations in Germany. Find sleeping spots, outlets, toilets & station info"
	/>
	<meta name="view-transition" content="same-origin" />
</svelte:head>

<div class="flex min-h-dvh w-full justify-center px-4 py-6 md:py-10">
	<div class="flex w-full max-w-3xl flex-col">
		{@render children()}
	</div>
</div>

<CookieBanner />
