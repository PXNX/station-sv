<!-- src/lib/components/ui/Button.svelte -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cx } from '$lib/design/tokens';
	import Spinner from './Spinner.svelte';

	type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
	type Size = 'sm' | 'md' | 'lg';

	interface Props {
		children: Snippet;
		variant?: Variant;
		size?: Size;
		/** Renders an anchor instead of a button. */
		href?: string;
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		loading?: boolean;
		outline?: boolean;
		block?: boolean;
		/** Opens the link in a new tab with safe rel attributes. */
		external?: boolean;
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
		title,
		label,
		class: className = '',
		onclick
	}: Props = $props();

	const variants: Record<Variant, string> = {
		primary: 'btn-primary',
		secondary: 'border-white/15 bg-white/10 text-white hover:border-white/25 hover:bg-white/20',
		ghost: 'btn-ghost text-white/80 hover:text-white',
		danger: 'btn-error',
		success: 'btn-success'
	};

	const sizes: Record<Size, string> = {
		sm: 'btn-sm',
		md: 'btn-md',
		lg: 'btn-lg'
	};

	const classes = $derived(
		cx(
			'btn gap-2',
			sizes[size],
			variants[variant],
			outline && 'btn-outline',
			block && 'btn-block',
			className
		)
	);
</script>

{#if href}
	<a
		href={disabled ? undefined : href}
		class={cx(classes, disabled && 'btn-disabled')}
		aria-disabled={disabled || undefined}
		aria-label={label}
		{title}
		target={external ? '_blank' : undefined}
		rel={external ? 'noopener noreferrer' : undefined}
		{onclick}
	>
		{#if loading}<Spinner size="sm" />{/if}
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
		{#if loading}<Spinner size="sm" />{/if}
		{@render children()}
	</button>
{/if}
