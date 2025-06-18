// ========================
//   REACT NATIVE IMPORTS
// ========================
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';

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
import { NotificationModal } from '@/components/createPin/NotificationModal';
import { ImageModal } from '@/components/createPin/ImageModal';

// TESTING
// import { PrivacySettingsTest } from '@/components/createPin/PrivacySettingsTest';

// ========================
//   COMPONENT DEFINITION
// ========================

export default function CreatePinScreen() {
	// ====================
	//   STATE MANAGEMENT
	// ====================
	// Image Preview Modal
	const [imageModalState, setImageModalState] = useState<{
		visible: boolean;
		imageUri: string | null;
	}>({
		visible: false,
		imageUri: null,
	});

	// ====================
	//   MODAL COMPONENTS
	// ====================

	// Simple fallback modal functions
	const showModal = useCallback(
		(type: string, title: string, message: string, actions?: any[]) => {
			Alert.alert(title, message);
		},
		[]
	);

	const hideModal = useCallback(() => {}, []);

	const showImagePreview = useCallback((imageUri: string) => {
		setImageModalState({
			visible: true,
			imageUri: imageUri,
		});
	}, []);

	const hideImagePreview = useCallback(() => {
		setImageModalState({
			visible: false,
			imageUri: null,
		});
	}, []);

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
		updateCoordinatesFromLocationSelector,
		locationInputRef,
		titleInputRef,
		descriptionInputRef,
		validateMemoryContent,
		resetMemoryContent,
		hasValidMemoryContent,
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
		toggleVisibilityOption,
		toggleSocialCircleSelection,
		isVisibilitySelected,
		getSelectedSocialCirclesData,
		getVisibilityDescription,
		resetAllPrivacySettings,
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
		resetAllPrivacySettings,
		validateMemoryContent,
		resetMemoryContent,
		resetMedia,
		setMemoryTitle,
		setMemoryDescription,
		showModal,
		hideModal,
	});

	const {
		previewData,
		// isSaving,
		// uploadProgress,
		handlePreviewMemory,
		handleConfirmSave,
		// resetForm,
	} = createPinLogic;

	// ===================
	//   EVENT HANDLERS
	// ===================

	const goBack = () => {
		router.replace('/worldmap');
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
					onSelect={toggleVisibilityOption}
					isSelected={isVisibilitySelected}
					description={getVisibilityDescription()}
				/>
				<SocialCircleSelector
					userSocialCircles={userSocialCircles}
					selectedSocialCircles={selectedSocialCircles}
					onToggle={toggleSocialCircleSelection}
					visible={
						showSocialDropdown && isVisibilitySelected('social')
					}
				/>
				{/* <PrivacySettingsTest /> */}

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
							onPress={() => {
								if (validateMemoryContent()) {
									handlePreviewMemory();
								}
							}}
							style={styles.previewButton}
							variant="primary"
							disabled={!hasValidMemoryContent}
						>
							Preview Memory
						</Button>
					</View>
				</View>
			</Footer>
			{/* ==================== */}
			{/*   MODAL SYSTEM       */}
			{/* ==================== */}
			<ImageModal
				visible={imageModalState.visible}
				imageUri={imageModalState.imageUri}
				onClose={hideImagePreview}
				title="Memory Photo"
			/>
			{/*preview modal*/}
			{previewData && (
				<Modal
					isVisible={!!previewData}
					onBackdropPress={() => hideModal()}
				>
					<Modal.Container>
						<Modal.Header title="Preview Your Memory" />
						<Modal.Body>
							<PreviewModal
								previewData={previewData}
								onImagePreview={showImagePreview}
								getVisibilityDescription={
									getVisibilityDescription
								}
								getSelectedSocialCirclesData={
									getSelectedSocialCirclesData
								}
								getMediaSummary={getMediaSummary}
								selectedSocialCircles={selectedSocialCircles}
							/>
						</Modal.Body>
						<Modal.Footer>
							<Button
								onPress={() => hideModal()}
								variant="secondary"
							>
								Edit
							</Button>
							<Button
								onPress={() => {
									hideModal();
									handleConfirmSave();
								}}
								variant="primary"
							>
								Confirm & Post
							</Button>
						</Modal.Footer>
					</Modal.Container>
				</Modal>
			)}
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
