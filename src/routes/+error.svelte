<!-- src/routes/+error.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import FluentEmojiCrossMark from '~icons/fluent-emoji/cross-mark';
	import FluentEmojiFaceWithRaisedEyebrow from '~icons/fluent-emoji/face-with-raised-eyebrow';
	import FluentEmojiMagnifyingGlassTiltedLeft from '~icons/fluent-emoji/magnifying-glass-tilted-left';
	import FluentEmojiWarning from '~icons/fluent-emoji/warning';
	import FluentEmojiSos from '~icons/fluent-emoji/sos-button';
	import FluentArrowLeft24Regular from '~icons/fluent/arrow-left-24-regular';
	import FluentHome24Regular from '~icons/fluent/home-24-regular';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { Button, Card } from '$lib/components/ui';

	const status = $derived(page.status);
	const errorMessage = $derived(page.error?.message || 'An unexpected error occurred');
	const isStationNotFound = $derived(status === 404 && errorMessage.includes('Station'));

	// Determine which icon to show based on error type
	const ErrorIcon = $derived.by(() => {
		if (isStationNotFound) return FluentEmojiMagnifyingGlassTiltedLeft;
		if (status === 404) return FluentEmojiFaceWithRaisedEyebrow;
		if (status === 400) return FluentEmojiWarning;
		if (status >= 500) return FluentEmojiSos;
		return FluentEmojiCrossMark;
	});

	// Determine error title
	const errorTitle = $derived.by(() => {
		if (isStationNotFound) return 'Station Not Found';
		if (status === 404) return 'Page Not Found';
		if (status === 400) return 'Bad Request';
		if (status >= 500) return 'Server Error';
		return 'Error';
	});

	// Determine helpful message
	const helpMessage = $derived.by(() => {
		if (isStationNotFound)
			return "The station you're looking for doesn't exist in our database yet. Try searching for it or check the station ID.";
		if (status === 404)
			return "The page you're looking for doesn't exist. It might have been moved or deleted.";
		if (status === 400)
			return 'There was a problem with your request. Please check your input and try again.';
		if (status >= 500)
			return 'Something went wrong on our end. Please try again later or contact support if the problem persists.';
		return 'An unexpected error occurred. Please try again.';
	});
</script>

<svelte:head>
	<title>{errorTitle} - Error {status}</title>
	<meta name="description" content="Error {status}: {errorMessage}" />
</svelte:head>

<div class="flex min-h-[70vh] flex-col justify-center">
	<Card padding="lg" class="text-center">
		<div class="mb-6 flex justify-center">
			<div class="rounded-full bg-white/5 p-6 ring-4 ring-white/10">
				<ErrorIcon class="size-16" />
			</div>
		</div>

		<p class="text-6xl font-bold text-white/80">{status}</p>
		<h1 class="mt-4 text-3xl font-bold text-white">{errorTitle}</h1>
		<p class="mt-4 text-lg text-white/70">{errorMessage}</p>
		<p class="mt-2 text-sm text-white/50">{helpMessage}</p>

		<div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
			<Button variant="secondary" onclick={() => history.back()}>
				<FluentArrowLeft24Regular class="size-5" />
				Go back
			</Button>
			<Button onclick={() => goto(resolve('/'))}>
				<FluentHome24Regular class="size-5" />
				Go home
			</Button>
		</div>
	</Card>
</div>
