<!-- src/lib/components/ui/IconButton.svelte -->
<script lang="ts">
	import { cx, type IconComponent } from '$lib/design/tokens';

	interface Props {
		icon: IconComponent;
		/** Required — this button has no visible text. */
		label: string;
		href?: string;
		disabled?: boolean;
		/** Highlights the icon, e.g. an active favourite. */
		active?: boolean;
		class?: string;
		iconClass?: string;
		onclick?: (event: MouseEvent) => void;
	}

	let {
		icon: Icon,
		label,
		href,
		disabled = false,
		active = false,
		class: className = '',
		iconClass = '',
		onclick
	}: Props = $props();

	const classes = $derived(
		cx(
			'btn btn-circle border border-white/12 bg-white/8 text-white transition-colors hover:border-white/25 hover:bg-white/18',
			className
		)
	);
</script>

{#if href}
	<a href={disabled ? undefined : href} class={classes} aria-label={label} title={label} {onclick}>
		<Icon class={cx('size-5', active && 'text-rose-400', iconClass)} />
	</a>
{:else}
	<button type="button" class={classes} aria-label={label} title={label} {disabled} {onclick}>
		<Icon class={cx('size-5', active && 'text-rose-400', iconClass)} />
	</button>
{/if}
