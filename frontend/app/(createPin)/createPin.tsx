// ========================
//   REACT NATIVE IMPORTS
// ========================
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
	View,
	StyleSheet,
	Image,
	TouchableOpacity,
	ScrollView,
} from 'react-native';

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
import {
	HeaderText,
	BodyText,
	LabelText,
	CaptionText,
} from '@/components/ui/Typography';

// ======================
//   CONSTANTS IMPORTS
// ======================
import { ReMapColors } from '@/constants/Colors';

// ====================
//   SERVICE IMPORTS
// ====================
import {
	createMemoryPin,
	type CreateMemoryRequest,
	type UploadProgress,
} from '@/services/memoryService';

// =================
//   CUSTOM HOOKS
// =================
import { useMemoryContent } from '@/hooks/createPin/useMemoryContent';
import { MediaItem, useMediaCapture } from '@/hooks/createPin/useMediaCapture';
import { usePrivacySettings } from '@/hooks/createPin/usePrivacySettings';

// =======================
//   FEATURE COMPONENTS
// =======================
import { LocationSelector } from '@/components/createPin/LocationSelector';
import { MediaCapture } from '@/components/createPin/MediaCapture';
import { VisibilitySelector } from '@/components/createPin/VisibilitySelector';
import { SocialCircleSelector } from '@/components/createPin/SocialCircleSelector';

//////////////////////////////////////////////
import { useCurrentLocation } from '@/hooks/createPin/useCurrentLocation';
import { useGeocodingMap } from '@/hooks/createPin/useGeocodingMap';
// ===========================================
//////////////////////////////////////////////

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

interface MemoryData {
	id: string;
	timestamp: string;
	// location: {
	// 	query: string;
	// };
	content: {
		title: string;
		description: string;
	};
	visibility: string[];
	socialCircles: string[];
	media: {
		photos: MediaItem[];
		videos: MediaItem[];
		audio: {
			uri: string;
			recorded: string;
		} | null;
	};
	metadata: {
		totalMediaItems: number;
		hasDescription: boolean;
		createdAt: string;
	};
}

// ========================
//   COMPONENT DEFINITION
// ========================

