// ================
//   CORE IMPORTS
// ================
import { useState } from 'react';
import { View, StyleSheet } from 'react-native';

// ================================
//   LAYOUT COMPONENTS
// ================================
import { Header } from '@/components/layout/Header';
import { MainContent } from '@/components/layout/MainContent';
import { Footer } from '@/components/layout/Footer';

// ============================
// 	UI COMPONENTS
// ============================
import { Button } from '@/components/ui/Button';
import {
	HeaderText,
	BodyText,
	SubheaderText,
} from '@/components/ui/Typography';
import { ReMapColors } from '@/constants/Colors';

// ==================
//   HOOK IMPORTS
// ==================
import { WELCOME_STEPS, WelcomeStep } from '@/constants/onboardingStaticData';
import { useNavigation } from '@/hooks/shared/useNavigation';

// ========================
//   COMPONENT DEFINITION
// ========================
export default function OnboardingWelcomeScreen() {
	const { goToPage } = useNavigation();

	// NAVIGATION HANDLERS
	const continueToStarterPack = () => goToPage('/onboarding/starterpack');
	const goBackToHome = () => goToPage('/');

	const renderWelcomeStep = (step: WelcomeStep, index: number) => (
		<View key={index} style={styles.stepContent}>
			<BodyText style={styles.stepIcon}>{step.icon}</BodyText>

			<HeaderText align="center" style={styles.stepTitle}>
				{step.title}
			</HeaderText>

			<BodyText align="center" style={styles.stepDescription}>
				{step.description}
			</BodyText>
		</View>
	);

	// ============================
	//   COMPONENT RENDER SECTION
	// ============================
	return (
		<View style={styles.container}>
			<Header title="Welcome to ReMap" />

			<MainContent scrollable={true}>
				<View style={styles.content}>
					{/* =================== */}
					{/*   WELCOME MESSAGE   */}
					{/* =================== */}
					<View style={styles.stepContent}>
						<BodyText style={styles.stepIcon}>🌏</BodyText>
						<SubheaderText align="center" style={styles.stepTitle}>
							Your Memory Atlas Awaits
						</SubheaderText>
						<BodyText align="center" style={styles.stepDescription}>
							Discover how ReMap transforms your experiences into
							an interactive journey
						</BodyText>
					</View>

					{/* ===================== */}
					{/*   ALL WELCOME STEPS   */}
					{/* ===================== */}
					<View style={styles.stepContent}>
						{WELCOME_STEPS.map((step, index) =>
							renderWelcomeStep(step, index)
						)}
					</View>
				</View>
			</MainContent>

			{/* ============ */}
			{/*   FOOTER     */}
			{/* ============ */}
			<Footer>
				<View style={styles.buttonContainer}>
					<View style={styles.secondaryActions}>
						<Button
							style={styles.secondaryButton}
							onPress={goBackToHome}
						>
							← Previous
						</Button>
						<Button
							style={styles.secondaryButton}
							onPress={continueToStarterPack}
						>
							Continue →
						</Button>
					</View>

					<Button
						style={styles.primaryButton}
						onPress={continueToStarterPack}
					>
						Skip Intro
					</Button>
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
		lineHeight: 30,
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
