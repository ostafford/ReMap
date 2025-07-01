// ================
//   CORE IMPORTS
// ================
import React, {useRef, useEffect } from 'react';
import { View, StyleSheet, Image, Animated, Easing } from 'react-native';

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
	splashState = {
        messageShow: false,
        messageText: '',
        messageType: 'info',
        isSignInModalVisible: false,
    },
	isCheckingAuth,
	handlers,
}: SplashUIProps) => {
	//  Animated.View for explore button
	const floatAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Animated.loop(
			Animated.sequence([
				Animated.timing(floatAnim, {
					toValue: 1,
					duration: 2000,
					easing: Easing.inOut(Easing.sin),
					useNativeDriver: true,
				}),
				Animated.timing(floatAnim, {
					toValue: 0,
					duration: 2000,
					easing: Easing.inOut(Easing.sin),
					useNativeDriver: true,
				}),
			])
		).start();
	}, [floatAnim]);

	// Breaking down splashState for easier access
	const { messageShow, messageText, messageType, isSignInModalVisible } = splashState;
	// Loading state
	if (isCheckingAuth) {
		return (
			<View style={styles.container}>
				<Header
					title="ReMap"
					subtitle="Your Interactive Memory Atlas"
					style={styles}
				/>
				<MainContent scrollable={false} style={styles.mainContent}>	
						<BodyText align="center" style={styles.loadingText}>
							Checking your authentication status...
						</BodyText>
				</MainContent>
			</View>
		);
	}

	// 4. JSX RETURN: Main UI structure
	return (
		<View style={styles.container}>
			<Header 
				title="ReMap"
				style={styles.header}
				fontSize={60}
			/>

			{/* ==================== */}
			{/*     Main content     */}
			{/* ==================== */}
			<MainContent scrollable={false} style={styles.mainContent}>
				{/* ERROR MESSAGE PATTERN: Controlled component */}
				{messageShow &&
					messageType === 'error' && (
						<View style={styles.messageContainer}>
							<ErrorMessage onDismiss={handlers.onHideMessage}>
								{messageText}
							</ErrorMessage>
						</View>
					)}

				<View style={styles.exploreContent}>
					<Image
						source={require('@/assets/images/earth-splash.jpg')}
						style={styles.globeContainer}
						resizeMode="contain"
					/>
					<Animated.View
						style={[
							styles.animatedButtonWrapper,
							{
								transform: [
									{
										translateX: floatAnim.interpolate({
											inputRange: [0, 1],
											outputRange: [-4, 6],
										}),
									},
									{
										translateY: floatAnim.interpolate({
											inputRange: [0, 1],
											outputRange: [9, 10],
										}),
									},
								],
							},
						]}
					>
						<Button
							style={styles.exploreButton}
							onPress={handlers.onNavigateToWorldMap}
							textColour='black'
							size='small'
						>
							Explore
						</Button>
					</Animated.View>
				</View>
				

			</MainContent>

			{/* ==================== */}
			{/*   FOOTER content     */}
			{/* ==================== */}
			<Footer style={styles.footer}>
				<View style={styles.buttonContainer}>
					<Button
						style={styles.primaryButton}
						onPress={handlers.onNavigateToOnboarding}
						textColour='black'
					>
						New User
					</Button>
					<Button
						style={[styles.primaryButton, styles.loginButton]}
						onPress={handlers.onToggleSignInModal}
						textColour='white'
					>
						I already have an account
					</Button>

				</View>
			</Footer>

			{/* ==================== */}
			{/* AUTH MODAL (SIGN-IN) */}
			{/* ==================== */}
			<AuthModal
				isVisible={isSignInModalVisible}
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

	},
	header: {
		backgroundColor: 'black',
		
	},
	mainContent: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'black',
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
		marginTop: 20,
		height: 400,
		width: 400,
	},
	animatedButtonWrapper: {
		position: 'absolute',
		transform: [{ translateX: -1 }, { translateY: -2 }],
		zIndex: 2,
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
	exploreContent: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		width: '100%',
	},
	exploreButton: {
		backgroundColor: 'white',
		opacity: 0.6,
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 24,
		alignSelf: 'center',
	},

	// Button Styles
	buttonContainer: {
		width: '100%',
		gap: 20,
		justifyContent: 'center',
		alignItems: 'center',
		paddingBottom: 30,
	},
	primaryButton: {
		backgroundColor: ReMapColors.ui.cardBackground,
		width: '85%',
		borderRadius: 24,
		height: 64,
	},
	loginButton: {
		backgroundColor: '#262626',
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

	footer: {
		backgroundColor: 'black',
		borderTopColor: 'black',
	},
});
