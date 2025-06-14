/* TEAM STANDARD - COMPONENT TEMPLATE */

// 1. IMPORTS: React Native components and internal components
import React from 'react';
import {
	View,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	Image,
} from 'react-native';

// Internal UI Components
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/Messages';

// Typography Components
import { HeaderText, BodyText, CaptionText } from '@/components/ui/Typography';

// Constants
import { ReMapColors } from '@/constants/Colors';

// Hooks
import { useMediaCapture } from '@/hooks/createPin/useMediaCapture';

// TYPE DEFINITIONS: Props interface for the component
interface AccountCreationStepProps {
	// State from enhanced onboarding hook
	onboardingState: {
		username: string;
		email: string;
		password: string;
		confirmPassword: string;
		profilePictureUri: string | null;
		termsAccepted: boolean;
		messageShow: boolean;
		messageText: string;
		messageType: 'success' | 'error' | 'warning' | 'info';
		isCreatingAccount: boolean;
		isUploadingProfilePicture: boolean;
	};

	// Event handlers
	handlers: {
		onUpdateField: <T extends keyof any>(field: T, value: any) => void;
		onSetProfilePicture: (uri: string | null) => void;
		onSetProfilePictureUploading: (isUploading: boolean) => void;
		onShowMessage: (
			message: string,
			type: 'success' | 'error' | 'warning' | 'info'
		) => void;
		onHideMessage: () => void;
	};
}

