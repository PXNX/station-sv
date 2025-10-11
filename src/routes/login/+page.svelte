<script>
	async function loginWithGoogle() {
		window.location.href = '/login/google';
	}
</script>

<button on:click={loginWithGoogle} class="btn btn-primary">Login with Google</button>
