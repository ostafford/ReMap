// ================
//   CORE IMPORTS
// ================
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';

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

// ================================
//   INTERNAL 'CONSTANTS' IMPORTS
// ================================
import { ReMapColors } from '@/constants/Colors';

// ========================
//   COMPONENT DEFINITION
// ========================
export default function OnboardingWelcomeScreen() {
	// Goes through the accordion like method
	const [currentStep, setCurrentStep] = useState(0);

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
	const validRoutes = ['/', '/onboarding/permissions', '/onboarding/account'];

	const nextStep = () => {
		const route = '/onboarding/permissions';

		if (currentStep < welcomeSteps.length - 1) {
			setCurrentStep(currentStep + 1);
		} else {
			if (!validRoutes.includes(route)) {
				Alert.alert('Error', 'This page is not available');
				return;
			}

			try {
				router.navigate(route);
			} catch (error) {
				console.error('Navigation failed:', error);
			}
		}
	};

	const skipToAuth = () => {
		const route = '/onboarding/account';

		if (!validRoutes.includes(route)) {
			Alert.alert('Error', 'This page is not available');
			return;
		}

		try {
			router.navigate(route);
		} catch (error) {
			console.error('Navigation failed:', error);
		}
	};

	const goBack = () => {
		const route = '/';
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		} else {
			if (!validRoutes.includes(route)) {
				Alert.alert('Error', 'This page is not available');
				return;
			}

			try {
				router.navigate(route);
			} catch (error) {
				console.error('Navigation failed:', error);
			}
		}
	};

	// NOTE: STEP STATUS FROM ABOVE
	const currentStepData = welcomeSteps[currentStep];

	// ============================
	//   COMPONENT RENDER SECTION
	// ============================
	return (
		<View style={styles.container}>
			<Header title="Welcome to ReMap" />

			<MainContent scrollable={false}>
				<View style={styles.content}>
					{/* Progress Indicators */}
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

					{/* Current Step Content */}
					<View style={styles.stepContent}>
						<Text style={styles.stepIcon}>
							{currentStepData.icon}
						</Text>
						<Text style={styles.stepTitle}>
							{currentStepData.title}
						</Text>
						<Text style={styles.stepDescription}>
							{currentStepData.description}
						</Text>
					</View>

					{/* Features Preview */}
					<View style={styles.featuresContainer}>
						<View style={styles.featureItem}>
							<Text style={styles.featureIcon}>📱</Text>
							<Text style={styles.featureText}>
								Mobile-First Design
							</Text>
						</View>
						<View style={styles.featureItem}>
							<Text style={styles.featureIcon}>🌍</Text>
							<Text style={styles.featureText}>
								Global Community
							</Text>
						</View>
						<View style={styles.featureItem}>
							<Text style={styles.featureIcon}>✨</Text>
							<Text style={styles.featureText}>
								Authentic Stories
							</Text>
						</View>
					</View>
				</View>
			</MainContent>

			<Footer>
				<View style={styles.buttonContainer}>
					{/* Primary Action Button */}
					<Button style={styles.primaryButton} onPress={nextStep}>
						{currentStep < welcomeSteps.length - 1
							? 'Continue'
							: '🚀 Get Started'}
					</Button>

					{/* Secondary Actions */}
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
		height: 200,
		width: '80%',
		marginVertical: 20,
	},
	canvas: {
		flex: 1,
	},
	stepContent: {
		alignItems: 'center',
		paddingHorizontal: 30,
		marginVertical: 20,
	},
	stepIcon: {
		fontSize: 48,
		marginBottom: 16,
	},
	stepTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		color: ReMapColors.ui.text,
		textAlign: 'center',
		marginBottom: 12,
	},
	stepDescription: {
		fontSize: 16,
		color: ReMapColors.ui.textSecondary,
		textAlign: 'center',
		lineHeight: 24,
	},
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
	featureText: {
		fontSize: 12,
		color: ReMapColors.ui.textSecondary,
		textAlign: 'center',
		fontWeight: '500',
	},
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
