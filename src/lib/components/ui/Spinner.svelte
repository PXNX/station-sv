<!-- src/lib/components/ui/Spinner.svelte -->
<script lang="ts">
	interface Props {
		size?: 'xs' | 'sm' | 'md' | 'lg';
		class?: string;
	}

	let { size = 'md', class: className = '' }: Props = $props();

	const sizes = {
		xs: 'loading-xs',
		sm: 'loading-sm',
		md: 'loading-md',
		lg: 'loading-lg'
	} as const;
</script>

<span class="loading loading-spinner {sizes[size]} {className}" aria-hidden="true"></span>
