<!-- src/lib/components/ui/Card.svelte -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cx, SURFACE_INSET, SURFACE_PANEL, type IconComponent } from '$lib/design/tokens';

	interface Props {
		children: Snippet;
		/** `panel` sits on the page background, `inset` nests inside a panel. */
		variant?: 'panel' | 'inset';
		padding?: 'none' | 'sm' | 'md' | 'lg';
		title?: string;
		titleSize?: 'sm' | 'md' | 'lg';
		icon?: IconComponent;
		/** Rendered on the opposite side of the title. */
		actions?: Snippet;
		as?: 'div' | 'section' | 'article';
		class?: string;
	}

	let {
		children,
		variant = 'panel',
		padding = 'md',
		title,
		titleSize = 'sm',
		icon: Icon,
		actions,
		as = 'div',
		class: className = ''
	}: Props = $props();

	const surfaces = { panel: SURFACE_PANEL, inset: SURFACE_INSET } as const;
	const paddings = { none: '', sm: 'p-3', md: 'p-4 md:p-6', lg: 'p-6 md:p-8' } as const;
	const titleSizes = { sm: 'text-base', md: 'text-xl', lg: 'text-2xl' } as const;
</script>

<svelte:element this={as} class={cx(surfaces[variant], paddings[padding], className)}>
	{#if title || actions}
		<div class="mb-3 flex items-center justify-between gap-3">
			{#if title}
				<h2 class={cx('flex items-center gap-2 font-semibold text-white', titleSizes[titleSize])}>
					{#if Icon}<Icon class="size-5 shrink-0" />{/if}
					<span>{title}</span>
				</h2>
			{/if}
			{#if actions}
				<div class="flex shrink-0 items-center gap-2">{@render actions()}</div>
			{/if}
		</div>
	{/if}
	{@render children()}
</svelte:element>
