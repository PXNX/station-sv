<!-- src/lib/components/ui/PageHeader.svelte -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cx, type IconComponent } from '$lib/design/tokens';

	interface Props {
		title: string;
		/** Plain-text subtitle. Use `children` instead when it needs markup. */
		description?: string;
		/** Small label above the title. */
		eyebrow?: string;
		icon?: IconComponent;
		align?: 'center' | 'start';
		/** Subtitle content; takes precedence over `description`. */
		children?: Snippet;
		actions?: Snippet;
		class?: string;
	}

	let {
		title,
		description,
		eyebrow,
		icon: Icon,
		align = 'start',
		children,
		actions,
		class: className = ''
	}: Props = $props();
</script>

<header
	class={cx(
		'mb-8 flex flex-col gap-5 border-b border-white/8 pb-6 sm:flex-row sm:items-end sm:justify-between',
		align === 'center' && 'sm:flex-col sm:items-center sm:text-center',
		className
	)}
>
	<div class={cx('min-w-0', align === 'center' && 'flex flex-col items-center')}>
		{#if eyebrow}<p class="eyebrow mb-2">{eyebrow}</p>{/if}
		<div class="flex items-start gap-4">
			{#if Icon}
				<div
					class="grid size-12 shrink-0 place-items-center rounded-2xl border border-signal-400/25 bg-signal-400/10 text-signal-300"
				>
					<Icon class="size-6" />
				</div>
			{/if}
			<div>
				<h1 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1>
				{#if children}
					<p class="mt-2 text-sm text-white/60">{@render children()}</p>
				{:else if description}
					<p class="mt-2 text-sm text-white/60">{description}</p>
				{/if}
			</div>
		</div>
	</div>
	{#if actions}
		<div class={cx('flex shrink-0 items-center gap-2', align === 'center' && 'justify-center')}>
			{@render actions()}
		</div>
	{/if}
</header>
