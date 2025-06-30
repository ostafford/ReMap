/** Handles authentication logic with Supabase */

import { supabase } from '@/lib/supabase';

// ===================
//   HELPER FUNCTIONS
// ===================

// Create user profile record
async function createUserProfile(
	userId: string,
	profileData: {
		fullName: string;
		username: string;
		avatarUrl?: string;
	}
): Promise<any> {
	try {
		console.log('👤 [AUTH] Creating profile for user:', userId);
		console.log('👤 [AUTH] Profile data received:', profileData);

		// check if profile already exists
		const { data: existingProfile, error: checkError } = await supabase
			.from('profiles')
			.select('id, username, full_name, avatar_url')
			.eq('id', userId)
			.single();

		if (checkError && checkError.code !== 'PGRST116') {
			// PGRST116 = no rows returned
			console.error(
				'👤 [AUTH] Error checking existing profile:',
				checkError
			);
		}

		if (existingProfile) {
			console.log(
				'👤 [AUTH] Profile already exists, updating...',
				existingProfile
			);
		} else {
			console.log(
				'👤 [AUTH] No existing profile found, creating new one...'
			);
		}

		const insertData = {
			id: userId,
			full_name: profileData.fullName,
			username: profileData.username,
			avatar_url: profileData.avatarUrl || null,
		};

		console.log(
			'👤 [AUTH] Data to upsert into profiles table:',
			insertData
		);

		const { data, error } = await supabase
			.from('profiles')
			.upsert(insertData, {
				onConflict: 'id', // Use the id field for conflict resolution
				ignoreDuplicates: false, // Update if exists, insert if not
			})
			.select()
			.single();

		if (error) {
			console.error('👤 [AUTH] Profile creation error:', error);
			console.error('👤 [AUTH] Error details:', {
				code: error.code,
				message: error.message,
				details: error.details,
				hint: error.hint,
			});
			throw new Error(`Failed to create profile: ${error.message}`);
		}

		console.log('✅ [AUTH] Profile created/updated successfully:', data);
		return data;
	} catch (error) {
		console.error('👤 [AUTH] Profile creation failed:', error);
		throw new Error('Failed to create user profile. Please try again.');
	}
}

// Generate username from email
function generateUsername(email: string): string {
	const baseUsername = email.split('@')[0];
	// Remove any special characters and ensure it's valid
	return baseUsername.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
}

// ===================
//   MAIN AUTH FUNCTIONS
// ===================

export async function signUp(credentials: {
	email: string;
	password: string;
	fullName?: string;
	username?: string;
	// Remove profilePictureUri parameter since we handle it separately
}) {
	try {
		console.log(
			'🚀 [AUTH] Attempting signup with email:',
			credentials.email
		);

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

		// Create auth user
		const { data, error } = await supabase.auth.signUp({
			email: credentials.email,
			password: credentials.password,
		});

		// NOTE: Log the full response for debugging
		console.log('🚀 [AUTH] Supabase signup response:', { data, error });

		if (error) {
			// NOTE: Specific error messages based on error codes
			console.error('🚀 [AUTH] Supabase signup error:', error);

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
					console.error('🚀 [AUTH] Original error:', error);
					throw new Error(`Signup failed: ${error.message}`);
			}
		}

		// Create basic profile if user was created and profile data provided
		if (data.user && (credentials.fullName || credentials.username)) {
			try {
				console.log('👤 [AUTH] Creating basic user profile...');
				console.log('👤 [AUTH] User ID:', data.user.id);
				console.log('👤 [AUTH] Profile data:', {
					fullName: credentials.fullName,
					username:
						credentials.username ||
						generateUsername(credentials.email),
				});

				// Generate username if not provided
				const username =
					credentials.username || generateUsername(credentials.email);

				// Create basic profile record (without avatar - handled separately)
				console.log('👤 [AUTH] Inserting basic profile record...');
				const profileData = {
					fullName: credentials.fullName || '',
					username: username,
					// No avatarUrl - will be handled by backend endpoint later
				};
				console.log('👤 [AUTH] Profile data to insert:', profileData);

				await createUserProfile(data.user.id, profileData);

				console.log('✅ [AUTH] Basic profile created successfully');
			} catch (profileError) {
				console.error(
					'⚠️ [AUTH] Basic profile creation failed, but auth user was created:',
					profileError
				);
				// Log more details about the error
				if (profileError instanceof Error) {
					console.error('⚠️ [AUTH] Profile error details:', {
						message: profileError.message,
						stack: profileError.stack,
					});
				}
				// Don't throw error here - user can still sign in and create profile later
				// Just log the warning
			}
		}

		console.log('✅ [AUTH] Signup successful:', data.user?.email);
		return data;
	} catch (error) {
		console.error('🚀 [AUTH] Signup error in auth service:', error);

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
