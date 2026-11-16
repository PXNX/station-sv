<!-- src/lib/components/InstallHint.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import FluentArrowDownload24Regular from '~icons/fluent/arrow-download-24-regular';

	interface BeforeInstallPromptEvent extends Event {
		prompt: () => Promise<void>;
		userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
	}

	const DISMISSED_KEY = 'station_install_hint_dismissed';

	let promptEvent: BeforeInstallPromptEvent | null = null;
	let visible = $state(false);
	let installed = $state(false);

	onMount(() => {
		if (localStorage.getItem(DISMISSED_KEY) === 'true') return;
		if (window.matchMedia('(display-mode: standalone)').matches) return;

		const onPrompt = (event: Event) => {
			event.preventDefault();
			promptEvent = event as BeforeInstallPromptEvent;
			visible = true;
		};

		const onInstalled = () => {
			visible = false;
			installed = true;
		};

		window.addEventListener('beforeinstallprompt', onPrompt);
		window.addEventListener('appinstalled', onInstalled);
		return () => {
			window.removeEventListener('beforeinstallprompt', onPrompt);
			window.removeEventListener('appinstalled', onInstalled);
		};
	});

	async function install() {
		if (!promptEvent) return;
		const event = promptEvent;
		event.prompt();
		const { outcome } = await event.userChoice;
		visible = false;
		promptEvent = null;
		if (outcome === 'accepted') installed = true;
	}

	function dismiss() {
		visible = false;
		localStorage.setItem(DISMISSED_KEY, 'true');
	}
</script>

{#if visible}
	<div
		class="install-hint border-signal-400/30 bg-ink-800/95 fixed right-4 bottom-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl shadow-black/40 backdrop-blur-xl sm:right-6 sm:bottom-6"
		role="status"
	>
		<span
			class="bg-signal-400/15 text-signal-300 grid size-9 shrink-0 place-items-center rounded-xl"
		>
			<FluentArrowDownload24Regular class="size-5" />
		</span>
		<div class="min-w-0">
			<p class="text-sm font-semibold text-white">Take the atlas with you</p>
			<p class="text-xs text-white/55">Install for offline access on the go.</p>
		</div>
		<button
			type="button"
			onclick={install}
			class="bg-signal-400 text-ink-950 hover:bg-signal-300 ml-1 shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors"
		>
			Install
		</button>
		<button
			type="button"
			onclick={dismiss}
			aria-label="Dismiss install hint"
			class="grid size-7 shrink-0 place-items-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white"
		>
			<span class="text-lg leading-none">×</span>
		</button>
	</div>
{:else if installed}
	<div
		class="install-hint bg-ink-800/95 fixed right-6 bottom-6 z-50 rounded-xl border border-emerald-400/30 px-4 py-2 text-sm text-emerald-200 shadow-xl backdrop-blur-xl"
	>
		Ready to use offline ✓
	</div>
{/if}
