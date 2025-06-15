//	===============
//	CORE IMPORTS
//	===============
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { signUp } from '@/services/auth';

//	====================
// 	  TYPE DEFINITION
//	====================
type OnboardingFormData = {
	fullname: string;
	email: string;
	password: string;
	confirmPassword: string;
	profilePictureUri: string | null;

	// Message state
	messageShow: boolean;
	messageText: string;
	messageType: 'success' | 'error' | 'warning' | 'info';

	// Loading states
	isCreatingAccount: boolean;
	isUploadingProfilePicture: boolean;
};

//	====================
//	MAIN COMPONENT
//	====================
export const useOnboardingForm = () => {
	const { selections } = useLocalSearchParams();

	//	== THIS RECIEVES THE OBJECT [ARRAY] FROM THE STARTER PACK PAGE
	const getStarterPackSelections = (): string[] => {
		if (!selections || typeof selections !== 'string') {
			console.log('🔍 No selections found in URL parameters');
			return [];
		}

		try {
			const decoded = decodeURIComponent(selections);
			const parsed = JSON.parse(decoded);
			console.log('🔍 Parsed selections from URL:', parsed);
			return Array.isArray(parsed) ? parsed : [];
		} catch (error) {
			console.error('Error parsing selections from URL:', error);
			return [];
		}
	};

	const [formData, setFormData] = useState<OnboardingFormData>({
		fullname: '',
		email: '',
		password: '',
		confirmPassword: '',
		profilePictureUri: null,

		// Message state (NOTIFICATION)
		messageShow: false,
		messageText: '',
		messageType: 'info',

		// Loading states
		isCreatingAccount: false,
		isUploadingProfilePicture: false,
	});

	const updateFormField = <Field extends keyof OnboardingFormData>(
		field: Field,
		value: OnboardingFormData[Field]
	) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const resetForm = () => {
		updateFormField('fullname', '');
		updateFormField('email', '');
		updateFormField('password', '');
		updateFormField('confirmPassword', '');
		setProfilePicture(null);
		hideMessage();
	};

	//	== CLIENT SIDE VALIDATION ==
	const validateFormData = (): { isValid: boolean; errorMessage: string } => {
		const { email, password, confirmPassword, fullname } = formData;

		if (!fullname.trim()) {
			return {
				isValid: false,
				errorMessage: 'Please enter your full name.',
			};
		}

		if (!email.trim()) {
			return {
				isValid: false,
				errorMessage: 'Please enter your email address.',
			};
		}

		if (!email.includes('@') || email.length < 5) {
			return {
				isValid: false,
				errorMessage: 'Please enter a valid email address.',
			};
		}

		if (password.length < 6) {
			return {
				isValid: false,
				errorMessage: 'Password must be at least 6 characters long.',
			};
		}

		if (password !== confirmPassword) {
			return { isValid: false, errorMessage: 'Passwords do not match.' };
		}

		return { isValid: true, errorMessage: '' };
	};

	// PROFILE PICTURE HELPERS: Handle profile picture updates
	const setProfilePicture = (uri: string | null) => {
		updateFormField('profilePictureUri', uri);
	};

	//	== NOTIFICATION MESSAGES ==
	const showMessage = (
		message: string,
		type: OnboardingFormData['messageType'] = 'info'
	) => {
		setFormData((prev) => ({
			...prev,
			messageShow: true,
			messageText: message,
			messageType: type,
		}));
	};

	const hideMessage = () => {
		setFormData((prev) => ({
			...prev,
			messageShow: false,
		}));
	};

	//	== HANDLING THE SIGN UP PROCESS ==
	// PROFILE BUILDING: Create user profile data object
	const buildUserProfileData = (starterPackSelections: string[]) => {
		return {
			fullName: formData.fullname,
			email: formData.email,
			profilePictureUri: formData.profilePictureUri,
			starterPackPreferences: {
				selectedMemoryTypes: starterPackSelections,
				timestamp: new Date().toISOString(),
			},
			accountCreatedAt: new Date().toISOString(),
		};
	};

	const createUserAccountWithProfile = async (
		starterPackSelections: string[]
	) => {
		await signUp({
			email: formData.email,
			password: formData.password,
		});

		const userProfileData = buildUserProfileData(starterPackSelections);
		console.log(
			'@useOnboardingForm - User account data with enhanced state:',
			userProfileData
		);

		return userProfileData;
	};

	const handleAccountCreationSuccess = () => {
		showMessage(
			'Welcome to ReMap! Account created successfully.',
			'success'
		);
		router.replace('/worldmap');
	};

	const handleAccountCreationError = (error: any) => {
		console.error('Signup error:', error);
		const errorMessage =
			error?.message || 'Could not create account. Please try again.';
		showMessage(errorMessage, 'error');
	};

	const handleSignUp = async () => {
		const starterPackSelections = getStarterPackSelections();

		console.log(
			' @useOnboardingForm - handleSignUp automatically extracted selections:',
			starterPackSelections
		);

		const validation = validateFormData();
		if (!validation.isValid) {
			showMessage(validation.errorMessage, 'error');
			return;
		}

		setAccountCreationLoading(true);

		try {
			await createUserAccountWithProfile(starterPackSelections);
			handleAccountCreationSuccess();
		} catch (error) {
			handleAccountCreationError(error);
		} finally {
			setAccountCreationLoading(false);
		}
	};

	const setAccountCreationLoading = (isLoading: boolean) => {
		updateFormField('isCreatingAccount', isLoading);
	};

	return {
		formData,
		updateFormField,
		setProfilePicture,
		setAccountCreationLoading,
		validateFormData,
		resetForm,
		showMessage,
		hideMessage,
		handleSignUp,
	};
};
