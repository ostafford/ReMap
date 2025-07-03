// ================
//   CORE IMPORTS
// ================
import React, { createContext, useContext, useState, ReactNode } from 'react';

// ====================
//   TYPE DEFINITIONS
// ====================
export interface OnboardingState {
	starterPackSelections: string[];
	profilePictureUri: string | null;
	formData: {
		fullname: string;
		email: string;
		password: string;
		confirmPassword: string;
	};
}

export interface OnboardingContextType {
	state: OnboardingState;
	updateStarterPackSelections: (selections: string[]) => void;
	updateProfilePicture: (uri: string | null) => void;
	updateFormData: (
		field: keyof OnboardingState['formData'],
		value: string
	) => void;
	resetOnboarding: () => void;
}

// ========================
//   CONTEXT DEFINITION
// ========================
const OnboardingContext = createContext<OnboardingContextType | undefined>(
	undefined
);

// ========================
//   PROVIDER COMPONENT
// ========================
interface OnboardingProviderProps {
	children: ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({
	children,
}) => {
	const [state, setState] = useState<OnboardingState>({
		starterPackSelections: [],
		profilePictureUri: null,
		formData: {
			fullname: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
	});

	// Update starter pack selections
	const updateStarterPackSelections = (selections: string[]) => {
		setState((prev) => ({
			...prev,
			starterPackSelections: selections,
		}));
	};

	// Update profile picture
	const updateProfilePicture = (uri: string | null) => {
		setState((prev) => ({
			...prev,
			profilePictureUri: uri,
		}));
	};

	// Update form data
	const updateFormData = (
		field: keyof OnboardingState['formData'],
		value: string
	) => {
		setState((prev) => ({
			...prev,
			formData: {
				...prev.formData,
				[field]: value,
			},
		}));
	};

	// Reset all onboarding state
	const resetOnboarding = () => {
		setState({
			starterPackSelections: [],
			profilePictureUri: null,
			formData: {
				fullname: '',
				email: '',
				password: '',
				confirmPassword: '',
			},
		});
	};

	const contextValue: OnboardingContextType = {
		state,
		updateStarterPackSelections,
		updateProfilePicture,
		updateFormData,
		resetOnboarding,
	};

	return (
		<OnboardingContext.Provider value={contextValue}>
			{children}
		</OnboardingContext.Provider>
	);
};

// ========================
//   CUSTOM HOOK
// ========================
export const useOnboardingContext = () => {
	const context = useContext(OnboardingContext);
	if (context === undefined) {
		throw new Error(
			'useOnboardingContext must be used within an OnboardingProvider'
		);
	}
	return context;
};
