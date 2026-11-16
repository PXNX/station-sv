<!-- src/routes/+error.svelte -->
<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import FluentSearch24Regular from '~icons/fluent/search-24-regular';
	import FluentWarning24Regular from '~icons/fluent/warning-24-regular';
	import FluentCloudOffline24Regular from '~icons/fluent/cloud-offline-24-regular';
	import FluentPerson24Regular from '~icons/fluent/person-24-regular';
	import FluentBug24Regular from '~icons/fluent/bug-24-regular';
	import FluentHome24Regular from '~icons/fluent/home-24-regular';
	import FluentArrowLeft24Regular from '~icons/fluent/arrow-left-24-regular';
	import FluentArrowRight24Regular from '~icons/fluent/arrow-right-24-regular';
	import FluentArrowClockwise24Regular from '~icons/fluent/arrow-clockwise-24-regular';
	import { Button } from '$lib/components/ui';
	import { network } from '$lib/features/network/online.svelte';
	import { SURFACE_PANEL, cx, type IconComponent } from '$lib/design/tokens';

	type ErrorKind =
		'station' | 'notfound' | 'auth' | 'badrequest' | 'server' | 'offline' | 'generic';

	const status = $derived(page.status);
	const detail = $derived(page.error?.message?.trim() ?? '');

	const kind = $derived.by((): ErrorKind => {
		if (!network.online) return 'offline';
		if (status === 404) return detail.toLowerCase().includes('station') ? 'station' : 'notfound';
		if (status === 401 || status === 403) return 'auth';
		if (status === 400) return 'badrequest';
		if (status >= 500) return 'server';
		return 'generic';
	});

	interface ErrorCopy {
		title: string;
		description: string;
		icon: IconComponent;
		tint: string;
	}

	const copy: Record<ErrorKind, ErrorCopy> = {
		station: {
			title: 'Station not found',
			description:
				'This station is not in the atlas yet. Search by name or city to find another one.',
			icon: FluentSearch24Regular,
			tint: 'border-sky-400/30 bg-sky-400/10 text-sky-300'
		},
		notfound: {
			title: 'Page not found',
			description: 'That page does not exist — it may have moved or never been here.',
			icon: FluentSearch24Regular,
			tint: 'border-sky-400/30 bg-sky-400/10 text-sky-300'
		},
		auth: {
			title: 'Sign in required',
			description: 'This area needs an account. Sign in to continue where you left off.',
			icon: FluentPerson24Regular,
			tint: 'border-signal-400/30 bg-signal-400/10 text-signal-300'
		},
		badrequest: {
			title: 'That request did not work',
			description: 'Something about the request was incomplete. Go back and try again.',
			icon: FluentWarning24Regular,
			tint: 'border-amber-400/30 bg-amber-400/10 text-amber-300'
		},
		server: {
			title: 'Something went wrong',
			description: 'The server could not finish that request. A retry usually helps.',
			icon: FluentBug24Regular,
			tint: 'border-rose-400/30 bg-rose-400/10 text-rose-300'
		},
		offline: {
			title: "You're offline",
			description: 'This page is not available without a connection. Saved stations still work.',
			icon: FluentCloudOffline24Regular,
			tint: 'border-amber-400/30 bg-amber-400/10 text-amber-300'
		},
		generic: {
			title: 'Unexpected error',
			description: 'That did not go as planned. Try again or head back to search.',
			icon: FluentWarning24Regular,
			tint: 'border-white/15 bg-white/[0.06] text-white/70'
		}
	};

	$effect(() => network.start());

	const view = $derived(copy[kind]);
	const canGoBack = $derived(browser && history.length > 1);

	function retry() {
		location.reload();
	}

	function goBack() {
		history.back();
	}
</script>

<svelte:head>
	<title>{view.title} · {status} · Station Atlas</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="flex min-h-[70vh] items-center justify-center py-10">
	<div class="animate-fade-up w-full max-w-lg text-center">
		<div class="mb-5 flex items-center justify-center gap-3">
			<span class="eyebrow">Station Atlas</span>
			<span class="h-px w-8 bg-white/15"></span>
			<span class="font-mono text-xs font-semibold text-white/40">ERROR {status}</span>
		</div>

		<div class={cx(SURFACE_PANEL, 'p-8 sm:p-10')}>
			<div
				class="animate-pop mx-auto mb-6 grid size-20 place-items-center rounded-3xl border {view.tint}"
			>
				<view.icon class="size-9" />
			</div>

			<h1 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">{view.title}</h1>
			<p class="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/60">
				{view.description}
			</p>

			{#if detail && detail !== view.title && detail !== 'Internal Error'}
				<p
					class="mx-auto mt-4 max-w-sm truncate font-mono text-[11px] text-white/30"
					title={detail}
				>
					{detail}
				</p>
			{/if}

			<div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
				{#if kind === 'auth'}
					<Button href="{resolve('/auth/login')}?next={encodeURIComponent(page.url.pathname)}">
						<FluentArrowRight24Regular class="size-4" />
						Sign in
					</Button>
				{:else if kind === 'server' || kind === 'generic'}
					<Button onclick={retry}>
						<FluentArrowClockwise24Regular class="size-4" />
						Try again
					</Button>
				{:else if kind === 'offline'}
					<Button href={resolve('/offline')}>
						<FluentArrowRight24Regular class="size-4" />
						Offline options
					</Button>
				{:else}
					<Button href={resolve('/')}>
						<FluentSearch24Regular class="size-4" />
						Search stations
					</Button>
				{/if}

				{#if canGoBack && kind !== 'server'}
					<Button variant="secondary" onclick={goBack}>
						<FluentArrowLeft24Regular class="size-4" />
						Go back
					</Button>
				{:else}
					<Button variant="secondary" href={resolve('/')}>
						<FluentHome24Regular class="size-4" />
						Home
					</Button>
				{/if}
			</div>
		</div>

		<div class="mt-5 flex items-center justify-center gap-4 text-xs text-white/35">
			<a href={resolve('/favorites')} class="transition-colors hover:text-white/70">Favorites</a>
			<span class="h-1 w-1 rounded-full bg-white/20"></span>
			<a href={resolve('/about')} class="transition-colors hover:text-white/70">About</a>
		</div>
	</div>
</div>
