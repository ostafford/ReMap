// ================
//   CORE IMPORTS
// ================
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Image } from 'react-native';

// ======================
//   LAYOUT COMPONENTS
// ======================
import { Header } from '@/components/layout/Header';
import { MainContent } from '@/components/layout/MainContent';
import { Footer } from '@/components/layout/Footer';

// ===================
//   UI COMPONENTS
// ===================
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/TextInput';
import {
	SuccessMessage,
	ErrorMessage,
	WarningMessage,
} from '@/components/ui/Messages';

// =========================
//   TYPOGRAPHY IMPORTS
// =========================
import {
	HeaderText,
	BodyText,
	SubheaderText,
	BodySmallText,
	LabelText,
	CaptionText,
} from '@/components/ui/Typography';

// =========================
//   CONSTANTS IMPORTS
// =========================
import { ReMapColors } from '@/constants/Colors';

// ================
//   HOOK IMPORTS
// ================
import { useMediaCapture } from '@/hooks/createPin/useMediaCapture';
import { useOnboardingForm } from '@/hooks/onboarding/useOnboardingForm';
import { useNavigation } from '@/hooks/shared/useNavigation';

// ========================
//   COMPONENT DEFINITION
// ========================
export default function OnboardingAccountScreen() {
	// 	== STATE MANAGEMENT ==
	const {
		formData,
		updateFormField,
		setProfilePicture,
		resetForm,
		showMessage,
		hideMessage,
		handleSignUp,
	} = useOnboardingForm();

	const showModal = (
		type: 'error' | 'success' | 'info',
		// title: string,
		message: string
	) => {
		showMessage(message, type);
	};

	//	== PROFILE PICTURE CAPTURE ==
	const profileCapture = useMediaCapture({
		showModal,
		mode: 'single-photo',
		allowAudio: false,
		allowMultiple: false,
		customLabels: {
			photoAdded: 'Perfect! Your profile picture looks great!',
		},
	});

	useEffect(() => {
		if (profileCapture.selectedMedia.length > 0) {
			const latestPhoto = profileCapture.selectedMedia[0];
			setProfilePicture(latestPhoto.uri);
		}
	}, [profileCapture.selectedMedia]);

	//	== NAVIGATION STATE ==
	const { goToPage } = useNavigation();

	const navigateToWorldMap = () => {
		setIsSignupModalVisible(false);

		goToPage('/worldmap');
	};

	const confirmSkip = () => {
		setIsSkipModalVisible(false);
		navigateToWorldMap();
	};

	const goBack = () => goToPage('/onboarding/starterpack');

	//	== MODAL STATE ==
	const [isSignupModalVisible, setIsSignupModalVisible] = useState(false);
	const [isSkipModalVisible, setIsSkipModalVisible] = useState(false);
	const isLoading = formData.isCreatingAccount;

	const toggleSignupModal = () => {
		setIsSignupModalVisible(!isSignupModalVisible);
		resetForm();
	};

	const toggleSkipAuth = () => {
		setIsSkipModalVisible(true);
	};

	const cancelSkip = () => {
		setIsSkipModalVisible(false);
	};

	// ============================
	//   COMPONENT RENDER SECTION
	// ============================
	return (
		<View style={styles.container}>
			<Header title="Create Your Account" />

			{/* ================ */}
			{/*   MAIN CONTENT   */}
			{/* ================ */}
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

			{/* ================ */}
			{/*   MAIN FOOTER    */}
			{/* ================ */}
			<Footer>
				<View style={styles.buttonContainer}>
					<View style={styles.secondaryActions}>
						<Button style={styles.secondaryButton} onPress={goBack}>
							← Previous
						</Button>

						<Button
							style={styles.secondaryButton}
							onPress={toggleSignupModal}
						>
							Create New Account
						</Button>
					</View>
					<Button
						style={styles.primaryButton}
						onPress={toggleSkipAuth}
					>
						Skip for Now
					</Button>
				</View>
			</Footer>

			{/* ===================== */}
			{/*   'SIGN UP' MODAL     */}
			{/* ===================== */}
			<Modal
				isVisible={isSignupModalVisible}
				onBackdropPress={toggleSignupModal}
			>
				<Modal.Container>
					<Modal.Header title="Join ReMap Community" />
					<Modal.Body>
						{/* ======================== */}
						{/*   NOTIFICATION MESSAGES  */}
						{/* ======================== */}
						{formData.messageShow &&
							formData.messageType === 'success' && (
								<SuccessMessage
									title="Welcome to ReMap!"
									onDismiss={hideMessage}
								>
									{formData.messageText}
								</SuccessMessage>
							)}
						{formData.messageShow &&
							formData.messageType === 'error' && (
								<ErrorMessage onDismiss={hideMessage}>
									{formData.messageText}
								</ErrorMessage>
							)}
						{formData.messageShow &&
							formData.messageType === 'warning' && (
								<WarningMessage onDismiss={hideMessage}>
									{formData.messageText}
								</WarningMessage>
							)}
						{/* ======================== */}
						{/*   ADD PROFILE PHOTO      */}
						{/* ======================== */}
						<View style={styles.profilePictureSection}>
							<LabelText style={styles.profileLabel}>
								Profile Picture (Optional)
							</LabelText>

							{formData.profilePictureUri ? (
								<View style={styles.profilePreview}>
									<Image
										source={{
											uri: formData.profilePictureUri,
										}}
										style={styles.profileImage}
									/>
									<Button
										onPress={() => setProfilePicture(null)}
										style={styles.removePhotoButton}
									>
										Remove Photo
									</Button>
								</View>
							) : (
								<Button
									onPress={profileCapture.handleCameraPress}
									style={styles.addPhotoButton}
								>
									📷 Add Profile Picture
								</Button>
							)}

							{profileCapture.selectedMedia.length > 0 && (
								<CaptionText style={styles.profileHint}>
									Tap "Add Profile Picture" again to change
									your photo
								</CaptionText>
							)}
						</View>
						{/* ==================== */}
						{/*   SIGN UP INPUTS     */}
						{/* ==================== */}
						<Input
							label="Full Name"
							value={formData.fullname}
							onChangeText={(text) =>
								updateFormField('fullname', text)
							}
							required={true}
							placeholder="Enter your full name"
							autoCapitalize="words"
						/>
						<Input
							label="Email"
							value={formData.email}
							onChangeText={(text) =>
								updateFormField('email', text)
							}
							required={true}
							placeholder="Enter your email"
							keyboardType="email-address"
							autoCapitalize="none"
						/>
						<Input
							label="Password"
							value={formData.password}
							onChangeText={(text) =>
								updateFormField('password', text)
							}
							required={true}
							placeholder="Password (min 6 characters)"
							secureTextEntry
							secureToggle={true}
						/>
						<Input
							label="Confirm Password"
							value={formData.confirmPassword}
							onChangeText={(text) =>
								updateFormField('confirmPassword', text)
							}
							required={true}
							placeholder="Confirm your password"
							secureTextEntry
							secureToggle={true}
						/>
					</Modal.Body>

					{/* ================== */}
					{/*   MODAL FOOTER     */}
					{/* ================== */}
					<Modal.Footer>
						<Button
							onPress={toggleSignupModal}
							style={[styles.modalButton, styles.cancelButton]}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button
							onPress={handleSignUp}
							style={[styles.modalButton, styles.signUpButton]}
							disabled={isLoading}
						>
							{isLoading ? 'Creating...' : 'Create'}
						</Button>
					</Modal.Footer>
				</Modal.Container>
			</Modal>

			{/* ========================== */}
			{/*   'SKIP FOR NOW' MODAL     */}
			{/* ========================== */}
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
							onPress={cancelSkip}
							style={[styles.modalButton, styles.cancelButton]}
						>
							Go Back
						</Button>
						<Button
							onPress={confirmSkip}
							style={[
								styles.modalButton,
								styles.skipConfirmButton,
							]}
						>
							Skip for Now
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
		backgroundColor: ReMapColors.primary.testing,
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

	profilePictureSection: {
		marginVertical: 16,
	},
	profileLabel: {
		marginBottom: 8,
	},
	profilePreview: {
		alignItems: 'center',
		marginVertical: 12,
	},
	profileImage: {
		width: 80,
		height: 80,
		borderRadius: 40,
		marginBottom: 8,
	},
	addPhotoButton: {
		backgroundColor: ReMapColors.primary.violet,
		marginVertical: 8,
	},
	removePhotoButton: {
		backgroundColor: ReMapColors.ui.textSecondary,
		paddingHorizontal: 16,
		paddingVertical: 6,
	},
	profileHint: {
		textAlign: 'center',
		fontStyle: 'italic',
		marginTop: 4,
	},
});
