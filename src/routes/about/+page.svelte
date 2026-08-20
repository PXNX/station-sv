<!-- src/routes/about/+page.svelte -->
<script lang="ts">
	import BackButton from '$lib/components/BackButton.svelte';
	import { Card, PageHeader } from '$lib/components/ui';
	import { resolve } from '$app/paths';
	import type { IconComponent } from '$lib/design/tokens';
	import FluentEmojiStation from '~icons/fluent-emoji/station';
	import FluentEmojiInformationSource from '~icons/fluent-emoji/information';
	import FluentBranchFork24Regular from '~icons/fluent/branch-fork-24-regular';
	import FluentCamera24Regular from '~icons/fluent/camera-24-regular';
	import FluentOpenRegular from '~icons/fluent/open-24-regular';
	import FluentIcons24Regular from '~icons/fluent/icons-24-regular';
	import FluentEmojiBaggageClaim from '~icons/fluent-emoji/baggage-claim';

	interface Source {
		title: string;
		description: string;
		linkLabel: string;
		href: string;
		icon: IconComponent;
		/** Gradient for the icon tile. */
		accent: string;
	}

	const sources: Source[] = [
		{
			title: 'Source Code',
			description:
				'This project is open source and available on GitHub. Contributions, bug reports, and feature requests are welcome!',
			linkLabel: 'View on GitHub',
			href: 'https://github.com/PXNX/station-sv',
			icon: FluentBranchFork24Regular,
			accent: 'from-purple-400 to-pink-500'
		},
		{
			title: 'Station Photos',
			description:
				'Station photographs are provided by Railway-Stations.org, a community-driven project documenting railway stations across Europe.',
			linkLabel: 'Visit Railway-Stations.org',
			href: 'https://railway-stations.org',
			icon: FluentCamera24Regular,
			accent: 'from-blue-400 to-teal-500'
		},
		{
			title: 'Icons',
			description:
				'All icons used in this project are provided by Iconify, offering access to thousands of open source icon sets including Fluent and Fluent Emoji.',
			linkLabel: 'Visit Iconify',
			href: 'https://icon-sets.iconify.design/',
			icon: FluentIcons24Regular,
			accent: 'from-yellow-400 to-orange-500'
		}
	];

	const travelRules = [
		'Always charge your electronic devices and powerbanks when you find an outlet',
		'If needed, outlets are usually below doors or in the bathroom',
		'For trips over 2 hours: bring sleeping mat and sleeping bag or lots of clothes against cold',
		'If you see an earlier train at the station: take it',
		"Always bring something to drink and eat, preferably nuts and food when it's cold",
		'Peeing outside is life, but not on the train',
		'Sleeping during the ride is better than at night at the station',
		'Pack your backpack so you can hold it on your lap while sleeping, leaning against the window causes headaches',
		"Don't go to stations with separate halls at night, usually closed from 11pm to 5am, especially when cold, windy or rainy",
		"Don't buy Doner at the station, just expensive and often garbage",
		'Find someone to talk to, makes the journey go faster',
		'Save the route in the train app and check regularly for changes, especially 2 minutes before stops',
		'Look for alternative connections during the ride, sometimes there are faster options',
		'Bring backup toilet paper',
		'Good music and headphones on board',
		"Put everything back in the backpack immediately after using your stuff, so you can exit quickly and don't forget anything"
	];
</script>

<svelte:head>
	<title>About - Train Station Search</title>
	<meta name="description" content="Information about data sources and contributors" />
</svelte:head>

<div class="mb-6">
	<BackButton href={resolve('/')} />
</div>

<PageHeader
	title="About This Project"
	icon={FluentEmojiInformationSource}
	description="Information about data sources and contributors"
/>

<div class="space-y-6">
	<Card title="What is this?" titleSize="lg" icon={FluentEmojiStation}>
		<div class="space-y-4 text-white/70">
			<p>
				This platform helps travelers find train stations with specific amenities like warm sleeping
				spots, power outlets, WiFi, and accessible toilets. Whether you're planning overnight stays
				or just need to know what facilities are available, we've got you covered. This is a
				community project. While we strive for accuracy, always verify critical information with
				official sources before making travel plans.
			</p>
			<p>
				The database includes stations across Europe with detailed information about their facilities
				and opening hours. Users can contribute by adding or updating station information based on
				their experiences. If you have information about a station's amenities or notice outdated
				information, please log in and submit your updates. All changes are reviewed before being
				published to ensure accuracy.
			</p>
		</div>
	</Card>

	<Card title="My rules for train adventures" titleSize="lg" icon={FluentEmojiBaggageClaim}>
		<ol class="space-y-2 text-white/80">
			{#each travelRules as rule, index (rule)}
				<li class="flex gap-3">
					<span class="w-6 shrink-0 text-right font-semibold text-white/40">{index + 1}.</span>
					<span>{rule}</span>
				</li>
			{/each}
		</ol>
	</Card>

	<Card title="Data Sources" titleSize="lg">
		<div class="space-y-3">
			{#each sources as item (item.title)}
				<div class="flex items-start gap-4 rounded-xl border border-white/8 bg-white/5 p-4">
					<div
						class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br {item.accent}"
					>
						<item.icon class="size-6 text-white" />
					</div>
					<div class="min-w-0 grow">
						<h3 class="mb-1 font-semibold text-white">{item.title}</h3>
						<p class="mb-2 text-sm text-white/60">{item.description}</p>
						<a
							href={item.href}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-2 text-sm text-sky-300 transition-colors hover:text-sky-200"
						>
							<span>{item.linkLabel}</span>
							<FluentOpenRegular class="size-4" />
						</a>
					</div>
				</div>
			{/each}
		</div>
	</Card>
</div>
