<!-- src/routes/auth/login/+page.svelte -->
<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import LogosGoogleIcon from '~icons/logos/google-icon';
	import FluentEmojiStation from '~icons/fluent-emoji/station';
	import { Button, Card, PageHeader } from '$lib/components/ui';

	const next = $derived(page.url.searchParams.get('next') || '/');
</script>

<svelte:head>
	<title>Sign in · Station Atlas</title>
	<meta name="description" content="Sign in to contribute station information." />
</svelte:head>

<div class="animate-fade-up mx-auto max-w-md">
	<PageHeader
		title="Sign in"
		icon={FluentEmojiStation}
		eyebrow="Contribute"
		description="Sign in to suggest corrections to station details."
	/>

	<Card padding="lg">
		<div class="flex flex-col items-center gap-6">
			<Button
				variant="secondary"
				block
				href={`/auth/login/google?next=${encodeURIComponent(next)}`}
				class="border-white/20 bg-white text-ink-950 hover:bg-white/90"
			>
				<LogosGoogleIcon class="size-5" />
				Continue with Google
			</Button>

			<p class="text-center text-sm text-white/45">
				By signing in, you agree to our
				<a
					href={resolve('/privacy-policy')}
					class="text-signal-300 underline decoration-signal-300/40 underline-offset-2 transition-colors hover:text-signal-200"
				>
					privacy policy
				</a>.
			</p>
		</div>
	</Card>
</div>
