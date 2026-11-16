<!-- src/lib/components/AppHeader.svelte -->
<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import FluentDriveTrain24Regular from '~icons/fluent/drive-train-24-regular';
	import FluentSearch24Regular from '~icons/fluent/search-24-regular';
	import FluentHeart24Regular from '~icons/fluent/heart-24-regular';
	import FluentInfo24Regular from '~icons/fluent/info-24-regular';
	import FluentPerson24Regular from '~icons/fluent/person-24-regular';
	import FluentSignOut24Regular from '~icons/fluent/sign-out-24-regular';
	import FluentStar24Regular from '~icons/fluent/star-24-regular';
	import { favorites } from '$lib/features/favorites/state.svelte';
	import { cx } from '$lib/design/tokens';

	interface Props {
		user: { isAdmin?: boolean } | null;
	}

	let { user }: Props = $props();

	// Literal hrefs so resolve() can check them against the generated route list.
	const links = [
		{ href: '/' as const, label: 'Search', icon: FluentSearch24Regular },
		{ href: '/favorites' as const, label: 'Favorites', icon: FluentHeart24Regular },
		{ href: '/about' as const, label: 'About', icon: FluentInfo24Regular }
	];

	function isActive(href: string) {
		return href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);
	}

	$effect(() => {
		favorites.load();
	});
</script>

<header
	class="bg-ink-950/85 sticky top-0 z-40 border-b border-white/8 shadow-lg shadow-black/20 backdrop-blur-xl"
>
	<div class="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
		<a
			href={resolve('/')}
			class="group flex shrink-0 items-center gap-2.5"
			aria-label="Station Atlas home"
		>
			<span
				class="bg-signal-400 text-ink-950 shadow-signal-500/25 grid size-9 place-items-center rounded-xl shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-6"
			>
				<FluentDriveTrain24Regular class="size-5" />
			</span>
			<span class="text-base font-bold tracking-tight text-white">
				Station<span class="text-signal-400">Atlas</span>
			</span>
		</a>

		<nav class="ml-4 hidden items-center gap-1 sm:flex" aria-label="Main navigation">
			{#each links as link (link.href)}
				<a
					href={resolve(link.href)}
					aria-current={isActive(link.href) ? 'page' : undefined}
					class={cx(
						'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
						isActive(link.href)
							? 'bg-white/10 text-white'
							: 'text-white/55 hover:bg-white/5 hover:text-white'
					)}
				>
					{link.label}
					{#if link.href === '/favorites' && favorites.count > 0}
						<span
							class="grid min-w-4 place-items-center rounded-full bg-rose-500/20 px-1 text-[10px] font-bold text-rose-200"
						>
							{favorites.count}
						</span>
					{/if}
				</a>
			{/each}
		</nav>

		<div class="ml-auto flex items-center gap-2">
			{#if user}
				{#if user.isAdmin}
					<a
						href={resolve('/pending')}
						class="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/8 hover:text-white md:inline-flex"
					>
						<FluentStar24Regular class="size-4" />
						Pending
					</a>
				{/if}
				<a
					href={resolve('/auth/logout')}
					class="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.06] px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:border-white/25 hover:text-white"
				>
					<FluentSignOut24Regular class="size-4" />
					<span class="hidden sm:inline">Sign out</span>
				</a>
			{:else}
				<a
					href={resolve('/auth/login')}
					class="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.06] px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:border-white/25 hover:text-white"
				>
					<FluentPerson24Regular class="size-4" />
					<span class="hidden sm:inline">Sign in</span>
				</a>
			{/if}
		</div>
	</div>

	<nav
		class="flex items-center gap-1 border-t border-white/6 px-3 py-2 sm:hidden"
		aria-label="Mobile navigation"
	>
		{#each links as link (link.href)}
			<a
				href={resolve(link.href)}
				aria-current={isActive(link.href) ? 'page' : undefined}
				class={cx(
					'flex flex-1 items-center justify-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold transition-colors',
					isActive(link.href) ? 'bg-white/10 text-white' : 'text-white/50'
				)}
			>
				<link.icon class="size-4" />
				{link.label}
				{#if link.href === '/favorites' && favorites.count > 0}
					<span class="rounded-full bg-rose-500/20 px-1.5 text-[10px] font-bold text-rose-200">
						{favorites.count}
					</span>
				{/if}
			</a>
		{/each}
	</nav>
</header>
