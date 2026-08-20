<!-- src/lib/components/ui/CheckboxField.svelte -->
<script lang="ts">
	import { CHECKBOX_CLASS, SURFACE_INTERACTIVE, cx, type IconComponent } from '$lib/design/tokens';

	interface Props {
		label: string;
		name: string;
		/** May be `null` for station data nobody has filled in yet. */
		checked: boolean | null | undefined;
		/** `tile` is a filled, clickable block; `row` is a plain inline checkbox. */
		variant?: 'tile' | 'row';
		icon?: IconComponent;
		disabled?: boolean;
		class?: string;
	}

	let {
		label,
		name,
		checked = $bindable(false),
		variant = 'row',
		icon: Icon,
		disabled = false,
		class: className = ''
	}: Props = $props();
</script>

<label
	class={cx(
		'flex cursor-pointer items-center gap-3',
		variant === 'tile' ? cx(SURFACE_INTERACTIVE, 'p-3') : '',
		disabled && 'cursor-not-allowed opacity-60',
		className
	)}
>
	<input type="checkbox" {name} {disabled} bind:checked class={CHECKBOX_CLASS} />
	{#if Icon}<Icon class="size-5 shrink-0" />{/if}
	<span class="text-sm text-white">{label}</span>
</label>
