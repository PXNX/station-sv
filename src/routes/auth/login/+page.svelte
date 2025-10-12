<script lang="ts">
	import { page } from '$app/state';

	import FluentEmojiStation from '~icons/fluent-emoji/station';
</script>

<FluentEmojiStation class="h-16 w-16" />

<a
	href={`/auth/login/google?next=${encodeURIComponent(page.url.pathname + page.url.search)}`}
	class="btn btn-primary"
>
	Login with Google
</a>
