<!-- src/lib/components/AppFooter.svelte -->
<script lang="ts">
	import { resolve } from '$app/paths';
	import FluentBranchFork24Regular from '~icons/fluent/branch-fork-24-regular';
</script>

<footer class="mt-16 border-t border-white/8 py-8">
	<div
		class="flex flex-col gap-4 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between"
	>
		<p>
			<span class="font-semibold text-white/60">Station Atlas</span>
			· Community-maintained station amenities across Europe.
		</p>
		<div class="flex flex-wrap items-center gap-x-5 gap-y-2">
			<a href={resolve('/about')} class="transition-colors hover:text-white/80">Sources</a>
			<a href={resolve('/privacy-policy')} class="transition-colors hover:text-white/80">
				Privacy
			</a>
			<a
				href="https://github.com/PXNX/station-sv"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-1.5 transition-colors hover:text-white/80"
			>
				<FluentBranchFork24Regular class="size-3.5" />
				GitHub
			</a>
		</div>
	</div>
</footer>
