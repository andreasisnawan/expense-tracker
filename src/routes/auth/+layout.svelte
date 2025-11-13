<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth.svelte';

	let { children } = $props();

	// Redirect to home if already logged in and verified
	$effect(() => {
		if (!authStore.loading && authStore.user && authStore.user.emailVerified) {
			goto('/', { replaceState: true });
		}
	});
</script>

{@render children()}
