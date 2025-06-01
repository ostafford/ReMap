// ================
//   CORE IMPORTS
// ================
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

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
import { ErrorMessage } from '@/components/ui/Messages';

// ================================
//   INTERNAL 'TYPOGRAPHY' IMPORTS
// ================================
import { BodyText } from '@/components/ui/Typography';

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
export default function SplashScreen() {
	// ==================
	//   STATE MANAGEMENT
	// ==================
	const [messageState, setMessageState] = useState<MessageState>({
		show: false,
		message: '',
		type: 'info',
	});

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
	const validRoutes = ['/worldmap', '/onboarding'];

	const navigateToWorldMap = () => {
		const route = '/worldmap';

		if (!validRoutes.includes(route)) {
			showMessage(
				'Navigation error: This page is not available',
				'error'
			);
			return;
		}

		try {
			router.navigate(route);
		} catch (error) {
			console.error('Navigation failed:', error);
			showMessage(
				'Could not navigate to world map. Please try again.',
				'error'
			);
		}
	};

	const navigateToOnboarding = () => {
		const route = '/onboarding';

		if (!validRoutes.includes(route)) {
			showMessage(
				'Navigation error: This page is not available',
				'error'
			);
			return;
		}

		try {
			router.navigate(route);
		} catch (error) {
			console.error('Navigation failed:', error);
			showMessage(
				'Could not start onboarding. Please try again.',
				'error'
			);
		}
	};

	// ============================
	//   COMPONENT RENDER SECTION
	// ============================
	return (
		<View style={styles.container}>
			<Header title="ReMap" subtitle="Your Interactive Memory Atlas" />

			{/* Main content with globe */}
			<MainContent scrollable={false} style={styles.mainContent}>
				{messageState.show && messageState.type === 'error' && (
					<View style={styles.messageContainer}>
						<ErrorMessage onDismiss={hideMessage}>
							{messageState.message}
						</ErrorMessage>
					</View>
				)}

				<View style={styles.globeContainer}>
					<Canvas style={styles.canvas}>
						<ambientLight intensity={3} />
						<SpinningGlobe position={[0, 0, 0]} scale={1.8} />
					</Canvas>
				</View>

				<BodyText align="center" style={styles.description}>
					Transform your experiences into an interactive, personal
					atlas
				</BodyText>
			</MainContent>

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
	messageContainer: {
		width: '100%',
		paddingHorizontal: 20,
		marginBottom: 16,
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
		marginHorizontal: 20,
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
