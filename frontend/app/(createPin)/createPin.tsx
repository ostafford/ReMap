// ========================
//   REACT NATIVE IMPORTS
// ========================
import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';

// =======================
//   THIRD-PARTY IMPORTS
// =======================
import { router, useLocalSearchParams } from 'expo-router';

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
import { Input } from '@/components/ui/TextInput';

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
import { CreatePinModals } from '@/components/createPin/CreatePinModals';

// ========================
//   COMPONENT DEFINITION
// ========================

export default function CreatePinScreen() {
	// ====================
	//   IMAGE PREVIEW STATE
	// ====================
	const [imagePreviewState, setImagePreviewState] = useState<{
		visible: boolean;
		imageUri: string | null;
	}>({
		visible: false,
		imageUri: null,
	});

	// ====================
	//   SIMPLE MODAL CALLBACKS
	// ====================

	// Simple fallback for media capture alerts
	const showMediaModal = useCallback(
		(type: string, title: string, message: string) => {
			// Keep this for media capture hook - it uses Alert.alert()
			const { Alert } = require('react-native');
			Alert.alert(title, message);
		},
		[]
	);

	// ================
	//   CUSTOM HOOKS
	// ================

	const memoryContent = useMemoryContent({
		showModal: showMediaModal,
	});

	const mediaCapture = useMediaCapture({
		showModal: showMediaModal,
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

	// Success callback for hook - will trigger success modal
	const handleSuccess = useCallback((title: string, message: string) => {
		console.log('🎯 [COMPONENT] Success callback triggered:', title);
	}, []);

	const handleImagePreview = useCallback((imageUri: string) => {
		console.log('🎯 [COMPONENT] Image preview requested:', imageUri);
		setImagePreviewState({
			visible: true,
			imageUri: imageUri,
		});
	}, []);

	// Image preview close callback
	const handleCloseImagePreview = useCallback(() => {
		console.log('🎯 [COMPONENT] Closing image preview');
		setImagePreviewState({
			visible: false,
			imageUri: null,
		});
	}, []);

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
		onSuccess: handleSuccess,
	});

	const {
		previewData,
		saveError,
		isSaving,
		handlePreviewMemory,
		handleConfirmSave,
		hidePreviewModal,
	} = createPinLogic;

	// ===================
	//   EVENT HANDLERS
	// ===================

	const goBack = () => {
		router.replace('/worldmap');
	};

	const handleNavigateToMap = useCallback(() => {
		router.replace('/worldmap');
	}, []);

	const handleResetForm = useCallback(() => {
		setMemoryTitle('');
		setMemoryDescription('');
		resetMemoryContent();
		resetMedia();
		resetAllPrivacySettings();
	}, [
		setMemoryTitle,
		setMemoryDescription,
		resetMemoryContent,
		resetMedia,
		resetAllPrivacySettings,
	]);

	// Get prefilled location from navigation params
	const { prefilledLocation } = useLocalSearchParams();

	// Effect to set prefilled location data
	useEffect(() => {
		if (prefilledLocation && typeof prefilledLocation === 'string') {
			try {
				const locationData = JSON.parse(prefilledLocation);
				setLocationQuery(locationData.address);
				updateCoordinatesFromLocationSelector({
					latitude: locationData.latitude,
					longitude: locationData.longitude,
					address: locationData.address,
				});
				console.log(
					'🎯 [CREATEPIN] Prefilled location set:',
					locationData
				);
			} catch (error) {
				console.error('Failed to parse prefilled location:', error);
			}
		}
	}, [
		prefilledLocation,
		setLocationQuery,
		updateCoordinatesFromLocationSelector,
	]);

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
					prefilledCoordinates={coordinates || undefined}
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
					onImagePreview={handleImagePreview}
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
			{/*   CONSOLIDATED MODALS */}
			{/* ==================== */}
			<CreatePinModals
				// Data from hooks
				previewData={previewData}
				isUploading={isSaving}
				saveError={saveError}
				// Callbacks to hook
				onConfirmSave={handleConfirmSave}
				onNavigateToMap={handleNavigateToMap}
				onResetForm={handleResetForm}
				onClosePreview={hidePreviewModal}
				onImagePreview={handleImagePreview}
				// Helper functions from other hooks
				getVisibilityDescription={getVisibilityDescription}
				getSelectedSocialCirclesData={getSelectedSocialCirclesData}
				getMediaSummary={getMediaSummary}
				selectedSocialCircles={selectedSocialCircles}
				// ADDED: Image preview state management
				imagePreviewState={imagePreviewState}
				onCloseImagePreview={handleCloseImagePreview}
			/>
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
});
