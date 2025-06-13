// ================
//   CORE IMPORTS
// ================
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas } from '@react-three/fiber/native';

// ============================
//  Internal Layout Components
// ============================
import { Header } from '@/components/layout/Header';
import { MainContent } from '@/components/layout/MainContent';
import { Footer } from '@/components/layout/Footer';

// ============================
//  Internal UI Components
// ============================
import { Button } from '@/components/ui/Button';
import { SpinningGlobe } from '@/components/ui/Globe';
import { ErrorMessage } from '@/components/ui/Messages';
import { AuthModal } from '@/components/ui/AuthModal';

// ============================
//  Typography Components
// ============================
import { BodyText } from '@/components/ui/Typography';

// ============================
//  Constants Components
// ============================
import { ReMapColors } from '@/constants/Colors';

// Props interface for the component
// ============================
//  TYPE DEFINITIONS
// ============================
interface SplashUIProps {
	// State from hook
	splashState: {
		messageShow: boolean;
		messageText: string;
		messageType: 'success' | 'error' | 'warning' | 'info';
		isSignInModalVisible: boolean;
	};

	// Loading state
	isCheckingAuth: boolean;

	// 'void' essentially means i've done the thing (function) no need to tell me about it.
	handlers: {
		onNavigateToWorldMap: () => void;
		onNavigateToOnboarding: () => void;
		onToggleSignInModal: () => void;
		onCloseSignInModal: () => void;
		onHideMessage: () => void;
	};
}

// FUNCTIONAL COMPONENT
export const SplashUI = ({
	splashState,
	isCheckingAuth,
	handlers,
}: SplashUIProps) => {
	// Loading state
	if (isCheckingAuth) {
		return (
			<View style={styles.container}>
				<Header
					title="ReMap"
					subtitle="Your Interactive Memory Atlas"
				/>
				<MainContent scrollable={false} style={styles.mainContent}>
					<View style={styles.loadingContainer}>
						<View style={styles.globeContainer}>
							<Canvas style={styles.canvas}>
								<ambientLight intensity={3} />
								<SpinningGlobe
									position={[0, 0, 0]}
									scale={1.8}
								/>
							</Canvas>
						</View>
						<BodyText align="center" style={styles.loadingText}>
							Checking your authentication status...
						</BodyText>
					</View>
				</MainContent>
			</View>
		);
	}

	// 4. JSX RETURN: Main UI structure
	return (
		<View style={styles.container}>
			<Header title="ReMap" subtitle="Your Interactive Memory Atlas" />

			{/* ==================== */}
			{/*     Main content     */}
			{/* ==================== */}
			<MainContent scrollable={false} style={styles.mainContent}>
				{/* ERROR MESSAGE PATTERN: Controlled component */}
				{splashState.messageShow &&
					splashState.messageType === 'error' && (
						<View style={styles.messageContainer}>
							<ErrorMessage onDismiss={handlers.onHideMessage}>
								{splashState.messageText}
							</ErrorMessage>
						</View>
					)}

				{/* GLOBE CONTAINER: 3D Canvas element */}
				<View style={styles.globeContainer}>
					<Canvas style={styles.canvas}>
						<ambientLight intensity={3} />
						<SpinningGlobe position={[0, 0, 0]} scale={1.8} />
					</Canvas>
				</View>

				{/* DESCRIPTION TEXT */}
				<BodyText align="center" style={styles.description}>
					Transform your experiences into an interactive, personal
					atlas
				</BodyText>
			</MainContent>

			{/* ==================== */}
			{/*   FOOTER content     */}
			{/* ==================== */}
			<Footer>
				<View style={styles.buttonContainer}>
					<View style={styles.secondaryActions}>
						<Button
							style={styles.secondaryButton}
							onPress={handlers.onToggleSignInModal}
						>
							🔑 Sign In
						</Button>
						<Button
							style={styles.secondaryButton}
							onPress={handlers.onNavigateToOnboarding}
						>
							🚀 Start Onboarding
						</Button>
					</View>

					<Button
						style={styles.primaryButton}
						onPress={handlers.onNavigateToWorldMap}
					>
						🗺️ Explore World Map
					</Button>
				</View>
			</Footer>

			{/* ==================== */}
			{/* AUTH MODAL (SIGN-IN) */}
			{/* ==================== */}
			<AuthModal
				isVisible={splashState.isSignInModalVisible}
				onToggle={handlers.onCloseSignInModal}
				onSignInSuccess={handlers.onNavigateToWorldMap}
				styles={styles}
			/>
		</View>
	);
};

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
	loadingContainer: {
		flex: 1,
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
	loadingText: {
		marginTop: 16,
		fontSize: 16,
		color: ReMapColors.ui.textSecondary,
	},

	// Button Styles
	buttonContainer: {
		width: '100%',
		gap: 10,
	},
	primaryButton: {
		backgroundColor: ReMapColors.primary.violet,
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
	modalButton: {
		width: 150,
	},
	signInButton: {
		backgroundColor: ReMapColors.primary.blue,
	},
	cancelButton: {
		backgroundColor: ReMapColors.ui.textSecondary,
	},
	continueButton: {
		backgroundColor: ReMapColors.primary.violet,
		width: 200,
	},
});
