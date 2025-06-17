// ========================
//   REACT NATIVE IMPORTS
// ========================
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';

// =======================
//   THIRD-PARTY IMPORTS
// =======================
import { router } from 'expo-router';

// =====================
//   LAYOUT COMPONENTS
// =====================
import { Header } from '@/components/layout/Header';
import { MainContent } from '@/components/layout/MainContent';
import { Footer } from '@/components/layout/Footer';

// =================
//   UI COMPONENTS
// =================
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/TextInput';
import {
	SuccessMessage,
	ErrorMessage,
	WarningMessage,
	InfoMessage,
} from '@/components/ui/Messages';

// ======================
//   TYPOGRAPHY IMPORTS
// ======================
import { LabelText } from '@/components/ui/Typography';

// ======================
//   CONSTANTS IMPORTS
// ======================
import { ReMapColors } from '@/constants/Colors';

// =================
//   CUSTOM HOOKS
// =================
import { useMemoryContent } from '@/hooks/createPin/useMemoryContent';
import { useMediaCapture } from '@/hooks/createPin/useMediaCapture';
import { usePrivacySettings } from '@/hooks/createPin/usePrivacySettings';
import { useCreatePin } from '@/hooks/createPin/useCreatePin';

// =======================
//   FEATURE COMPONENTS
// =======================
import { LocationSelector } from '@/components/createPin/LocationSelector';
import { MediaCapture } from '@/components/createPin/MediaCapture';
import { VisibilitySelector } from '@/components/createPin/VisibilitySelector';
import { SocialCircleSelector } from '@/components/createPin/SocialCircleSelector';
import { PreviewModal } from '@/components/createPin/PreviewModal';

// =========================
//   TYPE DEFINITIONS
// =========================
interface ModalState {
	show: boolean;
	type:
		| 'error'
		| 'permission'
		| 'photoChoice'
		| 'success'
		| 'info'
		| 'preview'
		| 'imagePreview';
	title: string;
	message: string;
	actions?: Array<{
		text: string;
		onPress: () => void;
		style?: 'primary' | 'secondary' | 'danger';
	}>;
}

// ========================
//   COMPONENT DEFINITION
// ========================

