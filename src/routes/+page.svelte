<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth.svelte';
	import { onMount } from 'svelte';

	// Redirect logic for root page
	$effect(() => {
		if (authStore.loading) return;

		// Not logged in -> go to login
		if (!authStore.user) {
			goto('/auth/signin', { replaceState: true });
		}
		// Logged in but not verified -> go to verify page
		else if (!authStore.user.emailVerified) {
			goto('/auth/verify-email', { replaceState: true });
		}
	});

	onMount(() => {
		// Check on window focus (for when user verifies email in another tab)
		const handleFocus = () => {
			if (!authStore.loading && authStore.user && !authStore.user.emailVerified) {
				goto('/auth/verify-email', { replaceState: true });
			}
		};

		window.addEventListener('focus', handleFocus);

		return () => {
			window.removeEventListener('focus', handleFocus);
		};
	});

	async function handleLogout() {
		await authStore.signOut();
		goto('/auth/signin');
	}
</script>

<div class="container">
	<header>
		<h1>Expense Tracker</h1>
		<div class="user-info">
			{#if authStore.user}
				<span>Welcome, {authStore.user.email}</span>
				<button onclick={handleLogout} class="btn-logout">Logout</button>
			{/if}
		</div>
	</header>

	<main>
		<div class="welcome-card">
			<h2>Welcome to Your Expense Tracker!</h2>
			<p>You're successfully logged in. Start tracking your expenses now.</p>

			<div class="quick-stats">
				<div class="stat-card">
					<h3>$0.00</h3>
					<p>Total Expenses</p>
				</div>
				<div class="stat-card">
					<h3>0</h3>
					<p>Transactions</p>
				</div>
				<div class="stat-card">
					<h3>$0.00</h3>
					<p>This Month</p>
				</div>
			</div>

			<div class="actions">
				<button class="btn-primary">Add Expense</button>
				<button class="btn-secondary">View All</button>
			</div>
		</div>
	</main>
</div>

<style>
	.container {
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 2rem;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		flex-wrap: wrap;
		gap: 1rem;
	}

	header h1 {
		color: white;
		margin: 0;
		font-size: 2rem;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 1rem;
		color: white;
		font-size: 0.95rem;
	}

	.btn-logout {
		background: rgba(255, 255, 255, 0.2);
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.3);
		padding: 0.5rem 1rem;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 500;
		transition: all 0.2s;
	}

	.btn-logout:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	main {
		max-width: 1200px;
		margin: 0 auto;
	}

	.welcome-card {
		background: white;
		padding: 2.5rem;
		border-radius: 12px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
	}

	.welcome-card h2 {
		margin: 0 0 0.5rem 0;
		color: #333;
		font-size: 1.8rem;
	}

	.welcome-card > p {
		margin: 0 0 2rem 0;
		color: #666;
		font-size: 1rem;
	}

	.quick-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.stat-card {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 1.5rem;
		border-radius: 8px;
		text-align: center;
	}

	.stat-card h3 {
		margin: 0 0 0.5rem 0;
		font-size: 2rem;
	}

	.stat-card p {
		margin: 0;
		opacity: 0.9;
		font-size: 0.9rem;
	}

	.actions {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		padding: 0.875rem 1.5rem;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition:
			transform 0.2s,
			box-shadow 0.2s;
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
	}

	.btn-secondary {
		background: white;
		color: #667eea;
		border: 2px solid #667eea;
		padding: 0.875rem 1.5rem;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-secondary:hover {
		background: #667eea;
		color: white;
	}

	@media (max-width: 640px) {
		.container {
			padding: 1rem;
		}

		header h1 {
			font-size: 1.5rem;
		}

		.welcome-card {
			padding: 1.5rem;
		}

		.welcome-card h2 {
			font-size: 1.5rem;
		}

		.quick-stats {
			grid-template-columns: 1fr;
		}
	}
</style>
