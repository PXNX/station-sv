<!-- src/routes/privacy-policy/+page.svelte -->
<script lang="ts">
	import { Card, PageHeader } from '$lib/components/ui';
	import FluentEmojiInformationSource from '~icons/fluent-emoji/information';
</script>

<svelte:head>
	<title>Privacy Policy · Station Atlas</title>
	<meta name="description" content="How Station Atlas handles your data." />
</svelte:head>

<div class="animate-fade-up mx-auto max-w-3xl">
	<PageHeader
		title="Privacy policy"
		icon={FluentEmojiInformationSource}
		eyebrow="Last updated: 16 November 2026"
		description="A short, plain-language explanation of what this project stores."
	/>

	<div class="space-y-5 text-sm leading-relaxed text-white/70">
		<Card title="At a glance" titleSize="md">
			<p>
				Station Atlas is a small, non-commercial project. It does not show advertising and does not run
				third-party analytics or tracking scripts. We collect only what is needed to let you sign in and
				to store the station information you choose to contribute.
			</p>
		</Card>

		<Card title="What is stored on your device" titleSize="md">
			<ul class="list-inside list-disc space-y-1.5">
				<li><strong>Favorites</strong> are kept in your browser's local storage. They never leave your device.</li>
				<li>
					<strong>Recent searches and filter choices</strong> are also kept locally so the app can
					restore them on your next visit.
				</li>
				<li>You can clear all of this at any time through your browser's site-data settings.</li>
			</ul>
		</Card>

		<Card title="Sign-in and contributed data" titleSize="md">
			<p>
				If you choose to sign in with Google, we receive your name, email address and a stable account
				identifier from Google. A session cookie keeps you signed in. Station edits you submit are stored
				in our database together with your account, and are reviewed before being published. If you do
				not sign in, you can still browse and save favorites — you simply cannot contribute edits.
			</p>
		</Card>

		<Card title="Third-party services" titleSize="md">
			<p>
				Station photos are loaded from Railway-Stations.org, maps link to Google Maps and
				OpenStreetMap, and sign-in is provided by Google. When you use those features, the respective
				providers may process technical data such as your IP address under their own privacy policies.
				Loading the core search page does not contact them.
			</p>
		</Card>

		<Card title="Your rights" titleSize="md">
			<p>
				You can ask to access, correct or delete the data associated with your account, or withdraw a
				consent you previously gave. To do so, contact the project maintainer through the repository
				linked below. You also have the right to complain to your local data protection authority.
			</p>
		</Card>

		<Card title="Contact" titleSize="md">
			<p>
				Questions about this policy or your data can be raised as an issue at
				<a
					href="https://github.com/PXNX/station-sv"
					target="_blank"
					rel="noopener noreferrer"
					class="font-semibold text-signal-300 underline decoration-signal-300/40 underline-offset-2 hover:text-signal-200"
				>
					github.com/PXNX/station-sv
				</a>.
			</p>
		</Card>
	</div>
</div>
