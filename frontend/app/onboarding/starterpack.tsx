import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';

// Import your layout components
import { Header } from '@/components/layout/Header';
import { MainContent } from '@/components/layout/MainContent';
import { Footer } from '@/components/layout/Footer';

// Import components
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/TextInput';

// Import colors
import { ReMapColors } from '@/constants/Colors';
import { IconButton } from '@/components/ui/IconButton';

// =========================
//   TYPE DEFINITIONS
// =========================

interface MessageState {
	show: boolean;
	message: string;
	type?: 'success' | 'error' | 'warning' | 'info';
	title?: string;
	duration?: number;
}

export default function OnboardingScreen() {
	const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
	const [isSignupModalVisible, setIsSignupModalVisible] = useState(false);
	const [messageState, setMessageState] = useState<MessageState>({
		show: false,
		message: '',
		type: 'info',
	});

	const toggleLoginModal = () => setIsLoginModalVisible(!isLoginModalVisible);
	const toggleSignupModal = () =>
		setIsSignupModalVisible(!isSignupModalVisible);

	const goBack = () => {
		router.back();
	};

	const showMessage = (
		message: string,
		type: MessageState['type'] = 'info',
		title?: string
	) => {
		setMessageState({ show: true, message, type, title });
	};

	const hideMessage = () => {
		setMessageState((prev) => ({ ...prev, show: false }));
	};

	// ATTN: Working on navigation
	const validRoutes = ['/onboarding', '/onboarding/account'];

	const continueToOnboarding = () => {
		const route = '/onboarding';

		if (!validRoutes.includes(route)) {
			showMessage(
				'Navigation error: Account setup page is not available.',
				'error'
			);
			return;
		}

		try {
			router.navigate(route);
		} catch (error) {
			console.error('Navigation failed:', error);
			showMessage(
				'Could not navigate to account setup. Please try again.',
				'error'
			);
		}
	};

	const continueToAccounts = () => {
		const route = '/onboarding/account';

		if (!validRoutes.includes(route)) {
			showMessage(
				'Navigation error: Account setup page is not available.',
				'error'
			);
			return;
		}

		try {
			router.navigate(route);
		} catch (error) {
			console.error('Navigation failed:', error);
			showMessage(
				'Could not navigate to account setup. Please try again.',
				'error'
			);
		}
	};

	return (
		<View style={styles.container}>
			<Header
				title="Welcome to ReMap"
				subtitle="Join the community of memory makers"
			/>

			<MainContent>
				<View style={styles.content}>
					<Text style={styles.description}>
						Create an account to start pinning your memories and
						discover authentic stories from others around the world.
					</Text>

					<Text style={styles.orText}>
						Choose how you'd like to get started:
					</Text>

					<View style={styles.iconContainer}>
						<View style={styles.row}>
							<IconButton
								icon="github"
								style={styles.icons}
							></IconButton>
							<IconButton
								icon="github"
								style={styles.icons}
							></IconButton>
						</View>

						<View style={styles.row}>
							<IconButton
								icon="github"
								style={styles.icons}
							></IconButton>
							<IconButton
								icon="github"
								style={styles.icons}
							></IconButton>
						</View>

						<View style={styles.row}>
							<IconButton
								icon="github"
								style={styles.icons}
							></IconButton>
							<IconButton
								icon="github"
								style={styles.icons}
							></IconButton>
						</View>
					</View>
				</View>
			</MainContent>

			<Footer>
				<View style={styles.buttonContainer}>
					<Button
						style={styles.primaryButton}
						onPress={continueToAccounts}
					>
						Create Account
					</Button>
					<View style={styles.row}>
						<Button style={styles.tertiaryButton} onPress={goBack}>
							← Back
						</Button>
						<Button
							style={styles.secondaryButton}
							onPress={continueToOnboarding}
						>
							Skip for now
						</Button>
					</View>
				</View>
			</Footer>

			{/* Login Modal
      <Modal isVisible={isLoginModalVisible} onBackdropPress={toggleLoginModal}>
        <Modal.Container>
          <Modal.Header title="Welcome Back!" />
          <Modal.Body>
            <Input
              label="Email"
              placeholder="Enter your email"
              keyboardType="email-address"
            />
            <Input
              label="Password"
              placeholder="Enter password"
              secureTextEntry
              secureToggle
            />
          </Modal.Body>
          <Modal.Footer>
            <Button style={styles.modalButton} onPress={navigateToWorldMap}>
              Sign In
            </Button>
            <Button style={[styles.modalButton, styles.cancelButton]} onPress={toggleLoginModal}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal.Container>
      </Modal> */}

			{/* Signup Modal
      <Modal isVisible={isSignupModalVisible} onBackdropPress={toggleSignupModal}>
        <Modal.Container>
          <Modal.Header title="Join ReMap Community" />
          <Modal.Body>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
            />
            <Input
              label="Email"
              placeholder="Enter your email"
              keyboardType="email-address"
            />
            <Input
              label="Password"
              placeholder="Create a password"
              secureTextEntry
              secureToggle
            />
          </Modal.Body>
          <Modal.Footer>
            <Button style={[styles.modalButton, styles.signUpButton]} onPress={navigateToWorldMap}>
              Create Account
            </Button>
            <Button style={[styles.modalButton, styles.cancelButton]} onPress={toggleSignupModal}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal.Container>
      </Modal> */}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: ReMapColors.ui.background,
	},
	content: {
		alignItems: 'center',
		paddingHorizontal: 20,
	},
	description: {
		fontSize: 16,
		color: ReMapColors.ui.text,
		textAlign: 'center',
		lineHeight: 24,
		marginBottom: 30,
	},
	footer: {},
	orText: {
		fontSize: 14,
		color: ReMapColors.ui.textSecondary,
		textAlign: 'center',
		marginBottom: 20,
	},
	buttonContainer: {
		width: '100%',
		// padding: 10,
		// alignItems: 'center',
		// gap: 10,
	},
	primaryButton: {
		backgroundColor: ReMapColors.primary.violet,
		width: '100%',
	},
	secondaryButton: {
		backgroundColor: ReMapColors.primary.blue,
		width: '50%',
	},
	tertiaryButton: {
		backgroundColor: ReMapColors.ui.textSecondary,
		width: '50%',
	},
	modalButton: {
		width: 150,
	},
	signUpButton: {
		backgroundColor: ReMapColors.primary.violet,
	},
	cancelButton: {
		backgroundColor: ReMapColors.ui.textSecondary,
	},

	iconContainer: {
		alignItems: 'center',
	},
	row: {
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 10,
		padding: 10,
	},
	icons: {
		width: 120,
		height: 120,
	},
});
