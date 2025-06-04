// ================
//   CORE IMPORTS
// ================
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';

// =======================
//   THIRD-PARTY IMPORTS
// =======================
import { router, useLocalSearchParams } from 'expo-router';

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
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/TextInput';
import {
	SuccessMessage,
	ErrorMessage,
	WarningMessage,
	InfoMessage,
} from '@/components/ui/Messages';

// ================================
//   INTERNAL 'TYPOGRAPHY' IMPORTS
// ================================
import {
	HeaderText,
	BodyText,
	SubheaderText,
	BodySmallText,
	LabelText,
	CaptionText,
} from '@/components/ui/Typography';

// ================================
//   INTERNAL 'CONSTANTS' IMPORTS
// ================================
import { ReMapColors } from '@/constants/Colors';

// =============================
//   INTERNAL 'SERVICES' IMPORTS
// =============================
import {
	signIn,
	signUp,
	signOut,
	getCurrentUser,
	isSignedIn,
} from '@/services/auth';

// =========================
//   TYPE DEFINITIONS
// =========================
interface StarterPackSelection {
	id: string;
	name: string;
	icon: string;
	description: string;
	category: string;
	color: string;
}

interface StarterPackData {
	starterPacks: StarterPackSelection[];
	selectedIds: string[];
	timestamp: string;
	skipped?: boolean;
}

