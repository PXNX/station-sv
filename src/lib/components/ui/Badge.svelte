<!-- src/lib/components/ui/Badge.svelte -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { BADGE_TONE, cx, type IconComponent, type Tone } from '$lib/design/tokens';

	interface Props {
		children: Snippet;
		/** Omit and pass `class` to use a bespoke colour, e.g. station categories. */
		tone?: Tone;
		icon?: IconComponent;
		class?: string;
	}

	let { children, tone, icon: Icon, class: className = '' }: Props = $props();
</script>

<span
	class={cx(
		'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
		tone && BADGE_TONE[tone],
		className
	)}
>
	{#if Icon}<Icon class="size-3 shrink-0" />{/if}
	{@render children()}
</span>
