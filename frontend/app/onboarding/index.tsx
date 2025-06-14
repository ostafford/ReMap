import React from 'react';

// =======================
//   THIRD-PARTY IMPORTS
// =======================
import { router } from 'expo-router';

import { useOnboardingState } from '@/hooks/useOnboardingState';
import { OnboardingUI } from '@/components/ui/OnboardingUI';
// ========================
//   COMPONENT DEFINITION
// ========================
export default function OnboardingWelcomeScreen() {
	// ==================
	//   STATE MANAGEMENT
	// ==================
	const {
		onboardingState,
		nextStep,
		previousStep,
		showMessage,
		hideMessage,
		isLastStep,
		canProceedToNextStep,
		getCurrentStepConfig,
	} = useOnboardingState();

	// ===============
	//   STATIC DATA
	// ===============
	const welcomeSteps = [
		{
			title: '📍 Pin Your Memories',
			description:
				'Transform your experiences into an interactive atlas. Every place has a story - yours.',
			icon: '🗺️',
		},
		{
			title: '🌟 Discover Authentic Stories',
			description:
				"Find genuine experiences from real people at places you're visiting or planning to explore.",
			icon: '👥',
		},
		{
			title: '🔒 Your Privacy, Your Choice',
			description:
				'Keep memories private, share with close friends, or contribute to the community - you decide.',
			icon: '🛡️',
		},
	];

	// ==================
	//   EVENT HANDLERS
	// ==================
	const validRoutes = ['/', '/onboarding', '/onboarding/starterpack'];

	const handleNext = () => {
		if (isLastStep()) {
			navigateToRoute('/onboarding/starterpack');
		} else {
			nextStep();
		}
	};

	const skipToStarterPack = () => {
		navigateToRoute('/onboarding/starterpack');
	};

	const goBack = () => {
		if (onboardingState.currentStep > 0) {
			previousStep();
		} else {
			navigateToRoute('/');
		}
	};

	// ===========================
	//   NAVIGATION HELPER
	// ===========================
	const navigateToRoute = (route: string) => {
		if (!validRoutes.includes(route)) {
			showMessage(
				`Navigation error: The page "${route}" is not available. Please try again or contact support.`,
				'error'
			);
			return;
		}

		try {
			router.navigate(route as any);
		} catch (error) {
			console.error('Navigation failed:', error);
			showMessage(
				'Could not navigate to the next page. Please try again.',
				'error'
			);
		}
	};

	// ==================
	//   COMPUTED VALUES
	// ==================
	const currentStepData = welcomeSteps[onboardingState.currentStep];
	const isCurrentlyLastStep = isLastStep();

	// ============================
	//   COMPONENT RENDER SECTION
	// ============================
	// RENDER METHOD: Layout composition
	return (
		<OnboardingUI
			onboardingState={onboardingState}
			welcomeSteps={welcomeSteps}
			currentStepData={currentStepData}
			isCurrentlyLastStep={isCurrentlyLastStep}
			handlers={{
				onNext: handleNext,
				onPrevious: goBack,
				onSkip: skipToStarterPack,
				onHideMessage: hideMessage,
			}}
		/>
	);
}
