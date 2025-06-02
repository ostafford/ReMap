import { supabase } from '@/lib/supabase';

export async function signUp(credentials: { email: string; password: string }) {
	try {
		console.log('Attempting signup with email:', credentials.email);

		// NOTE: Concept is a logged in user can't create an account. They have to be logged out.
		const {
			data: { session },
		} = await supabase.auth.getSession();
		if (session) {
			throw new Error(
				'You are already signed in. Please sign out first to create a new account.'
			);
		}

		// Check if Supabase client is properly initialized
		if (!supabase) {
			throw new Error(
				'Supabase client not initialized. Check your environment variables.'
			);
		}

		const { data, error } = await supabase.auth.signUp({
			email: credentials.email,
			password: credentials.password,
		});

		// NOTE: Log the full response for debugging
		console.log('Supabase signup response:', { data, error });

		if (error) {
			// NOTE: Specific error messages based on error codes
			console.error('Supabase signup error:', error);

			switch (error.message) {
				case 'User already registered':
					throw new Error(
						'An account with this email already exists. Try signing in instead.'
					);

				case 'Invalid email':
					throw new Error('Please enter a valid email address.');

				case 'Password Length':
					throw new Error(
						'Password must be at least 6 characters long.'
					);

				case 'Email not confirmed':
					throw new Error(
						'Please check your email and click the confirmation link.'
					);

				default:
					// Log the original error for debugging
					console.error('Original error:', error);
					throw new Error(`Signup failed: ${error.message}`);
			}
		}

		// Check if user was created but needs email confirmation
		// if (data.user && !data.session) {
		// 	console.log('User created but needs email confirmation');
		// 	return {
		// 		...data,
		// 		needsConfirmation: true,
		// 		message: 'Please check your email for a confirmation link',
		// 	};
		// }

		console.log('Signup successful:', data.user?.email);
		return data;
	} catch (error) {
		console.error('Signup error in auth service:', error);

		// NOTE: Throw an error on custom function so i can retrace
		if (error instanceof Error) {
			throw error;
		}

		throw new Error(
			'An unexpected error occurred during signup. Please try again.'
		);
	}
}

export async function signIn(credentials: { email: string; password: string }) {
	try {
		console.log('Attempting signin with email:', credentials.email);

		if (!supabase) {
			throw new Error(
				'Supabase client not initialized. Check your environment variables.'
			);
		}

		const { data, error } = await supabase.auth.signInWithPassword({
			email: credentials.email,
			password: credentials.password,
		});

		console.log('Supabase signin response:', { data, error });

		if (error) {
			console.error('Supabase signin error:', error);

			switch (error.message) {
				case 'Invalid login credentials':
					throw new Error(
						'Invalid email or password. Please check your credentials.'
					);

				case 'Email not confirmed':
					throw new Error(
						'Please check your email and click the confirmation link before signing in.'
					);

				case 'Too many requests':
					throw new Error(
						'Too many login attempts. Please wait a moment and try again.'
					);

				default:
					console.error(' Original signin error:', error);
					throw new Error(`Signin failed: ${error.message}`);
			}
		}

		console.log('Signin successful:', data.user?.email);
		return data;
	} catch (error) {
		console.error('Signin error in auth service:', error);

		if (error instanceof Error) {
			throw error;
		}

		throw new Error(
			'An unexpected error occurred during signin. Please try again.'
		);
	}
}

export async function signOut() {
	try {
		console.log('Attempting to sign out...');

		if (!supabase) {
			throw new Error('Supabase client not initialized.');
		}

		const { error } = await supabase.auth.signOut();

		if (error) {
			console.error('Supabase signout error:', error);
			throw new Error(`Sign out failed: ${error.message}`);
		}

		console.log('✅ Sign out successful');
		return { success: true };
	} catch (error) {
		console.error('Sign out error in auth service:', error);

		if (error instanceof Error) {
			throw error;
		}

		throw new Error(
			'An unexpected error occurred during sign out. Please try again.'
		);
	}
}

export async function getCurrentUser() {
	try {
		const {
			data: { session },
			error,
		} = await supabase.auth.getSession();

		if (error) {
			console.error('Error getting current user:', error);
			return { user: null, error: error.message };
		}

		return {
			user: session?.user || null,
			session: session,
			authenticated: !!session,
		};
	} catch (error) {
		console.error('Error in getCurrentUser:', error);
		return { user: null, error: 'Failed to get current user' };
	}
}

export async function isSignedIn(): Promise<boolean> {
	try {
		const {
			data: { session },
		} = await supabase.auth.getSession();
		return !!session;
	} catch (error) {
		console.error('Error checking sign in status:', error);
		return false;
	}
}