export default function CreatePinScreen() {
	// ====================
	//   STATE MANAGEMENT
	// ====================
	const [modalState, setModalState] = useState<ModalState>({
		show: false,
		type: 'info',
		title: '',
		message: '',
		actions: [],
	});
	const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);

	// ===================
	// 	HELPER FUNCTIONS
	// ===================

	const showModal = useCallback(
		(
			type: ModalState['type'],
			title: string,
			message: string,
			actions?: ModalState['actions']
		) => {
			setModalState({
				show: true,
				type,
				title,
				message,
				actions: actions || [
					{ text: 'OK', onPress: hideModal, style: 'primary' },
				],
			});
		},
		[]
	);

	const hideModal = useCallback(() => {
		const currentType = modalState.type;
		setModalState((prev) => ({ ...prev, show: false }));
		if (currentType === 'imagePreview') {
			setPreviewImageUri(null);
		}
	}, [modalState.type]);

	// ================
	//   CUSTOM HOOKS
	// ================

	const memoryContent = useMemoryContent({
		showModal,
	});

	const mediaCapture = useMediaCapture({
		showModal,
		mode: 'full',
		allowAudio: true,
		allowMultiple: true,
		customLabels: {
			photoAdded: 'Your photo has been added to this memory.',
			audioComplete: 'Your audio memory has been saved.',
		},
	});

	const privacySettings = usePrivacySettings();

	// ===============================================
	//   DESTRUCTURING [Clean Variable Extraction]
	// ===============================================

	const {
		memoryTitle,
		setMemoryTitle,
		memoryDescription,
		setMemoryDescription,
		locationQuery,
		setLocationQuery,
		coordinates,
		updateCoordinatesFromLocationSelector, // ← Change this line
		locationInputRef,
		titleInputRef,
		descriptionInputRef,
		validateMemoryContent, // ← Also changed this name
		resetMemoryContent, // ← And this one
		hasValidMemoryContent, // ← And this one
	} = memoryContent;

	const {
		selectedMedia,
		audioUri,
		isRecording,
		isPlayingAudio,
		handleCameraPress,
		handleAudioPress,
		removeMedia,
		removeAudio,
		playRecording,
		stopPlayback,
		resetMedia,
		getMediaSummary,
	} = mediaCapture;

	const {
		selectedVisibility,
		selectedSocialCircles,
		showSocialDropdown,
		userSocialCircles,
		handleVisibilitySelect,
		handleSocialCircleToggle,
		isVisibilitySelected,
		getSelectedSocialCircles,
		getVisibilityDescription,
		resetPrivacySettings,
	} = privacySettings;

	// =============================
	//   CREATE PIN ORCHESTRATION
	// =============================

	const createPinLogic = useCreatePin({
		memoryTitle,
		memoryDescription,
		locationQuery,
		coordinates,
		selectedVisibility,
		selectedSocialCircles,
		selectedMedia,
		audioUri,
		validateMemoryContent,
		resetMemoryContent,
		resetMedia,
		resetPrivacySettings,
		setMemoryTitle,
		setMemoryDescription,
		showModal,
		hideModal,
	});

	const {
		previewData,
		isSaving,
		uploadProgress,
		handlePreviewMemory,
		resetForm,
	} = createPinLogic;

	// ===================
	//   EVENT HANDLERS
	// ===================

	const goBack = () => {
		router.replace('/worldmap');
	};

	const showImagePreview = (imageUri: string) => {
		setPreviewImageUri(imageUri);
		setModalState({
			show: true,
			type: 'imagePreview',
			title: 'Image Preview',
			message: '',
			actions: [
				{ text: 'Close', onPress: hideModal, style: 'secondary' },
			],
		});
	};

	// ====================
	//   MODAL COMPONENTS
	// ====================

	const renderImagePreviewModal = () => {
		if (!previewImageUri) return null;

		return (
			<View style={styles.imagePreviewContainer}>
				<Image
					source={{ uri: previewImageUri }}
					style={styles.fullImagePreview}
					resizeMode="contain"
				/>
			</View>
		);
	};

	const renderModal = () => {
		if (!modalState.show) return null;

		return (
			<Modal isVisible={modalState.show} onBackdropPress={hideModal}>
				<Modal.Container>
					<Modal.Header title={modalState.title} />
					<Modal.Body>
						{modalState.type === 'preview' && previewData && (
							<PreviewModal
								previewData={previewData}
								onImagePreview={showImagePreview}
								getVisibilityDescription={
									getVisibilityDescription
								}
								getSelectedSocialCircles={
									getSelectedSocialCircles
								}
								getMediaSummary={getMediaSummary}
								selectedSocialCircles={selectedSocialCircles}
							/>
						)}
						{modalState.type === 'imagePreview' &&
							renderImagePreviewModal()}
						{modalState.type === 'success' && (
							<SuccessMessage
								title={modalState.title}
								onDismiss={hideModal}
							>
								{modalState.message}
							</SuccessMessage>
						)}
						{modalState.type === 'error' && (
							<ErrorMessage
								title={modalState.title}
								onDismiss={hideModal}
							>
								{modalState.message}
							</ErrorMessage>
						)}
						{modalState.type === 'permission' && (
							<WarningMessage
								title={modalState.title}
								onDismiss={hideModal}
							>
								{modalState.message}
							</WarningMessage>
						)}
						{modalState.type === 'info' && (
							<InfoMessage
								title={modalState.title}
								onDismiss={hideModal}
							>
								{modalState.message}
							</InfoMessage>
						)}
					</Modal.Body>

					{modalState.actions && modalState.actions.length > 0 && (
						<Modal.Footer>
							{modalState.actions.map((action, index) => (
								<Button
									key={index}
									onPress={action.onPress}
									style={[
										styles.modalButton,
										action.style === 'primary' &&
											styles.primaryModalButton,
										action.style === 'secondary' &&
											styles.secondaryModalButton,
										action.style === 'danger' &&
											styles.dangerModalButton,
									]}
									variant={
										action.style === 'primary'
											? 'primary'
											: action.style === 'danger'
											? 'danger'
											: 'secondary'
									}
								>
									{action.text}
								</Button>
							))}
						</Modal.Footer>
					)}
				</Modal.Container>
			</Modal>
		);
	};

	// ============================
	//   MAIN COMPONENT RENDER
	// ============================

	return (
		<View style={styles.container}>
			{/* ==================== */}
			{/*   HEADER SECTION     */}
			{/* ==================== */}
			<Header
				title="Create Memory Pin"
				subtitle="Capture this moment forever"
			/>

			{/* ==================== */}
			{/*   MAIN FORM CONTENT  */}
			{/* ==================== */}
			<MainContent keyboardShouldPersistTaps="handled">
				{/* ======================== */}
				{/*   LOCATION SELECTION     */}
				{/* ======================== */}
				<LocationSelector
					value={locationQuery}
					onChange={setLocationQuery}
					inputRef={locationInputRef}
					onCoordinateChange={updateCoordinatesFromLocationSelector}
					required={true}
				/>

				{/* ======================== */}
				{/*   PRIVACY SETTINGS       */}
				{/* ======================== */}
				<VisibilitySelector
					selectedVisibility={selectedVisibility}
					onSelect={handleVisibilitySelect}
					isSelected={isVisibilitySelected}
					description={getVisibilityDescription()}
				/>
				<SocialCircleSelector
					userSocialCircles={userSocialCircles}
					selectedSocialCircles={selectedSocialCircles}
					onToggle={handleSocialCircleToggle}
					visible={
						showSocialDropdown && isVisibilitySelected('social')
					}
				/>

				{/* ======================== */}
				{/*   MEMORY CONTENT         */}
				{/* ======================== */}
				<View style={styles.section}>
					<LabelText style={styles.sectionLabel}>
						What happened here?
					</LabelText>

					<Input
						ref={titleInputRef}
						label="Memory Title"
						placeholder="Give this memory a title..."
						value={memoryTitle}
						onChangeText={setMemoryTitle}
						style={styles.fullWidth}
						required={true}
					/>

					<Input
						ref={descriptionInputRef}
						label="Tell the story"
						placeholder="Describe what made this moment special..."
						value={memoryDescription}
						onChangeText={setMemoryDescription}
						style={styles.fullWidth}
						multiline={true}
						numberOfLines={4}
						textAlignVertical="top"
						required={true}
					/>
				</View>

				{/* ======================== */}
				{/*   MEDIA CAPTURE          */}
				{/* ======================== */}
				<MediaCapture
					onImagePreview={showImagePreview}
					onRemoveMedia={removeMedia}
					selectedMedia={selectedMedia}
					audioUri={audioUri}
					isRecording={isRecording}
					isPlayingAudio={isPlayingAudio}
					onRemoveAudio={removeAudio}
					onPlayAudio={playRecording}
					onStopAudio={stopPlayback}
					mediaSummary={getMediaSummary()}
					onAudioPress={handleAudioPress}
					onCameraPress={handleCameraPress}
				/>
			</MainContent>

			{/* ==================== */}
			{/*   FOOTER SECTION     */}
			{/* ==================== */}
			<Footer>
				<View style={styles.buttonContainer}>
					<View style={styles.navigationRow}>
						<Button
							onPress={goBack}
							style={styles.backButton}
							variant="secondary"
						>
							← Back
						</Button>

						<Button
							onPress={handlePreviewMemory}
							style={styles.previewButton}
							variant="primary"
							disabled={!validateMemoryContent}
						>
							Preview Memory
						</Button>
					</View>
				</View>
			</Footer>

			{/* ==================== */}
			{/*   MODAL SYSTEM       */}
			{/* ==================== */}
			{renderModal()}
		</View>
	);
}

// ===============
//   STYLE SHEET
// ===============
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: ReMapColors.ui.background,
	},
	section: {
		marginBottom: 24,
	},
	sectionLabel: {
		marginBottom: 12,
		fontSize: 16,
	},
	fullWidth: {
		width: '100%',
	},
	buttonContainer: {
		width: '100%',
		gap: 10,
	},
	navigationRow: {
		flexDirection: 'row',
		gap: 12,
	},
	backButton: {
		flex: 1,
		backgroundColor: ReMapColors.primary.cadet,
	},
	previewButton: {
		backgroundColor: ReMapColors.primary.violet,
		flex: 3,
	},

	// Modal Styles
	modalButton: {
		width: 150,
	},
	primaryModalButton: {
		backgroundColor: ReMapColors.primary.violet,
	},
	secondaryModalButton: {
		backgroundColor: ReMapColors.ui.textSecondary,
	},
	dangerModalButton: {
		backgroundColor: ReMapColors.semantic.error,
	},

	// Image Preview Modal
	imagePreviewContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: 300,
		maxHeight: 500,
	},
	fullImagePreview: {
		width: '100%',
		height: '100%',
		borderRadius: 8,
	},
});
