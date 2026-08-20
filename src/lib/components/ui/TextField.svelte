<!-- src/lib/components/ui/TextField.svelte -->
<script lang="ts">
	import { INPUT_CLASS, cx } from '$lib/design/tokens';

	interface Props {
		label: string;
		name: string;
		value: string;
		/** Renders a textarea with this many rows instead of a single-line input. */
		rows?: number;
		placeholder?: string;
		hint?: string;
		disabled?: boolean;
		class?: string;
	}

	let {
		label,
		name,
		value = $bindable(''),
		rows,
		placeholder,
		hint,
		disabled = false,
		class: className = ''
	}: Props = $props();
</script>

<div class={cx('space-y-2', className)}>
	<label for={name} class="block text-sm font-medium text-white/80">{label}</label>
	{#if rows}
		<textarea
			id={name}
			{name}
			{rows}
			{placeholder}
			{disabled}
			bind:value
			class={INPUT_CLASS}
		></textarea>
	{:else}
		<input id={name} {name} type="text" {placeholder} {disabled} bind:value class={INPUT_CLASS} />
	{/if}
	{#if hint}
		<p class="text-xs text-white/50">{hint}</p>
	{/if}
</div>
