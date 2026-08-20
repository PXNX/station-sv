<!-- src/lib/components/ui/Alert.svelte -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ALERT_TONE, cx, type IconComponent, type Tone } from '$lib/design/tokens';
	import FluentEmojiInformation from '~icons/fluent-emoji/information';
	import FluentEmojiWarning from '~icons/fluent-emoji/warning';
	import FluentEmojiCheckMark from '~icons/fluent-emoji/check-mark';
	import FluentEmojiCrossMark from '~icons/fluent-emoji/cross-mark';

	interface Props {
		children?: Snippet;
		tone?: Tone;
		title?: string;
		/** Overrides the tone's default icon. Pass `null` to hide it. */
		icon?: IconComponent | null;
		class?: string;
	}

	let { children, tone = 'info', title, icon, class: className = '' }: Props = $props();

	const defaultIcons: Partial<Record<Tone, IconComponent>> = {
		info: FluentEmojiInformation,
		brand: FluentEmojiInformation,
		neutral: FluentEmojiInformation,
		warning: FluentEmojiWarning,
		success: FluentEmojiCheckMark,
		danger: FluentEmojiCrossMark
	};

	const Icon = $derived(icon === undefined ? defaultIcons[tone] : icon);
</script>

<div
	class={cx('flex items-start gap-3 rounded-xl border p-4 backdrop-blur-sm', ALERT_TONE[tone], className)}
	role="status"
>
	{#if Icon}<Icon class="mt-0.5 size-5 shrink-0" />{/if}
	<div class="min-w-0 grow space-y-1">
		{#if title}<h3 class="font-semibold">{title}</h3>{/if}
		{#if children}<div class="text-sm opacity-90">{@render children()}</div>{/if}
	</div>
</div>
