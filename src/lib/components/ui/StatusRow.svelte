<!-- src/lib/components/ui/StatusRow.svelte -->
<script lang="ts">
	import { TEXT_TONE } from '$lib/design/tokens';

	interface Props {
		label: string;
		/** `null`/`undefined` means nobody has filled this in yet. */
		value: boolean | null | undefined;
	}

	let { label, value }: Props = $props();

	const unknown = $derived(value === null || value === undefined);
	const text = $derived(unknown ? 'Unknown' : value ? 'Yes' : 'No');
	const tone = $derived(unknown ? TEXT_TONE.neutral : value ? TEXT_TONE.success : TEXT_TONE.danger);
</script>

<div class="flex items-center justify-between gap-3 text-sm">
	<span class="text-white/60">{label}</span>
	<span class="font-medium {tone}">{text}</span>
</div>