export default function CreatePinScreen() {
	// ====================
	//   STATE MANAGEMENT
	// ====================

	const [isSaving, setIsSaving] = useState(false);
	const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
		null
	);

	const [modalState, setModalState] = useState<ModalState>({
		show: false,
		type: 'info',
		title: '',
		message: '',
		actions: [],
	});

	const [previewData, setPreviewData] = useState<MemoryData | null>(null);

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
		if (currentType === 'preview') {
			setPreviewData(null);
		}
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
		coordinates,
		handleCoordinateChange,
		locationInputRef,
		titleInputRef,
		descriptionInputRef,
		validateContent,
		resetContent,
		hasValidContent,
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
		privacyData,
		handleVisibilitySelection,
		handleSocialCircleToggle,
		checkVisibilitySelection,
		getSelectedSocialCircles,
		generateVisibilityDescription,
		resetAllPrivacySettings,
		privacySummary,
	} = privacySettings;

	// ===================
	//   EVENT HANDLERS
	// ===================

	const goBack = () => {
		router.replace('/worldmap');
	};

	const navigateToWorldMap = () => {
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

	// =======================
	//  DATA TRANSFORMATION
	// =======================

	const createMemoryData = (): MemoryData => {
		return {
			id: Date.now().toString(),
			timestamp: new Date().toISOString(),
			content: {
				title: memoryTitle.trim(),
				description: memoryDescription.trim(),
			},
			visibility: selectedVisibility,
			socialCircles: selectedSocialCircles,
			media: {
				photos: selectedMedia.filter((item) => item.type === 'photo'),
				videos: selectedMedia.filter((item) => item.type === 'video'),
				audio: audioUri
					? {
							uri: audioUri,
							recorded: new Date().toISOString(),
					  }
					: null,
			},
			metadata: {
				totalMediaItems: selectedMedia.length + (audioUri ? 1 : 0),
				hasDescription: !!memoryDescription.trim(),
				createdAt: new Date().toISOString(),
			},
		};
	};

	const createBackendMemoryData = (): CreateMemoryRequest => {
		console.log('Creating backend data with coordinates:', coordinates);
		return {
			name: memoryTitle.trim(),
			description: memoryDescription.trim(),
			latitude: coordinates?.latitude || 0,
			longitude: coordinates?.longitude || 0,
			visibility: selectedVisibility,
			social_circle_ids: selectedSocialCircles,
			media: {
				photos: selectedMedia.filter((item) => item.type === 'photo'),
				videos: selectedMedia.filter((item) => item.type === 'video'),
				audio: audioUri ? { uri: audioUri } : null,
			},
		};
	};

	// ==================================
	//   MEMORY PREVIEW & SAVE HANDLERS
	// ==================================

	const handlePreviewMemory = () => {
		if (!validateContent()) {
			return; // Hook handles showing the error modal
		}

		const memoryData = createMemoryData();
		setPreviewData(memoryData);

		setModalState({
			show: true,
			type: 'preview',
			title: 'Preview Your Memory',
			message: '',
			actions: [
				{
					text: 'Edit',
					onPress: hideModal,
					style: 'secondary',
				},
				{
					text: 'Confirm & Post',
					onPress: handleConfirmSave,
					style: 'primary',
				},
			],
		});
	};

	const handleConfirmSave = async () => {
		const TESTING_MODE = true;

		setIsSaving(true);
		setUploadProgress({
			total: 0,
			completed: 0,
			currentFile: 'Preparing...',
			percentage: 0,
		});

		try {
			const memoryData = createMemoryData();
			const backendData = createBackendMemoryData();

			if (TESTING_MODE) {
				console.log('Testing mode: Simulating save...');

				const totalFiles = selectedMedia.length + (audioUri ? 1 : 0);
				setUploadProgress({
					total: totalFiles,
					completed: totalFiles,
					currentFile: 'Complete',
					percentage: 100,
				});

				await new Promise((resolve) => setTimeout(resolve, 1000));

				console.log('Frontend data:', memoryData);
				console.log('Backend payload:', backendData);
				console.log('✅ Test save completed');

				const result = {
					success: true,
					data: {
						id: `test-${Date.now()}`,
						name: backendData.name,
					},
				};

				handleSaveSuccess(memoryData, result);
			} else {
				const result = await createMemoryPin(
					backendData,
					setUploadProgress
				);

				if (result.success) {
					console.log('Memory saved:', result.data);
					handleSaveSuccess(memoryData, result);
				} else {
					handleSaveError('result.error');
				}
			}
		} catch (error) {
			console.error('Save error:', error);
			handleSaveError('Unexpected error occurred');
		} finally {
			setIsSaving(false);
			setUploadProgress(null);
		}
	};

	const handleSaveSuccess = (memoryData: MemoryData, result: any) => {
		hideModal();
		showModal(
			'success',
			'Memory Posted!',
			`"${memoryData.content.title}" posted to ${memoryData.location.query}`,
			[
				{
					text: 'View on Map',
					onPress: () => {
						hideModal();
						navigateToWorldMap();
					},
					style: 'primary',
				},
				{
					text: 'Create Another',
					onPress: resetForm,
					style: 'secondary',
				},
			]
		);
	};

	const handleSaveError = (error: string) => {
		showModal(
			'error',
			'Save Failed',
			error || 'Something went wrong. Please try again.',
			[{ text: 'Try Again', onPress: hideModal, style: 'primary' }]
		);
	};

	const resetForm = () => {
		hideModal();
		setMemoryTitle('');
		setMemoryDescription('');
		resetContent();
		resetMedia();
		resetPrivacySettings();
		setPreviewData(null);
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

	const renderPreviewModal = () => {
		if (!previewData) return null;

		return (
			<ScrollView style={styles.previewScrollView}>
				<View style={styles.previewContainer}>
					{/* Header */}
					<View style={styles.previewHeader}>
						<HeaderText align="center" style={styles.previewTitle}>
							{previewData?.content?.title || 'Untitled Memory'}
						</HeaderText>
						<CaptionText
							align="center"
							style={styles.previewLocation}
						>
							📍{' '}
							{previewData?.location?.query || 'Unknown Location'}
						</CaptionText>
						<CaptionText
							align="center"
							style={styles.previewTimestamp}
						>
							{previewData?.timestamp
								? new Date(
										previewData.timestamp
								  ).toLocaleString()
								: 'Now'}
						</CaptionText>
					</View>

					{/* Description */}
					{previewData?.content?.description && (
						<View style={styles.previewSection}>
							<LabelText>Description:</LabelText>
							<BodyText style={styles.previewDescription}>
								{previewData.content.description}
							</BodyText>
						</View>
					)}

					{/* Privacy Summary */}
					<View style={styles.previewSection}>
						<LabelText>Privacy Settings:</LabelText>
						<BodyText style={styles.previewPrivacy}>
							{getVisibilityDescription()}
						</BodyText>

						{selectedSocialCircles.length > 0 && (
							<View style={styles.socialCirclesPreview}>
								<LabelText style={styles.socialCirclesLabel}>
									Selected Social Circles:
								</LabelText>
								{getSelectedSocialCircles().map((circle) => (
									<View
										key={circle.id}
										style={[
											styles.socialCirclePreviewItem,
											{ borderLeftColor: circle.color },
										]}
									>
										<BodyText
											style={styles.socialCircleName}
										>
											{circle.name}
										</BodyText>
										<CaptionText
											style={styles.socialCircleMembers}
										>
											{circle.memberCount} members
										</CaptionText>
									</View>
								))}
							</View>
						)}
					</View>

					{/* Media Preview */}
					{previewData.metadata.totalMediaItems > 0 && (
						<View style={styles.previewSection}>
							<LabelText>Attached Media:</LabelText>
							<BodyText style={styles.mediaCount}>
								{getMediaSummary().photoCount} photo(s),{' '}
								{getMediaSummary().videoCount} video(s)
								{getMediaSummary().hasAudio &&
									', 1 audio recording'}
							</BodyText>

							{/* OPTIONAL: Add just one thumbnail row for photos if you want minimal preview */}
							{previewData.media.photos.length > 0 && (
								<View style={styles.simplePhotoPreview}>
									{previewData.media.photos
										.slice(0, 3)
										.map((photo, index) => (
											<TouchableOpacity
												key={index}
												style={
													styles.simplePhotoThumbnail
												}
												onPress={() =>
													showImagePreview(photo.uri)
												}
											>
												<Image
													source={{ uri: photo.uri }}
													style={
														styles.simpleThumbImage
													}
													resizeMode="cover"
												/>
											</TouchableOpacity>
										))}
									{previewData.media.photos.length > 3 && (
										<View
											style={styles.morePhotosIndicator}
										>
											<CaptionText
												style={styles.morePhotosText}
											>
												+
												{previewData.media.photos
													.length - 3}
											</CaptionText>
										</View>
									)}
								</View>
							)}
						</View>
					)}

					<CaptionText align="center" style={styles.previewFooter}>
						Review your memory above, then choose to edit or confirm
						posting.
					</CaptionText>
				</View>
			</ScrollView>
		);
	};

	const renderModal = () => {
		if (!modalState.show) return null;

		return (
			<Modal isVisible={modalState.show} onBackdropPress={hideModal}>
				<Modal.Container>
					<Modal.Header title={modalState.title} />
					<Modal.Body>
						{modalState.type === 'preview' && renderPreviewModal()}
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
					inputRef={locationInputRef}
					onCoordinateChange={handleCoordinateChange}
					required={true}
				/>
				{/* ======================== */}
				{/*   PRIVACY SETTINGS       */}
				{/* ======================== */}
				<VisibilitySelector
					selectedVisibility={privacyData.selectedVisibility}
					onSelect={handleVisibilitySelection}
					isSelected={checkVisibilitySelection}
					description={generateVisibilityDescription()}
				/>
				<SocialCircleSelector
					userSocialCircles={privacyData.userSocialCircles}
					selectedSocialCircles={privacyData.selectedSocialCircles}
					onToggle={handleSocialCircleToggle}
					visible={
						privacyData.showSocialDropdown &&
						checkVisibilitySelection('social')
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
							disabled={!hasValidContent}
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

	// Preview MODAL
	previewScrollView: {
		maxHeight: 400,
	},
	previewContainer: {
		padding: 16,
	},
	previewHeader: {
		marginBottom: 20,
		alignItems: 'center',
	},
	previewTitle: {
		marginBottom: 8,
	},
	previewLocation: {
		marginBottom: 4,
		color: ReMapColors.primary.blue,
	},
	previewTimestamp: {
		opacity: 0.7,
	},
	previewSection: {
		marginBottom: 16,
	},
	previewDescription: {
		marginTop: 4,
		padding: 8,
		backgroundColor: ReMapColors.ui.background,
		borderRadius: 6,
	},
	previewPrivacy: {
		marginTop: 4,
		padding: 8,
		backgroundColor: ReMapColors.ui.background,
		borderRadius: 6,
	},
	socialCirclesPreview: {
		marginTop: 12,
		padding: 12,
		backgroundColor: ReMapColors.ui.background,
		borderRadius: 8,
		borderLeftWidth: 3,
		borderLeftColor: ReMapColors.primary.blue,
	},
	socialCirclesLabel: {
		marginBottom: 8,
		color: ReMapColors.primary.blue,
	},
	socialCirclePreviewItem: {
		backgroundColor: ReMapColors.ui.cardBackground,
		padding: 8,
		borderRadius: 6,
		marginBottom: 6,
		borderLeftWidth: 3,
	},
	socialCircleName: {
		fontWeight: '500',
	},
	socialCircleMembers: {
		color: ReMapColors.ui.textSecondary,
		fontSize: 11,
	},
	mediaCount: {
		marginTop: 4,
		padding: 8,
		backgroundColor: ReMapColors.ui.background,
		borderRadius: 6,
	},
	previewFooter: {
		marginTop: 16,
		padding: 12,
		backgroundColor: ReMapColors.ui.background,
		borderRadius: 8,
		opacity: 0.8,
	},
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
	simplePhotoPreview: {
		flexDirection: 'row',
		marginTop: 8,
		gap: 4,
	},
	simplePhotoThumbnail: {
		width: 40,
		height: 40,
		borderRadius: 6,
		overflow: 'hidden',
	},
	simpleThumbImage: {
		width: '100%',
		height: '100%',
	},
	morePhotosIndicator: {
		width: 40,
		height: 40,
		borderRadius: 6,
		backgroundColor: ReMapColors.ui.cardBackground,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: ReMapColors.ui.border,
	},
	morePhotosText: {
		fontSize: 10,
		color: ReMapColors.ui.textSecondary,
	},
});
