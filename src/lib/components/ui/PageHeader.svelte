<!-- src/lib/components/ui/PageHeader.svelte -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cx, type IconComponent } from '$lib/design/tokens';

	interface Props {
		title: string;
		/** Plain-text subtitle. Use `children` instead when it needs markup. */
		description?: string;
		icon?: IconComponent;
		align?: 'center' | 'start';
		/** Subtitle content; takes precedence over `description`. */
		children?: Snippet;
		class?: string;
	}

	let {
		title,
		description,
		icon: Icon,
		align = 'center',
		children,
		class: className = ''
	}: Props = $props();
</script>

	<header class={cx('mb-7', align === 'center' ? 'text-center' : '', className)}>
		{#if Icon}
			<div class={cx('mb-4 flex', align === 'center' ? 'justify-center' : '')}>
				<div class="grid size-14 place-items-center rounded-2xl border border-white/12 bg-white/7 shadow-lg shadow-black/10"><Icon class="size-8" /></div>
			</div>
		{/if}
		<h1 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1>
	{#if children}
		<p class="mt-2 text-sm text-white/70">{@render children()}</p>
	{:else if description}
		<p class="mt-2 text-sm text-white/70">{description}</p>
	{/if}
</header>
