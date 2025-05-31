// ================
//   CORE IMPORTS
// ================
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';

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

// ================================
//   INTERNAL 'CONSTANTS' IMPORTS
// ================================
import { ReMapColors } from '@/constants/Colors';

// =============================
//   INTERNAL 'SERVICES' IMPORTS
// =============================
import { signIn, signUp } from '@/services/auth';

// ========================
//   COMPONENT DEFINITION
// ========================
export default function OnboardingAccountScreen() {
	// MODAL VISIBILITY
	const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
	const [isSignupModalVisible, setIsSignupModalVisible] = useState(false);

	// FORM INPUT STATE
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [fullName, setFullName] = useState('');
	const [emailError, setEmailError] = useState('');

	const validateEmail = (email: string) => {
		if (!email) return 'Email is required';
		if (!email.includes('@')) return 'Invalid email format';
		return '';
	};

	// LOADING STATE - PREVENTING DOUBLE SUBMISSIONS
	const [isLoading, setIsLoading] = useState(false);

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

	const resetForm = () => {
		setEmail('');
		setPassword('');
		setFullName('');
		setIsLoading(false);
	};

	// ===========================
	//   AUTHENTICATION HANDLERS
	// ===========================
	// API CALLS
	const handleSignUp = async () => {
		if (!email || !password || !fullName) {
			Alert.alert('Missing Information', 'Please fill in all fields.');
			return;
		}

		setIsLoading(true);

		try {
			await signUp({ email, password });

			Alert.alert(
				'Welcome to ReMap!',
				'Account created successfully. Welcome to your interactive memory atlas!',
				[{ text: 'Start Exploring', onPress: navigateToWorldMap }]
			);
		} catch (error) {
			console.error('Signup error:', error);
			Alert.alert(
				'Signup Error',
				'Could not create account. Please check your details and try again.',
				[{ text: 'Ok', style: 'default' }]
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSignIn = async () => {
		if (!email || !password) {
			Alert.alert(
				'Missing Information',
				'Please enter your email and password.'
			);
			return;
		}

		setIsLoading(true);

		try {
			await signIn({ email, password });

			Alert.alert(
				'Welcome Back!',
				'Successfully signed in to your ReMap account.',
				[{ text: 'Continue', onPress: navigateToWorldMap }]
			);
		} catch (error) {
			console.error('Login error:', error);
			Alert.alert(
				'Login Error',
				'Could not sign in. Please check your credentials and try again.',
				[{ text: 'Ok', style: 'default' }]
			);
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
		router.replace('/worldmap'); // Use replace to prevent going back to onboarding
	};

	const skipAuth = () => {
		Alert.alert(
			'Skip Account Setup?',
			"You can create an account later, but you'll miss out on saving and sharing your memories.",
			[
				{ text: 'Go Back', style: 'cancel' },
				{
					text: 'Skip for Now',
					onPress: () => router.replace('/worldmap'),
				},
			]
		);
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
					{/* Welcome Message */}
					<View style={styles.welcomeSection}>
						<Text style={styles.welcomeIcon}>🎉</Text>
						<Text style={styles.welcomeTitle}>
							You're Almost Ready!
						</Text>
						<Text style={styles.welcomeDescription}>
							Create your ReMap account to start building your
							interactive memory atlas and connect with the
							community.
						</Text>
					</View>

					{/* Benefits of Creating Account */}
					<View style={styles.benefitsContainer}>
						<Text style={styles.benefitsTitle}>
							With a ReMap account:
						</Text>

						<View style={styles.benefitsList}>
							<View style={styles.benefitItem}>
								<Text style={styles.benefitIcon}>💾</Text>
								<Text style={styles.benefitText}>
									Save and sync your memories across devices
								</Text>
							</View>

							<View style={styles.benefitItem}>
								<Text style={styles.benefitIcon}>🤝</Text>
								<Text style={styles.benefitText}>
									Share special moments with friends and
									family
								</Text>
							</View>

							<View style={styles.benefitItem}>
								<Text style={styles.benefitIcon}>🌍</Text>
								<Text style={styles.benefitText}>
									Discover and contribute to the global memory
									map
								</Text>
							</View>

							<View style={styles.benefitItem}>
								<Text style={styles.benefitIcon}>🔒</Text>
								<Text style={styles.benefitText}>
									Full control over your privacy and sharing
									settings
								</Text>
							</View>
						</View>
					</View>

					{/* Account Options */}
					<View style={styles.accountOptions}>
						<Text style={styles.optionsTitle}>
							How would you like to proceed?
						</Text>
					</View>
				</View>
			</MainContent>

			<Footer>
				<View style={styles.buttonContainer}>
					{/* Primary Actions */}
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

					{/* Navigation Actions */}
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

			{/* Signup Modal - Using Anna's Modal Component */}
			<Modal
				isVisible={isSignupModalVisible}
				onBackdropPress={toggleSignupModal}
			>
				<Modal.Container>
					<Modal.Header title="Join ReMap Community" />
					<Modal.Body>
						<Input
							value={fullName}
							onChangeText={setFullName}
							label="Full Name"
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
							value={password}
							onChangeText={setPassword}
							label="Password"
							placeholder="Create a secure password"
							secureTextEntry
							secureToggle={true}
							required={true}
						/>
					</Modal.Body>
					<Modal.Footer>
						<Button
							onPress={handleSignUp}
							style={[styles.modalButton, styles.signUpButton]}
							// disabled={isLoading}
						>
							{isLoading ? 'Creating...' : 'Create Account'}
						</Button>
						<Button
							onPress={toggleSignupModal}
							style={[styles.modalButton, styles.cancelButton]}
							// disabled={isLoading}
						>
							Cancel
						</Button>
					</Modal.Footer>
				</Modal.Container>
			</Modal>

			{/* Login Modal - Using Anna's Modal Component */}
			<Modal
				isVisible={isLoginModalVisible}
				onBackdropPress={toggleLoginModal}
			>
				<Modal.Container>
					<Modal.Header title="Welcome Back!" />
					<Modal.Body>
						<Input
							value={email}
							onChangeText={setEmail}
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
							// disabled={isLoading}
						>
							{isLoading ? 'Signing In...' : 'Sign In'}
						</Button>
						<Button
							onPress={toggleLoginModal}
							style={[styles.modalButton, styles.cancelButton]}
							// disabled={isLoading}
						>
							Cancel
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
		marginBottom: 30,
	},
	welcomeIcon: {
		fontSize: 60,
		marginBottom: 16,
	},
	welcomeTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		color: ReMapColors.ui.text,
		textAlign: 'center',
		marginBottom: 12,
	},
	welcomeDescription: {
		fontSize: 16,
		color: ReMapColors.ui.textSecondary,
		textAlign: 'center',
		lineHeight: 24,
		paddingHorizontal: 10,
	},
	benefitsContainer: {
		marginBottom: 30,
	},
	benefitsTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: ReMapColors.ui.text,
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
		fontSize: 14,
		color: ReMapColors.ui.text,
		flex: 1,
		lineHeight: 20,
	},
	accountOptions: {
		alignItems: 'center',
		marginBottom: 20,
	},
	optionsTitle: {
		fontSize: 16,
		fontWeight: '500',
		color: ReMapColors.ui.text,
		textAlign: 'center',
	},
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
});
