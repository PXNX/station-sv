<!-- src/lib/components/ui/EmptyState.svelte -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { IconComponent } from '$lib/design/tokens';
	import Card from './Card.svelte';

	interface Props {
		title: string;
		description?: string;
		icon?: IconComponent;
		/** Optional call to action, e.g. a Button. */
		children?: Snippet;
		class?: string;
	}

	let { title, description, icon: Icon, children, class: className = '' }: Props = $props();
</script>

<Card padding="none" class={className}>
	<div class="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
		{#if Icon}<Icon class="size-14" />{/if}
		<h3 class="text-xl font-bold text-white">{title}</h3>
		{#if description}
			<p class="max-w-md text-white/60">{description}</p>
		{/if}
		{#if children}
			<div class="mt-2">{@render children()}</div>
		{/if}
	</div>
</Card>