// 2. FUNCTIONAL COMPONENT: Returns JSX
export const AccountCreationStep = ({
	onboardingState,
	handlers,
}: AccountCreationStepProps) => {
	// 3. HOOK CONSUMPTION: Profile picture capture functionality
	const profileCapture = useMediaCapture({
		showModal: handlers.onShowMessage,
		mode: 'single-photo',
		allowAudio: false,
		allowMultiple: false,
		customLabels: {
			photoAdded: 'Perfect! Your profile picture looks great!',
		},
	});

	// Handle profile picture selection
	const handleProfilePictureUpdate = () => {
		if (profileCapture.selectedMedia.length > 0) {
			const profilePicUri = profileCapture.selectedMedia[0].uri;
			handlers.onSetProfilePicture(profilePicUri);
		}
	};

	// Monitor profile picture changes
	React.useEffect(() => {
		handleProfilePictureUpdate();
	}, [profileCapture.selectedMedia]);

	// Handle terms toggle
	const toggleTermsAcceptance = () => {
		handlers.onUpdateField('termsAccepted', !onboardingState.termsAccepted);
	};

	// 4. JSX RETURN: Account creation UI structure
	return (
		<View style={styles.container}>
			{/* HEADER SECTION */}
			<View style={styles.headerSection}>
				<HeaderText align="center" style={styles.stepTitle}>
					Create Your Account
				</HeaderText>
				<BodyText align="center" style={styles.stepDescription}>
					Join the ReMap community and start building your memory
					atlas
				</BodyText>
			</View>

			{/* MESSAGE DISPLAY */}
			{onboardingState.messageShow && (
				<View style={styles.messageContainer}>
					<ErrorMessage onDismiss={handlers.onHideMessage}>
						{onboardingState.messageText}
					</ErrorMessage>
				</View>
			)}

			{/* PROFILE PICTURE SECTION */}
			<View style={styles.profileSection}>
				<CaptionText align="center" style={styles.sectionLabel}>
					Profile Picture (Optional)
				</CaptionText>

				<TouchableOpacity
					style={styles.profilePictureContainer}
					onPress={profileCapture.handleCameraPress}
					disabled={onboardingState.isUploadingProfilePicture}
				>
					{onboardingState.profilePictureUri ? (
						<Image
							source={{ uri: onboardingState.profilePictureUri }}
							style={styles.profileImage}
						/>
					) : (
						<View style={styles.placeholderImage}>
							<BodyText style={styles.placeholderText}>
								📷
							</BodyText>
							<CaptionText style={styles.placeholderLabel}>
								Tap to add photo
							</CaptionText>
						</View>
					)}

					{onboardingState.isUploadingProfilePicture && (
						<View style={styles.uploadingOverlay}>
							<BodyText style={styles.uploadingText}>
								Uploading...
							</BodyText>
						</View>
					)}
				</TouchableOpacity>

				{onboardingState.profilePictureUri && (
					<TouchableOpacity
						style={styles.removePhotoButton}
						onPress={() => {
							handlers.onSetProfilePicture(null);
							profileCapture.resetMedia();
						}}
					>
						<CaptionText style={styles.removePhotoText}>
							Remove Photo
						</CaptionText>
					</TouchableOpacity>
				)}
			</View>

			{/* FORM FIELDS SECTION */}
			<View style={styles.formSection}>
				{/* USERNAME INPUT */}
				<View style={styles.inputGroup}>
					<CaptionText style={styles.inputLabel}>
						Username *
					</CaptionText>
					<TextInput
						style={styles.textInput}
						placeholder="Choose a unique username"
						value={onboardingState.username}
						onChangeText={(text) =>
							handlers.onUpdateField('username', text)
						}
						autoCapitalize="none"
						autoCorrect={false}
					/>
				</View>

				{/* EMAIL INPUT */}
				<View style={styles.inputGroup}>
					<CaptionText style={styles.inputLabel}>
						Email Address *
					</CaptionText>
					<TextInput
						style={styles.textInput}
						placeholder="your.email@example.com"
						value={onboardingState.email}
						onChangeText={(text) =>
							handlers.onUpdateField('email', text)
						}
						keyboardType="email-address"
						autoCapitalize="none"
						autoCorrect={false}
					/>
				</View>

				{/* PASSWORD INPUT */}
				<View style={styles.inputGroup}>
					<CaptionText style={styles.inputLabel}>
						Password *
					</CaptionText>
					<TextInput
						style={styles.textInput}
						placeholder="Create a secure password"
						value={onboardingState.password}
						onChangeText={(text) =>
							handlers.onUpdateField('password', text)
						}
						secureTextEntry
						autoCapitalize="none"
						autoCorrect={false}
					/>
				</View>

				{/* CONFIRM PASSWORD INPUT */}
				<View style={styles.inputGroup}>
					<CaptionText style={styles.inputLabel}>
						Confirm Password *
					</CaptionText>
					<TextInput
						style={styles.textInput}
						placeholder="Re-enter your password"
						value={onboardingState.confirmPassword}
						onChangeText={(text) =>
							handlers.onUpdateField('confirmPassword', text)
						}
						secureTextEntry
						autoCapitalize="none"
						autoCorrect={false}
					/>
				</View>
			</View>

			{/* TERMS ACCEPTANCE SECTION */}
			<View style={styles.termsSection}>
				<TouchableOpacity
					style={styles.termsContainer}
					onPress={toggleTermsAcceptance}
				>
					<View
						style={[
							styles.checkbox,
							onboardingState.termsAccepted &&
								styles.checkboxChecked,
						]}
					>
						{onboardingState.termsAccepted && (
							<BodyText style={styles.checkmark}>✓</BodyText>
						)}
					</View>
					<View style={styles.termsTextContainer}>
						<CaptionText style={styles.termsText}>
							I accept the{' '}
							<CaptionText style={styles.termsLink}>
								Terms of Service
							</CaptionText>{' '}
							and{' '}
							<CaptionText style={styles.termsLink}>
								Privacy Policy
							</CaptionText>
						</CaptionText>
					</View>
				</TouchableOpacity>
			</View>

			{/* ACCOUNT CREATION SUMMARY */}
			<View style={styles.summarySection}>
				<CaptionText style={styles.summaryText}>
					{onboardingState.profilePictureUri
						? '✓ Profile picture added'
						: '• Profile picture (optional)'}
				</CaptionText>
				<CaptionText style={styles.summaryText}>
					{onboardingState.username
						? '✓ Username set'
						: '• Username required'}
				</CaptionText>
				<CaptionText style={styles.summaryText}>
					{onboardingState.email
						? '✓ Email provided'
						: '• Email required'}
				</CaptionText>
				<CaptionText style={styles.summaryText}>
					{onboardingState.password
						? '✓ Password created'
						: '• Password required'}
				</CaptionText>
				<CaptionText style={styles.summaryText}>
					{onboardingState.termsAccepted
						? '✓ Terms accepted'
						: '• Terms acceptance required'}
				</CaptionText>
			</View>
		</View>
	);
};

