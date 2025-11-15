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
	let imgElement: HTMLImageElement | undefined = $state();

	// Derive the current source to use
	const currentSrc = $derived.by(() => {
		if (triedFallback && fallbackSrc) {
			return fallbackSrc;
		}
		return src;
	});

	// Reset state when src changes
	$effect(() => {
		void src;
		loaded = false;
		error = false;
		triedFallback = false;
	});

	// Check if image is already loaded (cached) - run after imgElement is bound
	$effect(() => {
		if (imgElement) {
			// Check immediately if already complete
			if (imgElement.complete && imgElement.naturalHeight !== 0) {
				loaded = true;
				error = false;
			}
			// Also check after a short delay for race conditions
			else {
				const timeoutId = setTimeout(() => {
					if (imgElement && imgElement.complete && imgElement.naturalHeight !== 0) {
						loaded = true;
						error = false;
					}
				}, 0);
				return () => clearTimeout(timeoutId);
			}
		}
	});

	function handleLoad() {
		loaded = true;
		error = false;
		onload?.();
	}

	function handleError() {
		if (fallbackSrc && !triedFallback) {
			triedFallback = true;
			loaded = false;
			error = false;
			return;
		}

		loaded = false;
		error = true;
		onerror?.();
	}

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
		<img
			bind:this={imgElement}
			src={currentSrc}
			{alt}
			loading={priority ? 'eager' : 'lazy'}
			decoding="async"
			fetchpriority={priority ? 'high' : 'auto'}
			class="h-full w-full object-cover transition-opacity duration-300 {loaded
				? 'opacity-100'
				: 'opacity-0'}"
			onload={handleLoad}
			onerror={handleError}
		/>
	{/if}
</div>
