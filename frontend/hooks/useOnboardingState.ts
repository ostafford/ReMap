import { useState } from 'react';

// 1. TYPE DEFINITION: Blueprint for enhanced onboarding data structure
// Unified state structure for complete 4-step onboarding flow
type OnboardingState = {
	// Step progression (0-3 for 4 steps)
	currentStep: number;

	// Account creation data
	username: string;
	email: string;
	password: string;
	confirmPassword: string;
	profilePictureUri: string | null;
	termsAccepted: boolean;

	// Starter pack selections
	selectedInterests: string[];
	selectedMemoryTypes: string[];

	// UI state management
	messageShow: boolean;
	messageText: string;
	messageType: 'success' | 'error' | 'warning' | 'info';

	// Loading states
	isCreatingAccount: boolean;
	isUploadingProfilePicture: boolean;
};

// Step configuration type for validation and flow control
type StepConfig = {
	stepNumber: number;
	title: string;
	canSkip: boolean;
	requiredFields: (keyof OnboardingState)[];
};

// 2. CUSTOM HOOK: Encapsulates enhanced onboarding state business logic
export const useOnboardingState = () => {
	// 3. STATE MANAGEMENT: Empty canvas with initial values for 4-step flow
	const [onboardingState, setOnboardingState] = useState<OnboardingState>({
		// Step progression
		currentStep: 0,

		// Account creation data
		username: '',
		email: '',
		password: '',
		confirmPassword: '',
		profilePictureUri: null,
		termsAccepted: false,

		// Starter pack selections
		selectedInterests: [],
		selectedMemoryTypes: [],

		// UI state
		messageShow: false,
		messageText: '',
		messageType: 'info',

		// Loading states
		isCreatingAccount: false,
		isUploadingProfilePicture: false,
	});

	// Step configuration for validation and flow control
	const stepConfigs: StepConfig[] = [
		{
			stepNumber: 0,
			title: 'Welcome to ReMap',
			canSkip: true,
			requiredFields: [],
		},
		{
			stepNumber: 1,
			title: 'Choose Your Starter Pack',
			canSkip: true,
			requiredFields: [],
		},
		{
			stepNumber: 2,
			title: 'Create Your Account',
			canSkip: false,
			requiredFields: ['username', 'email', 'password', 'termsAccepted'],
		},
		{
			stepNumber: 3,
			title: 'Ready to Explore',
			canSkip: false,
			requiredFields: [],
		},
	];

	// 4. UPDATE FUNCTION: Generic function with type inference
	// Enhanced to handle complex nested updates for account data
	const updateField = <Field extends keyof OnboardingState>(
		field: Field,
		value: OnboardingState[Field]
	) => {
		setOnboardingState((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	// HELPER FUNCTIONS: Enhanced step navigation with validation
	// Advances to next step with validation and bounds checking
	const nextStep = () => {
		const currentConfig = stepConfigs[onboardingState.currentStep];
		const maxSteps = stepConfigs.length;

		// Check if we can proceed (validation)
		if (!canProceedToNextStep()) {
			return false;
		}

		setOnboardingState((prev) => ({
			...prev,
			currentStep:
				prev.currentStep < maxSteps - 1
					? prev.currentStep + 1
					: prev.currentStep,
		}));

		return true;
	};

	// Goes back to previous step with bounds checking
	const previousStep = () => {
		setOnboardingState((prev) => ({
			...prev,
			currentStep: prev.currentStep > 0 ? prev.currentStep - 1 : 0,
		}));
	};

	// Jumps to specific step with validation
	const goToStep = (step: number) => {
		const maxSteps = stepConfigs.length;
		if (step >= 0 && step < maxSteps) {
			setOnboardingState((prev) => ({
				...prev,
				currentStep: step,
			}));
		}
	};

	// VALIDATION FUNCTIONS: Account creation validation
	// Validates current step requirements
	const canProceedToNextStep = (): boolean => {
		const currentConfig = stepConfigs[onboardingState.currentStep];

		// Check required fields are filled
		for (const field of currentConfig.requiredFields) {
			const value = onboardingState[field];

			// Handle different types of validation
			if (field === 'termsAccepted' && !value) {
				showMessage(
					'Please accept the terms and conditions to continue.',
					'warning'
				);
				return false;
			}

			if (typeof value === 'string' && value.trim() === '') {
				showMessage(`Please fill in all required fields.`, 'warning');
				return false;
			}

			if (
				Array.isArray(value) &&
				value.length === 0 &&
				!currentConfig.canSkip
			) {
				showMessage(`Please make at least one selection.`, 'warning');
				return false;
			}
		}

		// Special validation for account creation step
		if (onboardingState.currentStep === 2) {
			return validateAccountFields();
		}

		return true;
	};

	// Validates account creation fields specifically
	const validateAccountFields = (): boolean => {
		const { email, password, confirmPassword } = onboardingState;

		// Email validation
		if (!email.includes('@') || email.length < 5) {
			showMessage('Please enter a valid email address.', 'error');
			return false;
		}

		// Password validation
		if (password.length < 6) {
			showMessage(
				'Password must be at least 6 characters long.',
				'error'
			);
			return false;
		}

		// Password confirmation validation
		if (password !== confirmPassword) {
			showMessage('Passwords do not match.', 'error');
			return false;
		}

		return true;
	};

	// ARRAY MANAGEMENT: Handle interests and memory types
	// Adds item to interests array
	const addInterest = (interest: string) => {
		setOnboardingState((prev) => ({
			...prev,
			selectedInterests: [
				...prev.selectedInterests.filter((i) => i !== interest),
				interest,
			],
		}));
	};

	// Removes item from interests array
	const removeInterest = (interest: string) => {
		setOnboardingState((prev) => ({
			...prev,
			selectedInterests: prev.selectedInterests.filter(
				(i) => i !== interest
			),
		}));
	};

	// Toggles interest selection
	const toggleInterest = (interest: string) => {
		if (onboardingState.selectedInterests.includes(interest)) {
			removeInterest(interest);
		} else {
			addInterest(interest);
		}
	};

	// Adds item to memory types array
	const addMemoryType = (memoryType: string) => {
		setOnboardingState((prev) => ({
			...prev,
			selectedMemoryTypes: [
				...prev.selectedMemoryTypes.filter((m) => m !== memoryType),
				memoryType,
			],
		}));
	};

	// Removes item from memory types array
	const removeMemoryType = (memoryType: string) => {
		setOnboardingState((prev) => ({
			...prev,
			selectedMemoryTypes: prev.selectedMemoryTypes.filter(
				(m) => m !== memoryType
			),
		}));
	};

	// Toggles memory type selection
	const toggleMemoryType = (memoryType: string) => {
		if (onboardingState.selectedMemoryTypes.includes(memoryType)) {
			removeMemoryType(memoryType);
		} else {
			addMemoryType(memoryType);
		}
	};

	// PROFILE PICTURE MANAGEMENT: Handle profile picture updates
	// Sets profile picture URI from media capture
	const setProfilePicture = (uri: string | null) => {
		setOnboardingState((prev) => ({
			...prev,
			profilePictureUri: uri,
		}));
	};

	// Sets profile picture upload loading state
	const setProfilePictureUploading = (isUploading: boolean) => {
		setOnboardingState((prev) => ({
			...prev,
			isUploadingProfilePicture: isUploading,
		}));
	};

	// LOADING STATE MANAGEMENT: Handle async operations
	// Sets account creation loading state
	const setAccountCreationLoading = (isLoading: boolean) => {
		setOnboardingState((prev) => ({
			...prev,
			isCreatingAccount: isLoading,
		}));
	};

	// MESSAGE MANAGEMENT: Enhanced message handling
	// Shows a message notification with specified type
	const showMessage = (
		message: string,
		type: OnboardingState['messageType'] = 'info'
	) => {
		setOnboardingState((prev) => ({
			...prev,
			messageShow: true,
			messageText: message,
			messageType: type,
		}));
	};

	// Hides the current message notification
	const hideMessage = () => {
		setOnboardingState((prev) => ({
			...prev,
			messageShow: false,
		}));
	};

	// COMPUTED VALUES: Enhanced derived state helpers
	// Gets current step configuration
	const getCurrentStepConfig = () => stepConfigs[onboardingState.currentStep];

	// Checks if currently on the first step
	const isFirstStep = () => onboardingState.currentStep === 0;

	// Checks if currently on the last step
	const isLastStep = () =>
		onboardingState.currentStep === stepConfigs.length - 1;

	// Gets current step progress as percentage
	const getProgressPercentage = () => {
		return ((onboardingState.currentStep + 1) / stepConfigs.length) * 100;
	};

	// Checks if current step can be skipped
	const canSkipCurrentStep = () => getCurrentStepConfig().canSkip;

	// Gets account creation summary
	const getAccountSummary = () => ({
		hasUsername: !!onboardingState.username,
		hasEmail: !!onboardingState.email,
		hasPassword: !!onboardingState.password,
		hasProfilePicture: !!onboardingState.profilePictureUri,
		termsAccepted: onboardingState.termsAccepted,
		isComplete: validateAccountFields() && onboardingState.termsAccepted,
	});

	// Gets starter pack summary
	const getStarterPackSummary = () => ({
		interestCount: onboardingState.selectedInterests.length,
		memoryTypeCount: onboardingState.selectedMemoryTypes.length,
		hasSelections:
			onboardingState.selectedInterests.length > 0 ||
			onboardingState.selectedMemoryTypes.length > 0,
	});

	// RESET FUNCTION: Reset to initial state
	const resetOnboarding = () => {
		setOnboardingState({
			currentStep: 0,
			username: '',
			email: '',
			password: '',
			confirmPassword: '',
			profilePictureUri: null,
			termsAccepted: false,
			selectedInterests: [],
			selectedMemoryTypes: [],
			messageShow: false,
			messageText: '',
			messageType: 'info',
			isCreatingAccount: false,
			isUploadingProfilePicture: false,
		});
	};

	// 5. RETURN INTERFACE: Enhanced public API for components
	return {
		// State
		onboardingState,

		// Generic update
		updateField,

		// Step navigation
		nextStep,
		previousStep,
		goToStep,

		// Validation
		canProceedToNextStep,
		validateAccountFields,

		// Array management
		toggleInterest,
		addInterest,
		removeInterest,
		toggleMemoryType,
		addMemoryType,
		removeMemoryType,

		// Profile picture management
		setProfilePicture,
		setProfilePictureUploading,

		// Loading states
		setAccountCreationLoading,

		// Messages
		showMessage,
		hideMessage,

		// Computed values
		getCurrentStepConfig,
		isFirstStep,
		isLastStep,
		getProgressPercentage,
		canSkipCurrentStep,
		getAccountSummary,
		getStarterPackSummary,

		// Utility
		resetOnboarding,
	};
};
