// ================
//   CORE IMPORTS
// ================
import React, { useState, useEffect } from 'react';
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
import {
	ErrorMessage,
	SuccessMessage,
	WarningMessage,
} from '@/components/ui/Messages';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/TextInput';

// ================================
//   INTERNAL 'TYPOGRAPHY' IMPORTS
// ================================
import {
	BodyText,
	HeaderText,
	SubheaderText,
	CaptionText,
} from '@/components/ui/Typography';

// ================================
//   INTERNAL 'CONSTANTS' IMPORTS
// ================================
import { ReMapColors } from '@/constants/Colors';

// =============================
//   INTERNAL 'SERVICES' IMPORTS
// =============================
import { signIn, getCurrentUser } from '@/services/auth';

// =========================
//   TYPE DEFINITIONS
// =========================
interface MessageState {
	show: boolean;
	message: string;
	type?: 'success' | 'error' | 'warning' | 'info';
}

// ========================
//   TESTING CONFIGURATION
// ========================
// TODO: Set this to test different welcome back experiences
const WELCOME_BACK_MODE: 'enhanced_loading' | 'modal' = 'enhanced_loading'; // Change this to test different modes

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

	// ==================
	//   AUTH STATE
	// ==================
	const [currentUser, setCurrentUser] = useState<any>(null);
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);
	const [showWelcomeBack, setShowWelcomeBack] = useState(false);

	// ==================
	//   MODAL STATE
	// ==================
	const [isSignInModalVisible, setIsSignInModalVisible] = useState(false);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [emailError, setEmailError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	// ====================
	//   AUTH DEFINITIONS
	// ====================
	useEffect(() => {
		checkCurrentUser();
	}, []);

	// Handle navigation after auth check
	useEffect(() => {
		if (!isCheckingAuth && currentUser) {
			console.log('✅ User is already signed in:', currentUser.email);

			if (WELCOME_BACK_MODE === 'modal') {
				// Show welcome modal then navigate
				setShowWelcomeBack(true);
			} else {
				// Enhanced loading mode - delay navigation to show welcome state
				setTimeout(() => {
					navigateToWorldMap();
				}, 5000); // 3 second delay to show welcome back info
			}
		}
	}, [isCheckingAuth, currentUser]);

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
	//   HELPER FUNCTIONS
	// ==================
	const validateEmail = (email: string) => {
		if (!email) return 'Email is required';
		if (!email.includes('@')) return 'Invalid email format';
		if (email.length < 5) return 'Email too short';
		return '';
	};

	const resetSignInForm = () => {
		setEmail('');
		setPassword('');
		setEmailError('');
		setIsLoading(false);
		hideMessage();
	};

	const getUserDisplayName = () => {
		if (!currentUser) return 'User';

		// Try to get user's name from various possible fields
		return (
			currentUser.user_metadata?.full_name ||
			currentUser.user_metadata?.name ||
			currentUser.email?.split('@')[0] ||
			'User'
		);
	};

	const getLastLoginTime = () => {
		if (!currentUser?.last_sign_in_at) return 'recently';

		const lastLogin = new Date(currentUser.last_sign_in_at);
		const now = new Date();
		const diffHours = Math.floor(
			(now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60)
		);

		if (diffHours < 1) return 'a few minutes ago';
		if (diffHours < 24) return `${diffHours} hours ago`;
		if (diffHours < 48) return 'yesterday';
		return `${Math.floor(diffHours / 24)} days ago`;
	};

	// ===========================
	//   AUTHENTICATION HANDLERS
	// ===========================
	const checkCurrentUser = async () => {
		setIsCheckingAuth(true);
		try {
			const userInfo = await getCurrentUser();
			setCurrentUser(userInfo.user);

			if (userInfo.user) {
				console.log('👤 Current user found:', userInfo.user.email);
			} else {
				console.log('👤 No current user session');
			}
		} catch (error) {
			console.error('Error checking current user:', error);
		} finally {
			setIsCheckingAuth(false);
		}
	};

	const handleSignIn = async () => {
		if (!email || !password) {
			showMessage('Please fill out all required fields', 'warning');
			return;
		}

		const emailValidation = validateEmail(email);
		if (emailValidation) {
			setEmailError(emailValidation);
			showMessage('Please check your email format', 'error');
			return;
		}

		setIsLoading(true);

		try {
			await signIn({ email, password });
			showMessage('Welcome back! Successfully signed in.', 'success');

			// Refresh current user info
			await checkCurrentUser();

			// Close modal and navigate
			setIsSignInModalVisible(false);
			resetSignInForm();
			navigateToWorldMap();
		} catch (error: any) {
			console.error('Login error:', error);
			const errorMessage =
				error?.message ||
				'Could not sign in. Please check your credentials.';
			showMessage(errorMessage, 'error');
		} finally {
			setIsLoading(false);
		}
	};

	// ==================
	//   EVENT HANDLERS
	// ==================
	const validRoutes = ['/worldmap', '/onboarding', '/onboarding/starterpack'];

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
		const route = '/onboarding/starterpack';

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

	const toggleSignInModal = () => {
		setIsSignInModalVisible(!isSignInModalVisible);
		resetSignInForm();
	};

	const handleWelcomeBackClose = () => {
		setShowWelcomeBack(false);
		navigateToWorldMap();
	};

	// ============================
	//   ENHANCED LOADING STATE
	// ============================
	if (
		isCheckingAuth ||
		(currentUser && WELCOME_BACK_MODE === 'enhanced_loading')
	) {
		const isWelcomeBack = !isCheckingAuth && currentUser;

		return (
			<View style={styles.container}>
				<Header
					title={
						isWelcomeBack
							? `Welcome back, ${getUserDisplayName()}!`
							: 'ReMap'
					}
					subtitle={
						isWelcomeBack
							? 'Ready to explore your memories?'
							: 'Your Interactive Memory Atlas'
					}
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

						{isWelcomeBack ? (
							<View style={styles.welcomeBackInfo}>
								<HeaderText
									align="center"
									style={styles.welcomeTitle}
								>
									🎉 Great to see you again!
								</HeaderText>
								<BodyText
									align="center"
									style={styles.welcomeMessage}
								>
									You last visited {getLastLoginTime()}
								</BodyText>
								<View style={styles.userInfoCard}>
									<BodyText style={styles.userEmail}>
										📧 {currentUser.email}
									</BodyText>
									<CaptionText style={styles.userMeta}>
										Member since{' '}
										{new Date(
											currentUser.created_at
										).toLocaleDateString()}
									</CaptionText>
								</View>
								<CaptionText
									align="center"
									style={styles.loadingText}
								>
									Loading your memory atlas...
								</CaptionText>
							</View>
						) : (
							<BodyText align="center" style={styles.loadingText}>
								Checking your authentication status...
							</BodyText>
						)}
					</View>
				</MainContent>
			</View>
		);
	}

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

					<View style={styles.secondaryActions}>
						<Button
							style={styles.secondaryButton}
							onPress={navigateToOnboarding}
						>
							🚀 Start Onboarding
						</Button>

						<Button
							style={styles.tertiaryButton}
							onPress={toggleSignInModal}
						>
							🔑 Sign In
						</Button>
					</View>
				</View>
			</Footer>

			{/* ===============
			      SIGN IN MODAL
			    =============== */}
			<Modal
				isVisible={isSignInModalVisible}
				onBackdropPress={toggleSignInModal}
			>
				<Modal.Container>
					<Modal.Header title="Welcome Back!" />
					<Modal.Body>
						{/* Message Display */}
						{messageState.show &&
							messageState.type === 'success' && (
								<SuccessMessage
									title="Welcome Back!"
									onDismiss={hideMessage}
								>
									{messageState.message}
								</SuccessMessage>
							)}

						{messageState.show && messageState.type === 'error' && (
							<ErrorMessage onDismiss={hideMessage}>
								{messageState.message}
							</ErrorMessage>
						)}

						{messageState.show &&
							messageState.type === 'warning' && (
								<WarningMessage onDismiss={hideMessage}>
									{messageState.message}
								</WarningMessage>
							)}

						{/* Form Inputs */}
						<Input
							value={email}
							onChangeText={(text) => {
								setEmail(text);
								setEmailError(validateEmail(text));
							}}
							error={emailError}
							label="Email"
							placeholder="Enter your email"
							keyboardType="email-address"
							autoCapitalize="none"
						/>
						<Input
							value={password}
							onChangeText={setPassword}
							label="Password"
							placeholder="Enter your password"
							secureTextEntry
							secureToggle
						/>
					</Modal.Body>

					<Modal.Footer>
						<Button
							onPress={handleSignIn}
							style={[styles.modalButton, styles.signInButton]}
							disabled={isLoading}
						>
							{isLoading ? 'Signing In...' : 'Sign In'}
						</Button>
						<Button
							onPress={toggleSignInModal}
							style={[styles.modalButton, styles.cancelButton]}
							disabled={isLoading}
						>
							Cancel
						</Button>
					</Modal.Footer>
				</Modal.Container>
			</Modal>

			{/* ===============
				WELCOME BACK MODAL
			    =============== */}
			{WELCOME_BACK_MODE === 'modal' && (
				<Modal
					isVisible={showWelcomeBack}
					onBackdropPress={handleWelcomeBackClose}
				>
					<Modal.Container>
						<Modal.Header
							title={`Welcome back, ${getUserDisplayName()}! 🎉`}
						/>
						<Modal.Body>
							<View style={styles.welcomeModalContent}>
								<BodyText
									align="center"
									style={styles.welcomeModalMessage}
								>
									Great to see you again! You last visited{' '}
									{getLastLoginTime()}.
								</BodyText>

								<View style={styles.userInfoCard}>
									<BodyText style={styles.userEmail}>
										📧 {currentUser?.email}
									</BodyText>
									<CaptionText style={styles.userMeta}>
										Member since{' '}
										{currentUser
											? new Date(
													currentUser.created_at
											  ).toLocaleDateString()
											: ''}
									</CaptionText>
								</View>

								<View style={styles.quickStats}>
									<SubheaderText
										align="center"
										style={styles.statsTitle}
									>
										Your ReMap Journey
									</SubheaderText>
									<View style={styles.statsGrid}>
										<View style={styles.statItem}>
											<BodyText style={styles.statNumber}>
												🗺️
											</BodyText>
											<CaptionText
												style={styles.statLabel}
											>
												Ready to explore
											</CaptionText>
										</View>
										<View style={styles.statItem}>
											<BodyText style={styles.statNumber}>
												📍
											</BodyText>
											<CaptionText
												style={styles.statLabel}
											>
												Pin new memories
											</CaptionText>
										</View>
										<View style={styles.statItem}>
											<BodyText style={styles.statNumber}>
												🌟
											</BodyText>
											<CaptionText
												style={styles.statLabel}
											>
												Discover stories
											</CaptionText>
										</View>
									</View>
								</View>
							</View>
						</Modal.Body>

						<Modal.Footer>
							<Button
								onPress={handleWelcomeBackClose}
								style={[
									styles.modalButton,
									styles.continueButton,
								]}
							>
								Continue to World Map 🚀
							</Button>
						</Modal.Footer>
					</Modal.Container>
				</Modal>
			)}
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

	// Option 4: Enhanced Loading State Styles
	welcomeBackInfo: {
		alignItems: 'center',
		paddingHorizontal: 20,
	},
	welcomeTitle: {
		marginBottom: 8,
		color: ReMapColors.primary.violet,
	},
	welcomeMessage: {
		marginBottom: 20,
		color: ReMapColors.ui.textSecondary,
	},
	userInfoCard: {
		backgroundColor: ReMapColors.ui.cardBackground,
		padding: 16,
		borderRadius: 12,
		marginBottom: 20,
		borderLeftWidth: 4,
		borderLeftColor: ReMapColors.primary.violet,
		width: '100%',
		alignItems: 'center',
	},
	userEmail: {
		marginBottom: 4,
		color: ReMapColors.ui.text,
	},
	userMeta: {
		color: ReMapColors.ui.textSecondary,
	},

	// Option 1: Modal Styles
	welcomeModalContent: {
		alignItems: 'center',
	},
	welcomeModalMessage: {
		marginBottom: 20,
		color: ReMapColors.ui.textSecondary,
	},
	quickStats: {
		width: '100%',
		marginTop: 20,
	},
	statsTitle: {
		marginBottom: 16,
		color: ReMapColors.primary.violet,
	},
	statsGrid: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		paddingHorizontal: 10,
	},
	statItem: {
		alignItems: 'center',
		flex: 1,
	},
	statNumber: {
		fontSize: 24,
		marginBottom: 4,
	},
	statLabel: {
		textAlign: 'center',
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
		backgroundColor: ReMapColors.primary.blue,
		flex: 1,
	},
	tertiaryButton: {
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
