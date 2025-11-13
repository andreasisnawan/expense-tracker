import { browser } from '$app/environment';
import { auth } from '$lib/firebase';
import {
	createUserWithEmailAndPassword,
	signOut as firebaseSignOut,
	onAuthStateChanged,
	sendEmailVerification,
	signInWithEmailAndPassword,
	type User
} from 'firebase/auth';

// Serializable user data for session storage
type SerializedUser = {
	uid: string;
	email: string | null;
	emailVerified: boolean;
	displayName: string | null;
	photoURL: string | null;
};

// Helper to serialize Firebase user
function serializeUser(user: User): SerializedUser {
	return {
		uid: user.uid,
		email: user.email,
		emailVerified: user.emailVerified,
		displayName: user.displayName,
		photoURL: user.photoURL
	};
}

// Helper to get user from session storage
function getUserFromSession(): SerializedUser | null {
	if (!browser) return null;
	try {
		const userData = sessionStorage.getItem('user');
		return userData ? JSON.parse(userData) : null;
	} catch {
		return null;
	}
}

// Helper to save user to session storage
function saveUserToSession(user: SerializedUser | null) {
	if (!browser) return;
	if (user) {
		sessionStorage.setItem('user', JSON.stringify(user));
	} else {
		sessionStorage.removeItem('user');
	}
}

// Helper to save token to cookies
function saveTokenToCookie(token: string | null) {
	if (!browser) return;
	if (token) {
		// Set cookie for 7 days
		const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
		document.cookie = `auth_token=${token}; expires=${expires}; path=/; SameSite=Strict; Secure`;
	} else {
		// Clear cookie
		document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
	}
}

class AuthStore {
	user = $state<SerializedUser | null>(null);
	loading = $state(true);
	error = $state<string | null>(null);

	constructor() {
		// Initialize from session storage
		this.user = getUserFromSession();

		// Listen to auth state changes
		if (auth) {
			onAuthStateChanged(auth, async (firebaseUser) => {
				if (firebaseUser) {
					// Get and save token
					const token = await firebaseUser.getIdToken();
					saveTokenToCookie(token);

					// Serialize and save user
					const serializedUser = serializeUser(firebaseUser);
					this.user = serializedUser;
					saveUserToSession(serializedUser);
				} else {
					// Clear everything
					this.user = null;
					saveUserToSession(null);
					saveTokenToCookie(null);
				}
				this.loading = false;
			});
		} else {
			this.loading = false;
		}
	}

	async signUp(email: string, password: string) {
		if (!auth) {
			this.error = 'Firebase auth not initialized';
			return;
		}

		this.loading = true;
		this.error = null;

		try {
			const userCredential = await createUserWithEmailAndPassword(auth, email, password);

			// Send verification email
			await sendEmailVerification(userCredential.user);

			// Get token and save
			const token = await userCredential.user.getIdToken();
			saveTokenToCookie(token);

			// Save user to session
			const serializedUser = serializeUser(userCredential.user);
			this.user = serializedUser;
			saveUserToSession(serializedUser);

			this.loading = false;
			return userCredential.user;
		} catch (error: any) {
			this.error = error.message;
			this.loading = false;
			throw error;
		}
	}

	async signIn(email: string, password: string) {
		if (!auth) {
			this.error = 'Firebase auth not initialized';
			return;
		}

		this.loading = true;
		this.error = null;

		try {
			const userCredential = await signInWithEmailAndPassword(auth, email, password);

			// Get token and save
			const token = await userCredential.user.getIdToken();
			saveTokenToCookie(token);

			// Save user to session
			const serializedUser = serializeUser(userCredential.user);
			this.user = serializedUser;
			saveUserToSession(serializedUser);

			this.loading = false;
			return userCredential.user;
		} catch (error: any) {
			this.error = error.message;
			this.loading = false;
			throw error;
		}
	}

	async signOut() {
		if (!auth) return;

		this.loading = true;
		this.error = null;

		try {
			await firebaseSignOut(auth);

			// Clear everything
			this.user = null;
			saveUserToSession(null);
			saveTokenToCookie(null);

			this.loading = false;
		} catch (error: any) {
			this.error = error.message;
			this.loading = false;
			throw error;
		}
	}

	clearError() {
		this.error = null;
	}

	async resendVerificationEmail() {
		if (!auth?.currentUser) {
			this.error = 'No user logged in';
			return;
		}

		try {
			await sendEmailVerification(auth.currentUser);
		} catch (error: any) {
			this.error = error.message;
			throw error;
		}
	}

	// Helper to refresh user data (useful for checking email verification)
	async refreshUser() {
		if (!auth?.currentUser) return;

		try {
			await auth.currentUser.reload();
			const serializedUser = serializeUser(auth.currentUser);
			this.user = serializedUser;
			saveUserToSession(serializedUser);
		} catch (error: any) {
			this.error = error.message;
		}
	}
}

export const authStore = new AuthStore();
