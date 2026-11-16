<!-- src/lib/components/ui/IconButton.svelte -->
<script lang="ts">
	import { cx, ICON_BUTTON_BASE, type IconComponent } from '$lib/design/tokens';

	interface Props {
		icon: IconComponent;
		/** Required — this button has no visible text. */
		label: string;
		href?: string;
		disabled?: boolean;
		/** Highlights the icon, e.g. an active favorite. */
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
		cx(ICON_BUTTON_BASE, active && 'border-rose-400/40 bg-rose-500/15', className)
	);
</script>

{#if href}
	<a href={disabled ? undefined : href} class={classes} aria-label={label} title={label} {onclick}>
		<Icon class={cx('size-5', active && 'text-rose-300', iconClass)} />
	</a>
{:else}
	<button type="button" class={classes} aria-label={label} title={label} {disabled} {onclick}>
		<Icon class={cx('size-5', active && 'text-rose-300', iconClass)} />
	</button>
{/if}
