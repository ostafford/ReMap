// ================
//   CORE IMPORTS
// ================
import { useState } from 'react';
import { router } from 'expo-router';
import { signUp, signIn } from '@/app/services/auth';
import RemapClient from '@/app/services/remap';

// ====================
//   TYPE DEFINITIONS
// ====================
export interface AccountCreationData {
	fullName: string;
	email: string;
	password: string;
	profilePictureUri?: string | null;
	starterPackSelections: string[];
}

export interface AccountCreationResult {
	success: boolean;
	error?: string;
	userProfileData?: any;
}

// ========================
//   COMPONENT DEFINITION
// ========================
export const useAccountCreation = () => {
	const [isCreatingAccount, setIsCreatingAccount] = useState(false);

	// Helper function to generate username
	const generateUsername = (email: string): string => {
		const baseUsername = email.split('@')[0];
		// Remove any special characters and ensure it's valid
		return baseUsername.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
	};

	// Build user profile data object
	const buildUserProfileData = (data: AccountCreationData) => {
		return {
			fullName: data.fullName,
			email: data.email,
			profilePictureUri: data.profilePictureUri,
			starterPackPreferences: {
				selectedMemoryTypes: data.starterPackSelections,
				timestamp: new Date().toISOString(),
			},
			accountCreatedAt: new Date().toISOString(),
		};
	};

	// Upload profile picture if provided
	const uploadProfilePicture = async (
		profilePictureUri: string,
		fullName: string,
		email: string
	) => {
		try {
			const remapClient = new RemapClient();

			// Create FormData for profile update
			const profileFormData = new FormData();
			profileFormData.append('full_name', fullName);
			profileFormData.append('username', generateUsername(email));

			// Add profile picture as avatar
			profileFormData.append('avatar', {
				uri: profilePictureUri,
				type: 'image/jpeg',
				name: 'profile-picture.jpg',
			} as any);

			// Upload via backend endpoint
			const profileResult = await remapClient.updateProfile(
				profileFormData
			);
			console.log(
				'✅ [ONBOARDING] Profile picture uploaded successfully:',
				profileResult
			);
			return true;
		} catch (profileError) {
			console.error(
				'⚠️ [ONBOARDING] Profile picture upload failed:',
				profileError
			);
			// Don't throw error - account was created successfully
			// User can upload profile picture later via the profile page
			return false;
		}
	};

	// Create user account with profile
	const createUserAccountWithProfile = async (
		data: AccountCreationData
	): Promise<AccountCreationResult> => {
		console.log(
			'🚀 [ONBOARDING] Starting account creation with profile data'
		);

		try {
			// Create account WITHOUT profile picture (using current auth.ts method)
			const result = await signUp({
				email: data.email,
				password: data.password,
				fullName: data.fullName,
			});

			console.log('✅ [ONBOARDING] Account created successfully');

			// Auto-sign-in the user to get authentication (JWT) token
			console.log('🔐 [ONBOARDING] Auto-signing in user...');
			await signIn({
				email: data.email,
				password: data.password,
			});

			console.log('✅ [ONBOARDING] User signed in successfully');

			// Upload profile picture if provided
			if (data.profilePictureUri) {
				console.log(
					'📤 [ONBOARDING] Uploading profile picture via backend...'
				);
				await uploadProfilePicture(
					data.profilePictureUri,
					data.fullName,
					data.email
				);
			}

			const userProfileData = buildUserProfileData(data);
			console.log(
				'✅ [ONBOARDING] User account created with profile:',
				userProfileData
			);

			return {
				success: true,
				userProfileData,
			};
		} catch (error: any) {
			console.error('🚀 [ONBOARDING] Account creation error:', error);
			return {
				success: false,
				error:
					error?.message ||
					'Could not create account. Please try again.',
			};
		}
	};

	// Main account creation handler
	const createAccount = async (
		data: AccountCreationData
	): Promise<AccountCreationResult> => {
		setIsCreatingAccount(true);

		try {
			const result = await createUserAccountWithProfile(data);

			if (result.success) {
				// Navigate to world map on success
				router.replace('/worldmap');
			}

			return result;
		} finally {
			setIsCreatingAccount(false);
		}
	};

	return {
		isCreatingAccount,
		createAccount,
		buildUserProfileData,
	};
};
