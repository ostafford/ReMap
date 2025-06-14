// 1. IMPORTS: React Native components and internal components
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas } from '@react-three/fiber/native';

// Internal Layout Components
import { Header } from '@/components/layout/Header';
import { MainContent } from '@/components/layout/MainContent';
import { Footer } from '@/components/layout/Footer';

// Internal UI Components
import { Button } from '@/components/ui/Button';
import { SpinningGlobe } from '@/components/ui/Globe';
import { ErrorMessage, WarningMessage } from '@/components/ui/Messages';

// Typography Components
import { HeaderText, BodyText, CaptionText } from '@/components/ui/Typography';

// Constants
import { ReMapColors } from '@/constants/Colors';

// TYPE DEFINITIONS: Props interface for the component
interface WelcomeStep {
	title: string;
	description: string;
	icon: string;
}

interface OnboardingUIProps {
	// State from hook
	onboardingState: {
		currentStep: number;
		messageShow: boolean;
		messageText: string;
		messageType: 'success' | 'error' | 'warning' | 'info';
	};

	// Static data
	welcomeSteps: WelcomeStep[];
	currentStepData: WelcomeStep;
	isCurrentlyLastStep: boolean;

	// Event handlers
	handlers: {
		onNext: () => void;
		onPrevious: () => void;
		onSkip: () => void;
		onHideMessage: () => void;
	};
}

// 2. FUNCTIONAL COMPONENT: Returns JSX
export const OnboardingUI = ({
	onboardingState,
	welcomeSteps,
	currentStepData,
	isCurrentlyLastStep,
	handlers,
}: OnboardingUIProps) => {
	// 3. JSX RETURN: Main UI structure
	return (
		<View style={styles.container}>
			<Header title="Welcome to ReMap" />

			<MainContent scrollable={false}>
				<View style={styles.content}>
					{/* MESSAGE PATTERN: Controlled component */}
					{onboardingState.messageShow && (
						<View style={styles.messageContainer}>
							{onboardingState.messageType === 'error' && (
								<ErrorMessage
									onDismiss={handlers.onHideMessage}
								>
									{onboardingState.messageText}
								</ErrorMessage>
							)}
							{onboardingState.messageType === 'warning' && (
								<WarningMessage
									onDismiss={handlers.onHideMessage}
								>
									{onboardingState.messageText}
								</WarningMessage>
							)}
						</View>
					)}

					{/* PROGRESS DOTS: Step indicator */}
					<View style={styles.progressContainer}>
						{welcomeSteps.map((_, index) => (
							<View
								key={index}
								style={[
									styles.progressDot,
									index === onboardingState.currentStep &&
										styles.progressDotActive,
									index < onboardingState.currentStep &&
										styles.progressDotCompleted,
								]}
							/>
						))}
					</View>

					{/* GLOBE DISPLAY: 3D Canvas element (commented out in original) */}
					{/* <View style={styles.globeContainer}>
            <Canvas style={styles.canvas}>
              <ambientLight intensity={3} />
              <SpinningGlobe position={[0, 0, 0]} scale={1.2} />
            </Canvas>
          </View> */}

					{/* STEP CONTENT: Current step display */}
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

					{/* FEATURE HIGHLIGHTS: Bottom feature grid */}
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

			{/* FOOTER: Navigation buttons */}
			<Footer>
				<View style={styles.buttonContainer}>
					{/* SECONDARY ACTIONS: Previous and Next buttons */}
					<View style={styles.secondaryActions}>
						<Button
							style={styles.secondaryButton}
							onPress={handlers.onPrevious}
						>
							{onboardingState.currentStep > 0
								? '← Previous'
								: '← Previous'}
						</Button>
						<Button
							style={styles.secondaryButton}
							onPress={handlers.onNext}
						>
							{isCurrentlyLastStep
								? 'Location Services'
								: 'Continue →'}
						</Button>
					</View>

					{/* PRIMARY ACTION: Skip button */}
					<Button
						style={styles.primaryButton}
						onPress={handlers.onSkip}
					>
						Skip Intro
					</Button>
				</View>
			</Footer>
		</View>
	);
};

// =================
//   STYLE SECTION
// =================
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: ReMapColors.ui.cardBackground,
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
		margin: 12,
	},
	featureItem: {
		alignItems: 'center',
		flex: 1,
	},
	featureIcon: {
		fontSize: 30,
		lineHeight: 38,
		marginBottom: 8,
	},
	featureText: {},
	buttonContainer: {
		width: '100%',
		gap: 10,
	},
	primaryButton: {
		// backgroundColor: ReMapColors.primary.violet,
		backgroundColor: ReMapColors.primary.testing,
		width: '100%',
	},
	secondaryActions: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 10,
	},
	secondaryButton: {
		backgroundColor: ReMapColors.primary.cadet,
		flex: 1,
	},
});