// =================
//   STYLE SECTION
// =================
const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 20,
		paddingVertical: 10,
	},
	headerSection: {
		alignItems: 'center',
		marginBottom: 20,
	},
	stepTitle: {
		marginBottom: 8,
		color: ReMapColors.primary.violet,
	},
	stepDescription: {
		color: ReMapColors.ui.textSecondary,
		paddingHorizontal: 10,
	},
	messageContainer: {
		marginBottom: 16,
	},
	profileSection: {
		alignItems: 'center',
		marginBottom: 24,
	},
	sectionLabel: {
		marginBottom: 12,
		color: ReMapColors.ui.textSecondary,
		fontWeight: '600',
	},
	profilePictureContainer: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: ReMapColors.ui.cardBackground,
		borderWidth: 2,
		borderColor: ReMapColors.ui.border,
		borderStyle: 'dashed',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 8,
	},
	profileImage: {
		width: 96,
		height: 96,
		borderRadius: 48,
	},
	placeholderImage: {
		alignItems: 'center',
	},
	placeholderText: {
		fontSize: 32,
		marginBottom: 4,
	},
	placeholderLabel: {
		color: ReMapColors.ui.textSecondary,
		fontSize: 12,
	},
	uploadingOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0,0,0,0.7)',
		borderRadius: 50,
		justifyContent: 'center',
		alignItems: 'center',
	},
	uploadingText: {
		color: 'white',
		fontSize: 12,
	},
	removePhotoButton: {
		paddingVertical: 4,
		paddingHorizontal: 8,
	},
	removePhotoText: {
		color: ReMapColors.semantic.error,
		textDecorationLine: 'underline',
	},
	formSection: {
		marginBottom: 20,
	},
	inputGroup: {
		marginBottom: 16,
	},
	inputLabel: {
		marginBottom: 6,
		color: ReMapColors.ui.text,
		fontWeight: '600',
	},
	textInput: {
		borderWidth: 1,
		borderColor: ReMapColors.ui.border,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 12,
		fontSize: 16,
		backgroundColor: ReMapColors.ui.background,
		color: ReMapColors.ui.text,
	},
	termsSection: {
		marginBottom: 20,
	},
	termsContainer: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		paddingVertical: 8,
	},
	checkbox: {
		width: 20,
		height: 20,
		borderWidth: 2,
		borderColor: ReMapColors.ui.border,
		borderRadius: 4,
		marginRight: 12,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 2,
	},
	checkboxChecked: {
		backgroundColor: ReMapColors.primary.violet,
		borderColor: ReMapColors.primary.violet,
	},
	checkmark: {
		color: 'white',
		fontSize: 12,
		fontWeight: 'bold',
	},
	termsTextContainer: {
		flex: 1,
	},
	termsText: {
		color: ReMapColors.ui.text,
		lineHeight: 20,
	},
	termsLink: {
		color: ReMapColors.primary.violet,
		textDecorationLine: 'underline',
	},
	summarySection: {
		backgroundColor: ReMapColors.ui.cardBackground,
		padding: 16,
		borderRadius: 8,
		borderLeftWidth: 4,
		borderLeftColor: ReMapColors.primary.violet,
	},
	summaryText: {
		color: ReMapColors.ui.textSecondary,
		marginBottom: 4,
		fontSize: 12,
	},
});
