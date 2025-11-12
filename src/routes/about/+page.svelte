<!-- src/routes/about/+page.svelte -->
<script lang="ts">
	import FluentEmojiStation from '~icons/fluent-emoji/station';
	import FluentEmojiInformationSource from '~icons/fluent-emoji/information';
	import FluentBranchFork24Regular from '~icons/fluent/branch-fork-24-regular';
	import FluentCamera24Regular from '~icons/fluent/camera-24-regular';
	import FluentArrowLeft24Regular from '~icons/fluent/arrow-left-24-regular';
	import FluentOpenRegular from '~icons/fluent/open-24-regular';
	import FluentIcons24Regular from '~icons/fluent/icons-24-regular';
	import FluentEmojiBaggageClaim from '~icons/fluent-emoji/baggage-claim';
</script>

<!-- Header -->
<header class="mb-10 text-center">
	<div class="mb-4 flex justify-center">
		<FluentEmojiInformationSource class="size-16" />
	</div>
	<h1 class="text-3xl font-bold text-white">About This Project</h1>
	<p class="mt-2 text-sm text-white/70">Information about data sources and contributors</p>
</header>

<!-- Back Button -->
<div class="mb-6">
	<a
		href="/"
		class="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-md transition-all hover:bg-white/20"
	>
		<FluentArrowLeft24Regular class="size-4" />
		Back to Search
	</a>
</div>

<!-- Main Content -->
<div class="space-y-6">
	<!-- Project Overview -->
	<div class="card border border-white/30 bg-white/10 backdrop-blur-md">
		<div class="card-body p-6">
			<div class="mb-4 flex items-center gap-3">
				<FluentEmojiStation class="size-8" />
				<h2 class="text-2xl font-bold text-white">What is this?</h2>
			</div>
			<div class="space-y-4 text-white/80">
				<p>
					This platform helps travelers find train stations with specific amenities like warm
					sleeping spots, power outlets, WiFi, and accessible toilets. Whether you're planning
					overnight stays or just need to know what facilities are available, we've got you covered.
					This is a community project. While we strive for accuracy, always verify critical
					information with official sources before making travel plans.
				</p>
				<p>
					The database includes stations across Europe with detailed information about their
					facilities and opening hours. Users can contribute by adding or updating station
					information based on their experiences. If you have information about a station's
					amenities or notice outdated information, please log in and submit your updates. All
					changes are reviewed before being published to ensure accuracy.
				</p>
			</div>
		</div>
	</div>

	<!-- Travel Rules -->
	<div class="card border border-white/30 bg-white/10 backdrop-blur-md">
		<div class="card-body p-6">
			<div class="mb-4 flex items-center gap-3">
				<FluentEmojiBaggageClaim class="size-8" />
				<h2 class="text-2xl font-bold text-white">My rules for train adventures</h2>
			</div>

			<div class="space-y-2 text-white/90">
				<strong>1.</strong> Always charge your electronic devices and powerbanks when you find an
				outlet<br />

				<strong>2.</strong> If needed, outlets are usually below doors or in the bathroom<br />

				<strong>3.</strong> For trips over 2 hours: bring sleeping mat and sleeping bag or lots of
				clothes against cold<br />

				<strong>4.</strong> If you see an earlier train at the station: take it<br />

				<strong>5.</strong> Always bring something to drink and eat, preferably nuts and food when
				it's cold<br />

				<strong>6.</strong> Peeing outside is life, but not on the train<br />

				<strong>7.</strong> Sleeping during the ride is better than at night at the station<br />

				<strong>8.</strong> Pack your backpack so you can hold it on your lap while sleeping,
				leaning against the window causes headaches<br />

				<strong>9.</strong> Don't go to stations with separate halls at night, usually closed from
				11pm to 5am, especially when cold, windy or rainy<br />

				<strong>10.</strong> Don't buy Doner at the station, just expensive and often garbage<br />

				<strong>11.</strong> Find someone to talk to, makes the journey go faster<br />

				<strong>12.</strong> Save the route in the train app and check regularly for changes,
				especially 2 minutes before stops<br />

				<strong>13.</strong> Look for alternative connections during the ride, sometimes there are
				faster options<br />

				<strong>14.</strong> Bring backup toilet paper<br />

				<strong>15.</strong> Good music and headphones on board<br />

				<strong>16.</strong> Put everything back in the backpack immediately after using your stuff,
				so you can exit quickly and don't forgt anything
			</div>
		</div>
	</div>

	<!-- Data Sources -->
	<div class="card border border-white/30 bg-white/10 backdrop-blur-md">
		<div class="card-body p-6">
			<h2 class="mb-4 text-2xl font-bold text-white">Data Sources</h2>
			<div class="space-y-4">
				<!-- GitHub -->
				<div class="flex items-start gap-4 rounded-lg bg-white/5 p-4">
					<div
						class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-purple-400 to-pink-500"
					>
						<FluentBranchFork24Regular class="size-6 text-white" />
					</div>
					<div class="grow">
						<h3 class="mb-1 font-semibold text-white">Source Code</h3>
						<p class="mb-2 text-sm text-white/70">
							This project is open source and available on GitHub. Contributions, bug reports, and
							feature requests are welcome!
						</p>
						<a
							href="https://github.com/PXNX/station-sv"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-2 text-sm text-blue-300 transition-colors hover:text-blue-200"
						>
							<span>View on GitHub</span>
							<FluentOpenRegular class="size-4" />
						</a>
					</div>
				</div>

				<!-- Railway Stations -->
				<div class="flex items-start gap-4 rounded-lg bg-white/5 p-4">
					<div
						class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-400 to-teal-500"
					>
						<FluentCamera24Regular class="size-6 text-white" />
					</div>
					<div class="grow">
						<h3 class="mb-1 font-semibold text-white">Station Photos</h3>
						<p class="mb-2 text-sm text-white/70">
							Station photographs are provided by Railway-Stations.org, a community-driven project
							documenting railway stations across Europe.
						</p>
						<a
							href="https://railway-stations.org"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-2 text-sm text-blue-300 transition-colors hover:text-blue-200"
						>
							<span>Visit Railway-Stations.org</span>
							<FluentOpenRegular class="size-4" />
						</a>
					</div>
				</div>

				<!-- Iconify -->
				<div class="flex items-start gap-4 rounded-lg bg-white/5 p-4">
					<div
						class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-yellow-400 to-orange-500"
					>
						<FluentIcons24Regular class="size-6 text-white" />
					</div>
					<div class="grow">
						<h3 class="mb-1 font-semibold text-white">Icons</h3>
						<p class="mb-2 text-sm text-white/70">
							All icons used in this project are provided by Iconify, offering access to thousands
							of open source icon sets including Fluent and Fluent Emoji.
						</p>
						<a
							href="https://icon-sets.iconify.design/"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-2 text-sm text-blue-300 transition-colors hover:text-blue-200"
						>
							<span>Visit Iconify</span>
							<FluentOpenRegular class="size-4" />
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
