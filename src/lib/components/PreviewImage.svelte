<!-- src/lib/components/PreviewImage.svelte -->
<script lang="ts">
	import IconLocation from '~icons/fluent/location-24-regular';
	import FluentEmojiStation from '~icons/fluent-emoji/station';

	interface Props {
		src: string | null | undefined;
		alt: string;
		class?: string;
	}

	let { src, alt, class: className = '' }: Props = $props();

	let loaded = $state(false);
	let error = $state(false);
	let img: HTMLImageElement | undefined = $state();

	// Single effect for cache check - runs once when img is bound
	$effect(() => {
		if (img?.complete && img.naturalHeight > 0) {
			loaded = true;
		}
	});

	// Reset on src change
	$effect(() => {
		void src;
		loaded = false;
		error = false;
	});

	const shouldShow = $derived(!!src && !error);
</script>

<div class="relative overflow-hidden rounded-2xl {className}">
	{#if shouldShow}
		<img
			bind:this={img}
			{src}
			{alt}
			loading="lazy"
			decoding="async"
			class="size-full object-cover {loaded ? 'opacity-100' : 'opacity-0'}"
			onload={() => (loaded = true)}
			onerror={() => (error = true)}
		/>
		{#if !loaded}
			<div class="absolute inset-0 flex items-center justify-center bg-white/5">
				<IconLocation class="size-8 opacity-30" />
			</div>
		{/if}
	{:else}
		<div
			class="flex size-full items-center justify-center bg-linear-to-br from-blue-400 to-teal-500"
		>
			<FluentEmojiStation class="size-10" />
		</div>
	{/if}
</div>
