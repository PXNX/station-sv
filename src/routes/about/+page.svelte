<!-- src/routes/about/+page.svelte -->
<script lang="ts">
	import { Card, PageHeader } from '$lib/components/ui';
	import type { IconComponent } from '$lib/design/tokens';
	import FluentEmojiStation from '~icons/fluent-emoji/station';
	import FluentEmojiInformationSource from '~icons/fluent-emoji/information';
	import FluentBranchFork24Regular from '~icons/fluent/branch-fork-24-regular';
	import FluentCamera24Regular from '~icons/fluent/camera-24-regular';
	import FluentOpenRegular from '~icons/fluent/open-24-regular';
	import FluentEmojiBaggageClaim from '~icons/fluent-emoji/baggage-claim';

	interface Source {
		title: string;
		description: string;
		linkLabel: string;
		href: string;
		icon: IconComponent;
		accent: string;
	}

	const sources: Source[] = [
		{
			title: 'DB InfraGO OpenStation',
			description:
				'Structured infrastructure and accessibility data that forms the foundation of station information.',
			linkLabel: 'OpenStation documentation',
			href: 'https://developers.deutschebahn.com/db-api-marketplace/apis/product/open-station',
			icon: FluentEmojiStation,
			accent: 'from-sky-400 to-blue-600'
		},
		{
			title: 'Bahn-Vorhersage stations',
			description:
				'Stable station identifiers, coordinates, DS100 codes and the transport modes serving each station.',
			linkLabel: 'Open station dataset',
			href: 'https://bahnvorhersage.de/api/stations.json',
			icon: FluentEmojiInformationSource,
			accent: 'from-emerald-400 to-teal-600'
		},
		{
			title: 'Station photos',
			description:
				'Photographs come from Railway-Stations.org, a community project documenting stations across Europe.',
			linkLabel: 'Visit Railway-Stations.org',
			href: 'https://railway-stations.org',
			icon: FluentCamera24Regular,
			accent: 'from-blue-400 to-teal-500'
		},
		{
			title: 'Icons & source code',
			description:
				'Icons are provided by Iconify. The whole project is open source — contributions and bug reports are welcome.',
			linkLabel: 'View on GitHub',
			href: 'https://github.com/PXNX/station-sv',
			icon: FluentBranchFork24Regular,
			accent: 'from-purple-400 to-pink-500'
		}
	];

	const travelRules = [
		'Charge your devices and power banks whenever you find an outlet',
		'Outlets are often below doors or in the bathroom',
		'For trips over 2 hours: bring a sleeping mat and something warm',
		'If you spot an earlier train, take it',
		'Bring food and drink — nuts and warm food help in cold weather',
		'Sleeping on the train beats sleeping at the station',
		'Pack so you can hold your backpack on your lap while sleeping',
		'Avoid stations with separate halls at night; they often close 23:00–05:00',
		'Bring backup toilet paper',
		'Check the route in your train app shortly before every stop',
		'Put things back in your backpack immediately so you can leave quickly'
	];
</script>

<svelte:head>
	<title>About · Station Atlas</title>
	<meta name="description" content="Data sources and travel notes behind Station Atlas." />
</svelte:head>

<div class="animate-fade-up">
	<PageHeader
		title="About this project"
		icon={FluentEmojiInformationSource}
		eyebrow="Open data, better journeys"
		description="Where the data comes from, and a few hard-earned travel rules."
	/>

	<div class="space-y-5">
		<Card title="What is this?" titleSize="lg" icon={FluentEmojiStation}>
			<div class="space-y-3 text-sm leading-relaxed text-white/65">
				<p>
					Station Atlas helps travelers find stations with the facilities that matter — warm places
					to sleep, power outlets, WiFi and accessible toilets. It is built on open data and on what
					travelers report from experience.
				</p>
				<p>
					Everything is community-maintained: sign in to add or correct a detail, and an
					administrator reviews changes before they go live. Accuracy is never guaranteed — always
					confirm critical information with official sources before you travel.
				</p>
			</div>
		</Card>

		<Card title="My rules for train adventures" titleSize="lg" icon={FluentEmojiBaggageClaim}>
			<ol class="space-y-2 text-sm text-white/75">
				{#each travelRules as rule, index (rule)}
					<li class="flex gap-3">
						<span class="text-signal-300/70 w-5 shrink-0 text-right font-mono text-xs"
							>{index + 1}.</span
						>
						<span>{rule}</span>
					</li>
				{/each}
			</ol>
		</Card>

		<Card title="Data sources" titleSize="lg">
			<div class="grid gap-3 sm:grid-cols-2">
				{#each sources as item (item.title)}
					<div class="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
						<div
							class="grid size-10 shrink-0 place-items-center rounded-xl bg-linear-to-br {item.accent}"
						>
							<item.icon class="size-5 text-white" />
						</div>
						<div class="min-w-0">
							<h3 class="text-sm font-bold text-white">{item.title}</h3>
							<p class="mt-1 text-xs leading-relaxed text-white/50">{item.description}</p>
							<a
								href={item.href}
								target="_blank"
								rel="noopener noreferrer"
								class="text-signal-300 hover:text-signal-200 mt-2 inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
							>
								{item.linkLabel}
								<FluentOpenRegular class="size-3.5" />
							</a>
						</div>
					</div>
				{/each}
			</div>
		</Card>
	</div>
</div>
