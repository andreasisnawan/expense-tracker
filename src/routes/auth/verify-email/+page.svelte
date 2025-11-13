<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth.svelte';

	let resending = $state(false);
	let resendSuccess = $state(false);
	let resendError = $state('');

	async function handleResend() {
		resending = true;
		resendSuccess = false;
		resendError = '';

		try {
			await authStore.resendVerificationEmail();
			resendSuccess = true;
		} catch (error: any) {
			resendError = error.message || 'Failed to resend email';
		} finally {
			resending = false;
		}
	}

	async function handleSignOut() {
		await authStore.signOut();
		goto('/auth/signin');
	}

	// Check verification status periodically
	let checkInterval: number;
	let isChecking = false;

	$effect(() => {
		checkInterval = window.setInterval(async () => {
			if (authStore.user && !isChecking) {
				isChecking = true;
				try {
					await authStore.refreshUser();
					if (authStore.user?.emailVerified) {
						clearInterval(checkInterval);
						goto('/');
					}
				} catch (error) {
					console.error('Error checking verification status:', error);
				} finally {
					isChecking = false;
				}
			}
		}, 5000); // Check every 5 seconds

		return () => {
			if (checkInterval) clearInterval(checkInterval);
		};
	});
</script>

<div class="verify-container">
	<div class="verify-card">
		<div class="icon">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="80"
				height="80"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
				<polyline points="22,6 12,13 2,6" />
			</svg>
		</div>

		<h1>Verify Your Email</h1>
		<p class="subtitle">
			We've sent a verification email to <strong>{authStore.user?.email}</strong>
		</p>

		<div class="instructions">
			<h3>Next Steps:</h3>
			<ol>
				<li>Check your email inbox <strong>(and spam/junk folder)</strong></li>
				<li>Click the verification link in the email</li>
				<li>Return to this page - it will automatically redirect once verified</li>
			</ol>
		</div>

		<div class="warning-box">
			<strong>⚠️ Email in Spam Folder?</strong>
			<p>
				Verification emails sometimes go to spam. Please check your spam/junk folder and mark it as
				"Not Spam" if you find it there.
			</p>
		</div>

		{#if resendSuccess}
			<div class="success-message">Verification email sent successfully!</div>
		{/if}

		{#if resendError}
			<div class="error-message">{resendError}</div>
		{/if}

		<div class="actions">
			<button onclick={handleResend} class="btn-secondary" disabled={resending}>
				{resending ? 'Sending...' : 'Resend Verification Email'}
			</button>
			<button onclick={handleSignOut} class="btn-text">Sign Out</button>
		</div>

		<p class="note">
			💡 Tip: After clicking the verification link, you may need to wait a few seconds for this page
			to detect the change.
		</p>
	</div>
</div>

<style>
	.verify-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		padding: 1rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}

	.verify-card {
		background: white;
		padding: 3rem 2.5rem;
		border-radius: 12px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
		width: 100%;
		max-width: 520px;
		text-align: center;
	}

	.icon {
		color: #667eea;
		margin-bottom: 1.5rem;
	}

	h1 {
		margin: 0 0 0.5rem 0;
		font-size: 2rem;
		color: #333;
	}

	.subtitle {
		margin: 0 0 2rem 0;
		color: #666;
		font-size: 1rem;
		line-height: 1.5;
	}

	.subtitle strong {
		color: #667eea;
	}

	.instructions {
		background: #f8f9fa;
		padding: 1.5rem;
		border-radius: 8px;
		margin-bottom: 1.5rem;
		text-align: left;
	}

	.instructions h3 {
		margin: 0 0 1rem 0;
		color: #333;
		font-size: 1.1rem;
	}

	.instructions ol {
		margin: 0;
		padding-left: 1.5rem;
		color: #555;
	}

	.instructions li {
		margin-bottom: 0.5rem;
		line-height: 1.6;
	}

	.instructions li:last-child {
		margin-bottom: 0;
	}

	.warning-box {
		background: #fff3cd;
		border: 1px solid #ffeaa7;
		border-radius: 8px;
		padding: 1rem;
		margin-bottom: 1.5rem;
		text-align: left;
	}

	.warning-box strong {
		display: block;
		color: #856404;
		margin-bottom: 0.5rem;
		font-size: 0.95rem;
	}

	.warning-box p {
		margin: 0;
		color: #856404;
		font-size: 0.85rem;
		line-height: 1.5;
	}

	.success-message {
		background: #d4edda;
		border: 1px solid #c3e6cb;
		color: #155724;
		padding: 0.75rem;
		border-radius: 6px;
		margin-bottom: 1.5rem;
		font-size: 0.9rem;
	}

	.error-message {
		background: #fee;
		border: 1px solid #fcc;
		color: #c33;
		padding: 0.75rem;
		border-radius: 6px;
		margin-bottom: 1.5rem;
		font-size: 0.9rem;
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
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

	.btn-secondary:hover:not(:disabled) {
		background: #667eea;
		color: white;
	}

	.btn-secondary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-text {
		background: none;
		color: #666;
		border: none;
		padding: 0.5rem;
		font-size: 0.9rem;
		cursor: pointer;
		text-decoration: underline;
	}

	.btn-text:hover {
		color: #333;
	}

	.note {
		margin: 0;
		padding: 1rem;
		background: #fff3cd;
		border-radius: 6px;
		color: #856404;
		font-size: 0.85rem;
		line-height: 1.5;
	}

	@media (max-width: 640px) {
		.verify-card {
			padding: 2rem 1.5rem;
		}

		h1 {
			font-size: 1.5rem;
		}
	}
</style>
