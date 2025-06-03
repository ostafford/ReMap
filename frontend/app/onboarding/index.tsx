// ================
//   CORE IMPORTS
// ================
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

// =======================
//   THIRD-PARTY IMPORTS
// =======================
import { router } from 'expo-router';
import { Canvas } from '@react-three/fiber/native';

// ================================
//   INTERNAL 'LAYOUT' COMPONENTS
// ================================
import { Header } from '@/components/layout/Header';
import { MainContent } from '@/components/layout/MainContent';
import { Footer } from '@/components/layout/Footer';

// ============================
//   INTERNAL 'UI' COMPONENTS
// ============================
import { Button } from '@/components/ui/Button';
import { SpinningGlobe } from '@/components/ui/Globe';
import { ErrorMessage, WarningMessage } from '@/components/ui/Messages';

// ================================
//   INTERNAL 'TYPOGRAPHY' IMPORTS
// ================================
import { HeaderText, BodyText, CaptionText } from '@/components/ui/Typography';

// ================================
//   INTERNAL 'CONSTANTS' IMPORTS
// ================================
import { ReMapColors } from '@/constants/Colors';

// =========================
//   TYPE DEFINITIONS
// =========================
interface MessageState {
	show: boolean;
	message: string;
	type?: 'success' | 'error' | 'warning' | 'info';
}

// ========================
//   COMPONENT DEFINITION
// ========================
export default function OnboardingWelcomeScreen() {
	// ==================
	//   STATE MANAGEMENT
	// ==================
	const [currentStep, setCurrentStep] = useState(0);
	const [messageState, setMessageState] = useState<MessageState>({
		show: false,
		message: '',
	});

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

	// ====================
	//   MESSAGE HELPERS
	// ====================
	const showMessage = (
		message: string,
		type: MessageState['type'] = 'info'
	) => {
		setMessageState({ show: true, message, type });
	};

	const hideMessage = () => {
		setMessageState((prev) => ({ ...prev, show: false }));
	};

	// ==================
	//   EVENT HANDLERS
	// ==================
	const validRoutes = [
		'/',
		'/onboarding',
		'/onboarding/permissions',
		'/onboarding/account',
	];

	const nextStep = () => {
		if (currentStep < welcomeSteps.length - 1) {
			const newStep = currentStep + 1;
			setCurrentStep(newStep);
		} else {
			// Navigate to permissions
			navigateToRoute('/onboarding/permissions');
		}
	};

	const skipToAuth = () => {
		navigateToRoute('/onboarding/account');
	};

	const goBack = () => {
		if (currentStep > 0) {
			const newStep = currentStep - 1;
			setCurrentStep(newStep);
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
			router.navigate(route);
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
	const currentStepData = welcomeSteps[currentStep];
	const isLastStep = currentStep === welcomeSteps.length - 1;

	// ============================
	//   COMPONENT RENDER SECTION
	// ============================
	return (
		<View style={styles.container}>
			<Header title="Welcome to ReMap" />

			<MainContent scrollable={false}>
				<View style={styles.content}>
					{messageState.show && (
						<View style={styles.messageContainer}>
							{messageState.type === 'error' && (
								<ErrorMessage onDismiss={hideMessage}>
									{messageState.message}
								</ErrorMessage>
							)}

							{messageState.type === 'warning' && (
								<WarningMessage
									title="Skip Introduction?"
									onDismiss={hideMessage}
								>
									{messageState.message}
								</WarningMessage>
							)}
						</View>
					)}

					<View style={styles.progressContainer}>
						{welcomeSteps.map((_, index) => (
							<View
								key={index}
								style={[
									styles.progressDot,
									index === currentStep &&
										styles.progressDotActive,
									index < currentStep &&
										styles.progressDotCompleted,
								]}
							/>
						))}
					</View>

					{/* Globe Display */}
					<View style={styles.globeContainer}>
						<Canvas style={styles.canvas}>
							<ambientLight intensity={3} />
							<SpinningGlobe position={[0, 0, 0]} scale={1.2} />
						</Canvas>
					</View>

					<View style={styles.stepContent}>
						<BodyText style={styles.stepIcon}>
							{currentStepData.icon}
						</BodyText>

						<HeaderText align="center" style={styles.stepTitle}>
							{currentStepData.title}
						</HeaderText>

						<BodyText align="center" style={styles.stepDescription}>
							{currentStepData.description}
						</BodyText>
					</View>

					<View style={styles.featuresContainer}>
						<View style={styles.featureItem}>
							<BodyText style={styles.featureIcon}>📱</BodyText>

							<CaptionText
								align="center"
								style={styles.featureText}
							>
								Mobile-First Design
							</CaptionText>
						</View>
						<View style={styles.featureItem}>
							<BodyText style={styles.featureIcon}>🌍</BodyText>
							<CaptionText
								align="center"
								style={styles.featureText}
							>
								Global Community
							</CaptionText>
						</View>
						<View style={styles.featureItem}>
							<BodyText style={styles.featureIcon}>✨</BodyText>
							<CaptionText
								align="center"
								style={styles.featureText}
							>
								Authentic Stories
							</CaptionText>
						</View>
					</View>
				</View>
			</MainContent>

			<Footer>
				<View style={styles.buttonContainer}>
					<Button style={styles.primaryButton} onPress={nextStep}>
						{isLastStep ? '🚀 Get Started' : 'Continue'}
					</Button>

					<View style={styles.secondaryActions}>
						<Button style={styles.secondaryButton} onPress={goBack}>
							{currentStep > 0 ? '← Previous' : '← Back to Home'}
						</Button>

						<Button
							style={styles.tertiaryButton}
							onPress={skipToAuth}
						>
							Skip Intro →
						</Button>
					</View>
				</View>
			</Footer>
		</View>
	);
}

// =================
//   STYLE SECTION
// =================
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: ReMapColors.ui.background,
	},
	content: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 20,
	},
	messageContainer: {
		width: '100%',
		paddingHorizontal: 20,
		marginBottom: 16,
	},
	progressContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 20,
	},
	progressDot: {
		width: 12,
		height: 12,
		borderRadius: 6,
		backgroundColor: ReMapColors.ui.border,
		marginHorizontal: 6,
	},
	progressDotActive: {
		backgroundColor: ReMapColors.primary.violet,
		width: 16,
		height: 16,
		borderRadius: 8,
	},
	progressDotCompleted: {
		backgroundColor: ReMapColors.semantic.success,
	},
	globeContainer: {
		// height: 200,
		width: '100%',
		// marginVertical: 20,
	},
	canvas: {
		flex: 1,
	},
	stepContent: {
		alignItems: 'center',
		// paddingHorizontal: 30,
		marginVertical: 20,
	},
	stepIcon: {
		fontSize: 48,
		// marginBottom: 16,
		padding: 25,
	},
	stepTitle: {
		marginBottom: 12,
	},
	stepDescription: {},
	featuresContainer: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		width: '100%',
		paddingHorizontal: 20,
		marginTop: 20,
	},
	featureItem: {
		alignItems: 'center',
		flex: 1,
	},
	featureIcon: {
		fontSize: 24,
		marginBottom: 8,
	},
	featureText: {},
	buttonContainer: {
		width: '100%',
	},
	primaryButton: {
		backgroundColor: ReMapColors.primary.violet,
		width: '100%',
		marginBottom: 10,
	},
	secondaryActions: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 10,
	},
	secondaryButton: {
		backgroundColor: ReMapColors.ui.textSecondary,
		flex: 1,
	},
	tertiaryButton: {
		backgroundColor: ReMapColors.primary.blue,
		flex: 1,
	},
});
