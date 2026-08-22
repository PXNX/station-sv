<script lang="ts">
	import CookieBanner from '$lib/components/CookieBanner.svelte';
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Station Atlas</title>
	<meta
		name="description"
			content="Find practical, community-maintained information for German railway stations."
	/>
	<meta name="view-transition" content="same-origin" />
</svelte:head>

<div class="min-h-dvh w-full px-4 py-4 md:py-7">
	<div class="mx-auto flex w-full max-w-4xl flex-col">
		<header class="mb-8 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 shadow-xl shadow-black/10 backdrop-blur-md md:px-5">
			<a href="/" class="group flex min-w-0 items-center gap-3" aria-label="Station Atlas home">
				<span class="grid size-9 shrink-0 place-items-center rounded-xl bg-linear-to-br from-sky-300 to-blue-500 text-lg font-black text-slate-950 shadow-lg shadow-sky-500/15">S</span>
				<span class="min-w-0"><span class="block truncate text-sm font-bold tracking-tight text-white">Station Atlas</span><span class="block truncate text-[11px] text-white/45">Find better stops</span></span>
			</a>
			<nav class="flex items-center gap-1 text-sm" aria-label="Primary navigation">
				<a href="/" class="rounded-lg px-3 py-2 text-white/65 transition-colors hover:bg-white/10 hover:text-white">Search</a>
				<a href="/favorites" class="rounded-lg px-3 py-2 text-white/65 transition-colors hover:bg-white/10 hover:text-white">Saved</a>
				<a href="/about" class="hidden rounded-lg px-3 py-2 text-white/65 transition-colors hover:bg-white/10 hover:text-white sm:block">About</a>
			</nav>
		</header>
		<main>{@render children()}</main>
	</div>
</div>

<CookieBanner />
