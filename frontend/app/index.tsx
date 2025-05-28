// ================
//   CORE IMPORTS
// ================
import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';

// =======================
//   THIRD-PARTY IMPORTS
// =======================
import { Canvas } from '@react-three/fiber/native';
import { router } from 'expo-router';

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
// Function to run the page essentially
export default function SplashScreen() {
	// ==================
	//   EVENT HANDLERS
	// ==================
	// Expo-router navigating what pages can be accessed
	// Added Error handling for both us and users
	const validRoutes = ['/worldmap', '/onboarding'];

	const navigateToWorldMap = () => {
		const route = '/worldmap';

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
	const navigateToOnboarding = () => {
		const route = '/onboarding';

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

	// ============================
	//   COMPONENT RENDER SECTION
	// ============================
	// Where we put the components together and link the 'handlers' above together.
	// STRUCTURE: HEADER -> MAIN -> FOOTER
	return (
		<View style={styles.container}>
			{/* Header with app name */}
			<Header title="ReMap" subtitle="Your Interactive Memory Atlas" />

			{/* Main content with globe */}
			<MainContent scrollable={false} style={styles.mainContent}>
				<View style={styles.globeContainer}>
					<Canvas style={styles.canvas}>
						<ambientLight intensity={3} />
						<SpinningGlobe position={[0, 0, 0]} scale={1.8} />
					</Canvas>
				</View>

				<Text style={styles.description}>
					Transform your experiences into an interactive, personal
					atlas
				</Text>
			</MainContent>

			{/* Footer with your two buttons */}
			<Footer>
				<View style={styles.buttonContainer}>
					<Button
						style={styles.primaryButton}
						onPress={navigateToWorldMap}
					>
						🗺️ Explore World Map
					</Button>

					<Button
						style={styles.secondaryButton}
						onPress={navigateToOnboarding}
					>
						🚀 Start Onboarding
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
		backgroundColor: ReMapColors.ui.background,
	},
	mainContent: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	globeContainer: {
		height: 300,
		width: '100%',
		marginVertical: 20,
	},
	canvas: {
		flex: 1,
	},
	description: {
		fontSize: 16,
		color: ReMapColors.ui.textSecondary,
		textAlign: 'center',
		marginHorizontal: 20,
		lineHeight: 24,
	},
	buttonContainer: {
		width: '100%',
		gap: 10,
	},
	primaryButton: {
		backgroundColor: ReMapColors.primary.violet,
		width: '100%',
	},
	secondaryButton: {
		backgroundColor: ReMapColors.primary.blue,
		width: '100%',
	},
});
