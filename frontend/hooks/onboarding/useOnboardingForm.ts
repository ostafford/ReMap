//	===============
//	CORE IMPORTS
//	===============
import { useFormValidation, type FormData } from './useFormValidation';
import {
	useAccountCreation,
	type AccountCreationData,
} from './useAccountCreation';
import { useOnboardingMessages } from './useOnboardingMessages';
import { useOnboardingContext } from '@/contexts/OnboardingContext';

//	====================
// 	  TYPE DEFINITION
//	====================
type OnboardingFormData = FormData & {
	profilePictureUri: string | null;
};

//	====================
//	MAIN COMPONENT
//	====================
export const useOnboardingForm = () => {
	// Use focused hooks
	const {
		formData,
		updateFormField,
		resetForm: resetFormData,
		validateFormData,
	} = useFormValidation();

	const { isCreatingAccount, createAccount } = useAccountCreation();
	const { messageState, showMessage, hideMessage, showSuccess, showError } =
		useOnboardingMessages();

	// Use onboarding context
	const { state, updateProfilePicture, resetOnboarding } =
		useOnboardingContext();

	// Combined form data
	const combinedFormData: OnboardingFormData = {
		...formData,
		profilePictureUri: state.profilePictureUri,
	};

	// Reset form including profile picture
	const resetForm = () => {
		resetFormData();
		updateProfilePicture(null);
		hideMessage();
	};

	// Profile picture helpers
	const setProfilePicture = (uri: string | null) => {
		updateProfilePicture(uri);
	};

	// Main sign up handler
	const handleSignUp = async () => {
		const starterPackSelections = state.starterPackSelections;

		console.log(
			'🚀 [ONBOARDING] handleSignUp with selections:',
			starterPackSelections
		);

		const validation = validateFormData();
		if (!validation.isValid) {
			showError(validation.errorMessage);
			return;
		}

		// Prepare account creation data
		const accountData: AccountCreationData = {
			fullName: formData.fullname,
			email: formData.email,
			password: formData.password,
			profilePictureUri: state.profilePictureUri,
			starterPackSelections,
		};

		// Create account
		const result = await createAccount(accountData);

		if (result.success) {
			showSuccess(
				'Welcome to ReMap! Your account and profile have been created successfully.'
			);
			// Reset onboarding state after successful account creation
			resetOnboarding();
		} else {
			showError(
				result.error || 'Could not create account. Please try again.'
			);
		}
	};

	return {
		formData: {
			...combinedFormData,
			// Include message state for backward compatibility
			messageShow: messageState.messageShow,
			messageText: messageState.messageText,
			messageType: messageState.messageType,
			isCreatingAccount,
		},
		updateFormField,
		setProfilePicture,
		resetForm,
		showMessage,
		hideMessage,
		handleSignUp,
	};
};
