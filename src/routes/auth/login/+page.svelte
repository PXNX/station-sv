<!-- src/routes/auth/login/+page.svelte -->
<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	import FluentEmojiStation from '~icons/fluent-emoji/station';
	import LogosGoogleIcon from '~icons/logos/google-icon';
	import BackButton from '$lib/components/BackButton.svelte';
	import { Button, Card, PageHeader } from '$lib/components/ui';

	const next = $derived(page.url.searchParams.get('next') || '/');
</script>

<svelte:head>
	<title>Login - Train Station Search</title>
	<meta name="description" content="Login to access Train Station Search features" />
</svelte:head>

<div class="mb-6">
	<BackButton href={resolve('/')} />
</div>

<PageHeader
	title="Train Station Search"
	icon={FluentEmojiStation}
	description="Sign in to contribute station information"
/>

<div class="mx-auto w-full max-w-md">
	<Card padding="lg">
		<div class="flex flex-col items-center gap-6">
			<Button
				variant="secondary"
				block
				href={`/auth/login/google?next=${encodeURIComponent(next)}`}
				class="border-white/20 bg-white text-black hover:bg-white/90"
			>
				<LogosGoogleIcon class="size-5" />
				Continue with Google
			</Button>

			<p class="text-center text-sm text-white/50">
				By signing in, you agree to our
				<a
					href={resolve('/privacy-policy')}
					class="underline decoration-white/30 underline-offset-2 transition-colors hover:text-white/80"
				>
					privacy policy
				</a>.
			</p>
		</div>
	</Card>
</div>
