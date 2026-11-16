<!-- src/lib/components/ui/Button.svelte -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		BUTTON_BASE,
		BUTTON_SIZES,
		BUTTON_VARIANTS,
		cx,
		type IconComponent
	} from '$lib/design/tokens';
	import Spinner from './Spinner.svelte';

	type Variant = keyof typeof BUTTON_VARIANTS;
	type Size = keyof typeof BUTTON_SIZES;

	interface Props {
		children: Snippet;
		variant?: Variant;
		size?: Size;
		/** Renders an anchor instead of a button. */
		href?: string;
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		loading?: boolean;
		/** Adds an outline treatment to secondary and danger buttons. */
		outline?: boolean;
		block?: boolean;
		/** Opens the link in a new tab with safe rel attributes. */
		external?: boolean;
		icon?: IconComponent;
		title?: string;
		label?: string;
		class?: string;
		onclick?: (event: MouseEvent) => void;
	}

	let {
		children,
		variant = 'primary',
		size = 'md',
		href,
		type = 'button',
		disabled = false,
		loading = false,
		outline = false,
		block = false,
		external = false,
		icon: Icon,
		title,
		label,
		class: className = '',
		onclick
	}: Props = $props();

	const classes = $derived(
		cx(
			BUTTON_BASE,
			BUTTON_SIZES[size],
			BUTTON_VARIANTS[variant],
			outline && 'bg-transparent',
			block && 'w-full',
			className
		)
	);
</script>

{#if href}
	<a
		href={disabled ? undefined : href}
		class={classes}
		aria-disabled={disabled || undefined}
		aria-label={label}
		{title}
		target={external ? '_blank' : undefined}
		rel={external ? 'noopener noreferrer' : undefined}
		{onclick}
	>
		{#if loading}<Spinner size="xs" />{:else if Icon}<Icon class="size-4" />{/if}
		{@render children()}
	</a>
{:else}
	<button
		{type}
		class={classes}
		disabled={disabled || loading}
		aria-label={label}
		{title}
		{onclick}
	>
		{#if loading}<Spinner size="xs" />{:else if Icon}<Icon class="size-4" />{/if}
		{@render children()}
	</button>
{/if}
