<!-- src/lib/components/OptimizedLocationImage.svelte -->
<script lang="ts">
	import IconLocation from '~icons/fluent/location-24-regular';
	import IconImageOff from '~icons/fluent/image-off-24-regular';

	interface Props {
		src: string | null | undefined;
		alt: string;
		priority?: boolean;
		class?: string;
		onload?: () => void;
		onerror?: () => void;
		fallbackSrc?: string;
	}

	let {
		src,
		alt,
		priority = false,
		class: className = '',
		onload,
		onerror,
		fallbackSrc
	}: Props = $props();

	let loaded = $state(false);
	let error = $state(false);
	let triedFallback = $state(false);

	// Derive the current source to use
	const currentSrc = $derived.by(() => {
		// If we've tried fallback and have one, use it
		if (triedFallback && fallbackSrc) {
			return fallbackSrc;
		}
		// Otherwise use the original src
		return src;
	});

	// Reset state when src changes
	$effect(() => {
		void src; // Track src changes
		loaded = false;
		error = false;
		triedFallback = false;
	});

	function handleLoad() {
		loaded = true;
		error = false;
		onload?.();
	}

	function handleError() {
		// Try fallback if available and not yet tried
		if (fallbackSrc && !triedFallback) {
			triedFallback = true;
			// Reset states to try again with fallback
			loaded = false;
			error = false;
			return;
		}

		loaded = false;
		error = true;
		onerror?.();
	}

	// Determine if we should show the image
	const shouldShowImage = $derived(!error && currentSrc !== null && currentSrc !== undefined);
</script>

<div class="relative {className}">
	{#if !loaded && !error && shouldShowImage}
		<div class="bg-base-200 absolute inset-0 flex items-center justify-center">
			<IconLocation class="text-base-content/20 size-12 animate-pulse" />
		</div>
	{/if}

	{#if error || !shouldShowImage}
		<div
			class="from-primary/20 via-secondary/10 to-accent/10 absolute inset-0 flex items-center justify-center bg-linear-to-br"
		>
			<IconImageOff class="text-error/40 size-20" />
		</div>
	{:else}
		{#key currentSrc}
			<img
				src={currentSrc}
				{alt}
				loading={priority ? 'eager' : 'lazy'}
				decoding="async"
				class="h-full w-full object-cover transition-opacity duration-300 {loaded
					? 'opacity-100'
					: 'opacity-0'}"
				onload={handleLoad}
				onerror={handleError}
			/>
		{/key}
	{/if}
</div>
