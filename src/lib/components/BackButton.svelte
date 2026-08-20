<!-- src/lib/components/BackButton.svelte -->
<script lang="ts">
	import FluentArrowLeft24Regular from '~icons/fluent/arrow-left-24-regular';
	import { cx } from '$lib/design/tokens';

	interface Props {
		/** Omit and pass `onclick` when navigation needs to be intercepted. */
		href?: string;
		label?: string;
		class?: string;
		onclick?: (event: MouseEvent) => void;
	}

	let { href, label = 'Back', class: className = '', onclick }: Props = $props();

	const classes = cx(
		'group inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-white',
		className
	);
</script>

{#if href}
	<a {href} class={classes} {onclick}>
		<FluentArrowLeft24Regular class="size-5 transition-transform group-hover:-translate-x-1" />
		<span>{label}</span>
	</a>
{:else}
	<button type="button" class={classes} {onclick}>
		<FluentArrowLeft24Regular class="size-5 transition-transform group-hover:-translate-x-1" />
		<span>{label}</span>
	</button>
{/if}
