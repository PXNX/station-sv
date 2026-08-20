<!-- src/lib/components/ui/ConfirmDialog.svelte -->
<script lang="ts">
	import Button from './Button.svelte';

	interface Props {
		open: boolean;
		title: string;
		message: string;
		confirmLabel?: string;
		cancelLabel?: string;
		/** Colour of the confirming action. */
		tone?: 'primary' | 'danger';
		onconfirm: () => void;
		oncancel?: () => void;
	}

	let {
		open = $bindable(false),
		title,
		message,
		confirmLabel = 'Confirm',
		cancelLabel = 'Cancel',
		tone = 'primary',
		onconfirm,
		oncancel
	}: Props = $props();

	function cancel() {
		open = false;
		oncancel?.();
	}

	function confirm() {
		open = false;
		onconfirm();
	}

	function onkeydown(event: KeyboardEvent) {
		if (open && event.key === 'Escape') {
			event.preventDefault();
			cancel();
		}
	}
</script>

<svelte:window {onkeydown} />

{#if open}
	<dialog class="modal modal-open" open>
		<div class="modal-box border border-white/12 bg-slate-900/95 text-white shadow-2xl backdrop-blur-md">
			<h3 class="text-lg font-bold">{title}</h3>
			<p class="py-4 text-white/75">{message}</p>
			<div class="modal-action">
				<Button variant="ghost" onclick={cancel}>{cancelLabel}</Button>
				<Button variant={tone === 'danger' ? 'danger' : 'primary'} onclick={confirm}>
					{confirmLabel}
				</Button>
			</div>
		</div>
		<button type="button" class="modal-backdrop cursor-default" aria-label="Close dialog" onclick={cancel}
		></button>
	</dialog>
{/if}
