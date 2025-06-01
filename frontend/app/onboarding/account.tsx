// ================
//   CORE IMPORTS
// ================
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

// =======================
//   THIRD-PARTY IMPORTS
// =======================
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
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/TextInput';
import {
	SuccessMessage,
	ErrorMessage,
	WarningMessage,
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
} from '@/components/ui/Typography';

// ================================
//   INTERNAL 'CONSTANTS' IMPORTS
// ================================
import { ReMapColors } from '@/constants/Colors';

// =============================
//   INTERNAL 'SERVICES' IMPORTS
// =============================
import { signIn, signUp } from '@/services/auth';

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
export default function OnboardingAccountScreen() {
	// ==================
	//   MODAL STATE
	// ==================
	const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
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
	const [messageState, setMessageState] = useState<MessageState>({
		show: false,
		message: '',
		type: 'info',
	});

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
		type: MessageState['type'] = 'info'
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

	// ==================
	//   MODAL CONTROLS
	// ==================
	const toggleLoginModal = () => {
		setIsLoginModalVisible(!isLoginModalVisible);
		resetForm();
	};

	const toggleSignupModal = () => {
		setIsSignupModalVisible(!isSignupModalVisible);
		resetForm();
	};

	// ===========================
	//   AUTHENTICATION HANDLERS
	// ===========================
	const handleSignUp = async () => {
		if (!email || !password || !fullName) {
			showMessage('Please fill out all required fields', 'warning');
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

			showMessage(
				'Welcome to ReMap! Account created successfully.',
				'success'
			);

			setTimeout(() => {
				navigateToWorldMap();
			}, 2000);
		} catch (error: any) {
			console.error('Signup error:', error);
			const errorMessage =
				error?.message || 'Could not create account. Please try again.';
			showMessage(errorMessage, 'error');
		} finally {
			setIsLoading(false);
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

			setTimeout(() => {
				navigateToWorldMap();
			}, 1500);
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
	const navigateToWorldMap = () => {
		resetForm();
		setIsLoginModalVisible(false);
		setIsSignupModalVisible(false);
		router.replace('/worldmap');
	};

	const skipAuth = () => {
		setIsSkipModalVisible(true);
	};

	const confirmSkip = () => {
		setIsSkipModalVisible(false);
		router.replace('/worldmap');
	};

	const cancelSkip = () => {
		setIsSkipModalVisible(false);
	};

	const goBack = () => {
		router.back();
	};

	// ============================
	//   COMPONENT RENDER SECTION
	// ============================
	return (
		<View style={styles.container}>
			<Header
				title="Create Your Account"
				subtitle="Step 3 of 3 - Almost there!"
			/>

			<MainContent>
				<View style={styles.content}>
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
					<Button
						style={styles.primaryButton}
						onPress={toggleSignupModal}
					>
						🚀 Create New Account
					</Button>

					<Button
						style={styles.secondaryButton}
						onPress={toggleLoginModal}
					>
						🔑 I Already Have an Account
					</Button>

					<View style={styles.navigationActions}>
						<Button style={styles.backButton} onPress={goBack}>
							← Previous
						</Button>

						<Button style={styles.skipButton} onPress={skipAuth}>
							Skip for Now
						</Button>
					</View>
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

			{/* ===============
			      LOGIN MODAL
			    =============== */}
			<Modal
				isVisible={isLoginModalVisible}
				onBackdropPress={toggleLoginModal}
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
							style={[styles.modalButton, styles.loginButton]}
							disabled={isLoading}
						>
							{isLoading ? 'Signing In...' : 'Sign In'}
						</Button>
						<Button
							onPress={toggleLoginModal}
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
	content: {
		flex: 1,
		paddingHorizontal: 20,
		paddingVertical: 20,
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
	},
	primaryButton: {
		backgroundColor: ReMapColors.primary.violet,
		width: '100%',
		marginBottom: 10,
	},
	secondaryButton: {
		backgroundColor: ReMapColors.primary.blue,
		width: '100%',
		marginBottom: 15,
	},
	navigationActions: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 10,
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

	// Add to your existing styles
	navIconButton: {
		backgroundColor: ReMapColors.ui.textSecondary,
		width: 40,
		height: 40,
		borderRadius: 20,
	},

	secondaryIconButton: {
		backgroundColor: ReMapColors.ui.textSecondary,
		flex: 0, // Don't grow like text buttons
	},

	// Optional: Icon + text combination
	backGroup: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		flex: 1,
	},

	navLabel: {
		color: ReMapColors.ui.text,
		fontSize: 14,
	},
});