// ========================
//   COMPONENT DEFINITION
// ========================
export default function OnboardingAccountScreen() {
	// ==================
	//   ROUTE PARAMS
	// ==================
	const { starterPackSelections } = useLocalSearchParams();

	// ==================
	//   MODAL STATE
	// ==================
	const [isSignupModalVisible, setIsSignupModalVisible] = useState(false);
	const [isSkipModalVisible, setIsSkipModalVisible] = useState(false);

	// ==================
	//   FORM STATE
	// ==================
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [fullName, setFullName] = useState('');
	const [emailError, setEmailError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	// ==================
	//   MESSAGE STATE
	// ==================
	const [messageState, setMessageState] = useState({
		show: false,
		message: '',
		type: 'info' as 'success' | 'error' | 'warning' | 'info',
	});

	// ==================
	//   AUTH STATE
	// ==================
	const [currentUser, setCurrentUser] = useState<any>(null);
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);

	// ==================
	//   STARTER PACK STATE
	// ==================
	const [starterPackData, setStarterPackData] =
		useState<StarterPackData | null>(null);

	// ===========================
	//   PARSE STARTER PACK DATA
	// ===========================
	// [ CONSOLE/SERVER DEBUGGING RELATED ]
	useEffect(() => {
		if (starterPackSelections) {
			try {
				const parsedData = JSON.parse(starterPackSelections as string);
				setStarterPackData(parsedData);
				console.log('📦 Received starter pack data:', parsedData);
			} catch (error) {
				console.error('Error parsing starter pack selections:', error);
			}
		}
	}, [starterPackSelections]);

	// ====================
	//   AUTH DEFINITIONS
	// ====================
	// useEffect(() => {
	// 	checkCurrentUser();
	// }, []);

	// ==================
	//   HELPER FUNCTIONS
	// ==================
	const validateEmail = (email: string) => {
		if (!email) return 'Email is required';
		if (!email.includes('@')) return 'Invalid email format';
		if (email.length < 5) return 'Email too short';
		return '';
	};

	const showMessage = (
		message: string,
		type: typeof messageState.type = 'info'
	) => {
		setMessageState({ show: true, message, type });
	};

	const hideMessage = () => {
		setMessageState((prev) => ({ ...prev, show: false }));
	};

	const resetForm = () => {
		setEmail('');
		setPassword('');
		setFullName('');
		setEmailError('');
		setIsLoading(false);
		hideMessage();
	};

	// ===========================
	//   AUTHENTICATION HANDLERS
	// ===========================
	const handleSignUp = async () => {
		if (!email || !password || !fullName) {
			showMessage('Please fill out all required fields', 'warning');
			return;
		}

		// Check if user is already signed in
		if (currentUser) {
			showMessage(
				'You are already signed in. Please sign out first to create a new account.',
				'warning'
			);
			return;
		}

		const emailValidation = validateEmail(email);
		if (emailValidation) {
			setEmailError(emailValidation);
			showMessage('Please fix the email format', 'error');
			return;
		}

		if (password.length < 6) {
			showMessage('Password must be at least 6 characters', 'error');
			return;
		}

		setIsLoading(true);

		try {
			await signUp({ email, password });

			// Create user profile data including starter pack preferences
			const userProfileData = {
				fullName,
				email,
				starterPackPreferences: starterPackData,
				accountCreatedAt: new Date().toISOString(),
			};

			console.log(
				'📋 User account data with starter packs:',
				userProfileData
			);

			showMessage(
				'Welcome to ReMap! Account created successfully.',
				'success'
			);

			// Refresh current user info
			await checkCurrentUser();

			navigateToWorldMap();
		} catch (error: any) {
			console.error('Signup error:', error);
			const errorMessage =
				error?.message || 'Could not create account. Please try again.';
			showMessage(errorMessage, 'error');
		} finally {
			setIsLoading(false);
		}
	};

	// NOTE: Console/Server Debugging related. THIS IS NOT FOR USER
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

	// ==================
	//   EVENT HANDLERS
	// ==================
	const navigateToWorldMap = () => {
		resetForm();
		setIsSignupModalVisible(false);

		// Pass starter pack data to world map
		if (starterPackData && starterPackData.starterPacks.length > 0) {
			router.replace({
				pathname: '/worldmap',
				params: {
					userPreferences: JSON.stringify(starterPackData),
				},
			});
		} else {
			router.replace('/worldmap');
		}
	};

	const toggleSignupModal = () => {
		setIsSignupModalVisible(!isSignupModalVisible);
		resetForm();
	};

	const toggleSkipAuth = () => {
		setIsSkipModalVisible(true);
	};

	const confirmSkip = () => {
		setIsSkipModalVisible(false);
		navigateToWorldMap();
	};

	const cancelSkip = () => {
		setIsSkipModalVisible(false);
	};

	const validRoutes = ['/onboarding/starterpack'];
	const goBack = () => {
		const route = '/onboarding/starterpack';

		if (!validRoutes.includes(route)) {
			showMessage(
				'Navigation error: Previous page is not available.',
				'error'
			);
			return;
		}

		try {
			router.replace(route);
		} catch (error) {
			console.error('Navigation failed:', error);
			showMessage('Could not go back. Please try again.', 'error');
		}
	};
	// ==================
	//   COMPUTED VALUES
	// ==================
	const hasStarterPackSelections =
		starterPackData && starterPackData.starterPacks.length > 0;
	const selectionCount = starterPackData?.starterPacks.length || 0;

	// ============================
	//   COMPONENT RENDER SECTION
	// ============================
	return (
		<View style={styles.container}>
			<Header title="Create Your Account" />

			<MainContent>
				<View style={styles.content}>
					{/* Welcome section - only show if not signed in */}
					<View style={styles.welcomeSection}>
						<BodyText style={styles.welcomeIcon}>🎉</BodyText>
						<HeaderText align="center" style={styles.welcomeTitle}>
							You're Almost Ready!
						</HeaderText>
						<BodyText
							align="center"
							style={styles.welcomeDescription}
						>
							Create your ReMap account to start building your
							interactive memory atlas and connect with the
							community.
						</BodyText>
					</View>

					<View style={styles.benefitsContainer}>
						<SubheaderText style={styles.benefitsTitle}>
							With a ReMap account:
						</SubheaderText>

						{/* Starter Pack Summary */}
						{hasStarterPackSelections && (
							<View style={styles.selectionSummary}>
								<InfoMessage title="Your Selections">
									You've selected {selectionCount} starter
									pack
									{selectionCount !== 1 ? 's' : ''}. We'll
									personalize your map experience with these
									preferences!
								</InfoMessage>

								<View style={styles.selectedPacks}>
									{starterPackData?.starterPacks.map(
										(pack) => (
											<View
												key={pack.id}
												style={styles.packChip}
											>
												<BodySmallText
													style={styles.packChipText}
												>
													{pack.icon} {pack.name}
												</BodySmallText>
											</View>
										)
									)}
								</View>
							</View>
						)}

						<View style={styles.benefitsList}>
							<View style={styles.benefitItem}>
								<BodyText style={styles.benefitIcon}>
									💾
								</BodyText>
								<BodySmallText style={styles.benefitText}>
									Save and sync your memories across devices
								</BodySmallText>
							</View>

							<View style={styles.benefitItem}>
								<BodyText style={styles.benefitIcon}>
									🤝
								</BodyText>
								<BodySmallText style={styles.benefitText}>
									Share special moments with friends and
									family
								</BodySmallText>
							</View>

							<View style={styles.benefitItem}>
								<BodyText style={styles.benefitIcon}>
									🌍
								</BodyText>
								<BodySmallText style={styles.benefitText}>
									Discover and contribute to the global memory
									map
								</BodySmallText>
							</View>

							<View style={styles.benefitItem}>
								<BodyText style={styles.benefitIcon}>
									🔒
								</BodyText>
								<BodySmallText style={styles.benefitText}>
									Full control over your privacy and sharing
									settings
								</BodySmallText>
							</View>
						</View>
					</View>

					<View style={styles.accountOptions}>
						<LabelText align="center" style={styles.optionsTitle}>
							How would you like to proceed?
						</LabelText>
					</View>
				</View>
			</MainContent>

			<Footer>
				<View style={styles.buttonContainer}>
					<View style={styles.secondaryActions}>
						<Button style={styles.secondaryButton} onPress={goBack}>
							← Previous
						</Button>

						<Button
							style={styles.secondaryButton}
							onPress={toggleSkipAuth}
						>
							Skip for Now
						</Button>
					</View>
					<Button
						style={styles.primaryButton}
						onPress={toggleSignupModal}
					>
						Create New Account
					</Button>
				</View>
			</Footer>

			{/* ================
			      SIGNUP MODAL
			    ================ */}
			<Modal
				isVisible={isSignupModalVisible}
				onBackdropPress={toggleSignupModal}
			>
				<Modal.Container>
					<Modal.Header title="Join ReMap Community" />
					<Modal.Body>
						{/* Message Display */}
						{messageState.show &&
							messageState.type === 'success' && (
								<SuccessMessage
									title="Welcome to ReMap!"
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

						{/* Starter Pack Preview in Modal */}
						{hasStarterPackSelections && (
							<View style={styles.modalStarterPacks}>
								<LabelText style={styles.modalPacksTitle}>
									Your selected interests:
								</LabelText>
								<View style={styles.modalPacksList}>
									{starterPackData?.starterPacks.map(
										(pack) => (
											<CaptionText
												key={pack.id}
												style={styles.modalPackItem}
											>
												{pack.icon} {pack.name}
											</CaptionText>
										)
									)}
								</View>
							</View>
						)}

						{/* Form Inputs */}
						<Input
							label="Full Name"
							value={fullName}
							onChangeText={setFullName}
							required={true}
							placeholder="Enter your full name"
							autoCapitalize="words"
						/>
						<Input
							label="Email"
							value={email}
							onChangeText={(text) => {
								setEmail(text);
								setEmailError(validateEmail(text));
							}}
							error={emailError}
							required={true}
							placeholder="Enter your email"
							keyboardType="email-address"
							autoCapitalize="none"
						/>
						<Input
							label="Password"
							value={password}
							onChangeText={setPassword}
							required={true}
							placeholder="Password (min 6 characters)"
							secureTextEntry
							secureToggle={true}
						/>
					</Modal.Body>

					<Modal.Footer>
						<Button
							onPress={handleSignUp}
							style={[styles.modalButton, styles.signUpButton]}
							disabled={isLoading}
						>
							{isLoading ? 'Creating...' : 'Create'}
						</Button>
						<Button
							onPress={toggleSignupModal}
							style={[styles.modalButton, styles.cancelButton]}
							disabled={isLoading}
						>
							Cancel
						</Button>
					</Modal.Footer>
				</Modal.Container>
			</Modal>

			{/* ==============
			      SKIP MODAL
			    ============== */}
			<Modal isVisible={isSkipModalVisible} onBackdropPress={cancelSkip}>
				<Modal.Container>
					<Modal.Header title="Skip Account Setup?" />
					<Modal.Body>
						<WarningMessage title="Consider the Benefits">
							You can create an account later, but you'll miss out
							on:
							{'\n'}• Saving memories across devices
							{'\n'}• Sharing with friends and family
							{'\n'}• Contributing to the global memory map
							{'\n'}• Privacy controls for your content
							{hasStarterPackSelections &&
								'\n\n• Your personalized starter pack preferences'}
						</WarningMessage>
					</Modal.Body>

					<Modal.Footer>
						<Button
							onPress={confirmSkip}
							style={[
								styles.modalButton,
								styles.skipConfirmButton,
							]}
						>
							Skip for Now
						</Button>
						<Button
							onPress={cancelSkip}
							style={[styles.modalButton, styles.cancelButton]}
						>
							Go Back
						</Button>
					</Modal.Footer>
				</Modal.Container>
			</Modal>
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
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 40,
	},
	content: {
		flex: 1,
		paddingHorizontal: 20,
		paddingVertical: 20,
	},

	// Starter Pack Selection Summary
	selectionSummary: {
		marginBottom: 20,
	},
	selectedPacks: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		marginTop: 10,
	},
	packChip: {
		backgroundColor: ReMapColors.ui.cardBackground,
		borderRadius: 16,
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderWidth: 1,
		borderColor: ReMapColors.primary.violet,
	},
	packChipText: {
		color: ReMapColors.primary.violet,
		fontSize: 12,
	},

	// Modal Starter Pack Display
	modalStarterPacks: {
		backgroundColor: ReMapColors.ui.background,
		padding: 12,
		borderRadius: 8,
		marginBottom: 16,
		borderLeftWidth: 4,
		borderLeftColor: ReMapColors.primary.violet,
	},
	modalPacksTitle: {
		marginBottom: 8,
		color: ReMapColors.primary.violet,
	},
	modalPacksList: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	modalPackItem: {
		backgroundColor: ReMapColors.ui.cardBackground,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
	},

	// Existing styles
	currentUserContainer: {
		marginBottom: 30,
	},
	signOutButton: {
		marginTop: 15,
		backgroundColor: ReMapColors.semantic.error,
	},
	welcomeSection: {
		alignItems: 'center',
	},
	welcomeIcon: {
		fontSize: 50,
		padding: 40,
	},
	welcomeTitle: {
		marginBottom: 12,
	},
	welcomeDescription: {
		paddingHorizontal: 10,
	},
	benefitsContainer: {
		marginBottom: 30,
		marginTop: 20,
	},
	benefitsTitle: {
		marginBottom: 16,
	},
	benefitsList: {
		backgroundColor: ReMapColors.ui.cardBackground,
		borderRadius: 12,
		padding: 16,
	},
	benefitItem: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
	},
	benefitIcon: {
		fontSize: 18,
		marginRight: 12,
		width: 25,
	},
	benefitText: {
		flex: 1,
	},
	accountOptions: {
		alignItems: 'center',
		marginBottom: 20,
	},
	optionsTitle: {},
	buttonContainer: {
		width: '100%',
		gap: 10,
	},
	primaryButton: {
		backgroundColor: ReMapColors.primary.violet,
		width: '100%',
	},
	secondaryButton: {
		backgroundColor: ReMapColors.primary.cetacean,
		flex: 1,
	},
	secondaryActions: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 12,
	},
	backButton: {
		backgroundColor: ReMapColors.ui.textSecondary,
		flex: 1,
	},
	skipButton: {
		backgroundColor: ReMapColors.ui.textSecondary,
		flex: 1,
	},
	modalButton: {
		width: 150,
	},
	signUpButton: {
		backgroundColor: ReMapColors.primary.violet,
	},
	loginButton: {
		backgroundColor: ReMapColors.primary.blue,
	},
	cancelButton: {
		backgroundColor: ReMapColors.ui.textSecondary,
	},
	skipConfirmButton: {
		backgroundColor: ReMapColors.semantic.warning,
	},
});
