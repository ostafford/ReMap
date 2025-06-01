// ================
//   CORE IMPORTS
// ================
import React, { useState, useRef, useEffect } from 'react';
import {
	View,
	StyleSheet,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Keyboard,
	Dimensions,
} from 'react-native';

// =======================
//   THIRD-PARTY IMPORTS
// =======================
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
// NOTE: ## RUN THIS command in the frontend directory `npm expo install expo-image-picker expo-av`
import { Audio } from 'expo-av';

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
import { IconButton } from '@/components/ui/IconButton';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/TextInput';
import {
	SuccessMessage,
	ErrorMessage,
	WarningMessage,
	InfoMessage,
} from '@/components/ui/Messages';

// ================================
//   INTERNAL 'TYPOGRAPHY' IMPORTS
// ================================
import {
	HeaderText,
	SubheaderText,
	BodyText,
	LabelText,
	CaptionText,
	ErrorText,
} from '@/components/ui/Typography';

// ================================
//   INTERNAL 'CONSTANTS' IMPORTS
// ================================
import { ReMapColors } from '@/constants/Colors';

// =========================
//   TYPE DEFINITIONS
// =========================
type VisibilityOption = 'public' | 'social' | 'private';

interface ModalState {
	show: boolean;
	type: 'error' | 'permission' | 'photoChoice' | 'success' | 'info';
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
	const [selectedVisibility, setSelectedVisibility] = useState<
		VisibilityOption[]
	>(['public']);
	const [locationQuery, setLocationQuery] = useState('');
	const [memoryTitle, setMemoryTitle] = useState('');
	const [memoryDescription, setMemoryDescription] = useState('');

	// =================================
	//   STATE MANAGEMENT [ SCROLLVIEW ]
	// =================================
	const scrollViewRef = useRef<ScrollView>(null);
	const [keyboardHeight, setKeyboardHeight] = useState(0);
	const [activeInputId, setActiveInputId] = useState<string | null>(null);

	// Input refs for precise scrolling
	const locationInputRef = useRef<any>(null);
	const titleInputRef = useRef<any>(null);
	const descriptionInputRef = useRef<any>(null);

	// ====================================
	//   STATE MANAGEMENT [ MEDIA ]
	// ====================================
	const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
	const [recording, setRecording] = useState<Audio.Recording | null>(null);
	const [isRecording, setIsRecording] = useState(false);
	const [audioUri, setAudioUri] = useState<string | null>(null);

	// ==============================
	//   STATE MANAGEMENT [ MODAL ]
	// ==============================
	const [modalState, setModalState] = useState<ModalState>({
		show: false,
		type: 'info',
		title: '',
		message: '',
		actions: [],
	});

	// ======================
	//   KEYBOARD LISTENERS
	// ======================
	useEffect(() => {
		const keyboardDidShowListener = Keyboard.addListener(
			'keyboardDidShow',
			(event) => {
				setKeyboardHeight(event.endCoordinates.height);
			}
		);

		const keyboardDidHideListener = Keyboard.addListener(
			'keyboardDidHide',
			() => {
				setKeyboardHeight(0);
			}
		);

		return () => {
			keyboardDidShowListener?.remove();
			keyboardDidHideListener?.remove();
		};
	}, []);

	// ==================
	//   EVENT HANDLERS
	// ==================
	const goBack = () => {
		router.back();
	};

	const navigateToWorldMap = () => {
		router.navigate('/worldmap');
	};

	const handleVisibilitySelect = (option: VisibilityOption) => {
		setSelectedVisibility((prev) => {
			if (prev.includes(option)) {
				if (prev.length > 1) {
					return prev.filter((item) => item !== option);
				}
				return prev;
			} else {
				return [...prev, option];
			}
		});
	};

	const handleSavePin = () => {
		console.log('Saving pin with data:', {
			location: locationQuery,
			title: memoryTitle,
			description: memoryDescription,
			visibility: selectedVisibility,
			media: selectedMedia,
			audio: audioUri,
		});

		navigateToWorldMap();
	};

	// ==================
	//   INPUT FOCUS HANDLERS
	// ==================
	const handleInputFocus = (inputRef: any, inputId: string) => {
		setActiveInputId(inputId);

		// Immediate scroll without waiting for keyboard
		scrollToInput(inputRef, inputId);
	};

	const handleInputBlur = () => {
		setActiveInputId(null);
	};

	// ==================
	//   SCROLL HELPERS
	// ==================
	const scrollToInput = (inputRef: any, inputId: string) => {
		if (scrollViewRef.current) {
			// NOTE: Wait for keyboard animation to complete
			setTimeout(() => {
				let scrollOffset = 0;

				switch (inputId) {
					case 'location':
						scrollOffset = -120;
						break;
					case 'title':
						scrollOffset = 150;
						break;
					case 'description':
						scrollOffset = 300;
						break;
					default:
						scrollOffset = 200;
				}

				if (keyboardHeight > 0) {
					scrollOffset += 100;
				}
				scrollViewRef.current?.scrollTo({
					y: scrollOffset,
					animated: true,
				});
			}, 0); // Longer delay to ensure keyboard is fully shown
		}
	};
	// ==================================
	//   EVENT HANDLERS [ MEDIA ]
	// ==================================
	const handleCameraPress = async () => {
		try {
			const { status } =
				await ImagePicker.requestCameraPermissionsAsync();

			if (status !== 'granted') {
				showModal(
					'permission',
					'Camera Permission Required',
					'Please enable camera access in your device settings to take photos.',
					[{ text: 'OK', onPress: hideModal, style: 'primary' }]
				);
				return;
			}

			showModal(
				'photoChoice',
				'Add Photo',
				'Choose how you want to add a photo to your memory',
				[
					{
						text: 'Take Photo',
						onPress: () => {
							hideModal();
							openCamera();
						},
						style: 'primary',
					},
					{
						text: 'Choose from Library',
						onPress: () => {
							hideModal();
							openImageLibrary();
						},
						style: 'secondary',
					},
					{
						text: 'Cancel',
						onPress: hideModal,
						style: 'secondary',
					},
				]
			);
		} catch (error) {
			console.error('Error accessing camera:', error);
			showModal(
				'error',
				'Camera Error',
				'Could not access camera. Please try again.'
			);
		}
	};

	const openCamera = async () => {
		try {
			const result = await ImagePicker.launchCameraAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.All,
				allowsEditing: true,
				aspect: [4, 3],
				quality: 0.8,
			});

			if (!result.canceled && result.assets[0]) {
				setSelectedMedia((prev) => [...prev, result.assets[0].uri]);
				showModal(
					'success',
					'Photo Added!',
					'Your photo has been added to this memory.'
				);
			}
		} catch (error) {
			console.error('Error opening camera:', error);
			showModal(
				'error',
				'Camera Error',
				'Could not open camera. Please try again.'
			);
		}
	};

	const openImageLibrary = async () => {
		try {
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.All,
				allowsEditing: true,
				aspect: [4, 3],
				quality: 0.8,
				allowsMultipleSelection: true,
			});

			if (!result.canceled && result.assets) {
				const newUris = result.assets.map((asset) => asset.uri);
				setSelectedMedia((prev) => [...prev, ...newUris]);
				showModal(
					'success',
					'Photos Added!',
					`${result.assets.length} photo(s) have been added to this memory.`
				);
			}
		} catch (error) {
			console.error('Error opening image library:', error);
			showModal(
				'error',
				'Library Error',
				'Could not access photo library. Please try again.'
			);
		}
	};

	const startRecording = async () => {
		try {
			const { status } = await Audio.requestPermissionsAsync();

			if (status !== 'granted') {
				showModal(
					'permission',
					'Microphone Permission Required',
					'Please enable microphone access in your device settings to record audio.'
				);
				return;
			}

			await Audio.setAudioModeAsync({
				allowsRecordingIOS: true,
				playsInSilentModeIOS: true,
			});

			const { recording } = await Audio.Recording.createAsync({
				android: {
					extension: '.m4a',
					outputFormat:
						Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
					audioEncoder:
						Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
					sampleRate: 44100,
					numberOfChannels: 2,
					bitRate: 128000,
				},
				ios: {
					extension: '.m4a',
					outputFormat:
						Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
					audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
					sampleRate: 44100,
					numberOfChannels: 2,
					bitRate: 128000,
					linearPCMBitDepth: 16,
					linearPCMIsBigEndian: false,
					linearPCMIsFloat: false,
				},
			});

			setRecording(recording);
			setIsRecording(true);
			console.log('Started recording...');
		} catch (error) {
			console.error('Error starting recording:', error);
			showModal(
				'error',
				'Recording Error',
				'Could not start recording. Please try again.'
			);
		}
	};

	const stopRecording = async () => {
		try {
			if (!recording) return;

			console.log('Stopping recording...');
			setIsRecording(false);
			await recording.stopAndUnloadAsync();

			const uri = recording.getURI();
			if (uri) {
				setAudioUri(uri);
				showModal(
					'success',
					'Recording Complete!',
					'Your audio memory has been saved.'
				);
				console.log('Recording saved to:', uri);
			}

			setRecording(null);
		} catch (error) {
			console.error('Error stopping recording:', error);
			showModal(
				'error',
				'Recording Error',
				'Could not stop recording. Please try again.'
			);
		}
	};

	const handleAudioPress = async () => {
		if (isRecording) {
			await stopRecording();
		} else {
			await startRecording();
		}
	};

	const removeMedia = (uriToRemove: string) => {
		setSelectedMedia((prev) => prev.filter((uri) => uri !== uriToRemove));
	};

	const removeAudio = () => {
		setAudioUri(null);
	};

	// ====================
	//   HELPER FUNCTIONS
	// ====================
	const isVisibilitySelected = (option: VisibilityOption) => {
		return selectedVisibility.includes(option);
	};

	const getVisibilityDescription = () => {
		if (selectedVisibility.length === 1) {
			switch (selectedVisibility[0]) {
				case 'public':
					return 'Visible to everyone in the ReMap community';
				case 'social':
					return 'Visible to your friends and followers';
				case 'private':
					return 'Only visible to you';
			}
		} else if (selectedVisibility.length === 2) {
			const options = selectedVisibility.sort();
			if (options.includes('public') && options.includes('social')) {
				return 'Visible to everyone and your social circle';
			} else if (
				options.includes('public') &&
				options.includes('private')
			) {
				return 'Visible to everyone, but you control the details';
			} else if (
				options.includes('social') &&
				options.includes('private')
			) {
				return 'Visible to your friends, with private elements';
			}
		} else if (selectedVisibility.length === 3) {
			return 'Multiple visibility layers - maximum flexibility';
		}
		return 'Select your visibility preferences';
	};

	const getVisibilityIcon = (option: VisibilityOption) => {
		switch (option) {
			case 'public':
				return '';
			case 'social':
				return '';
			case 'private':
				return '';
		}
	};

	// ====================================
	//   HELPER FUNCTIONS [ MODAL ]
	// ====================================
	const showModal = (
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
	};

	const hideModal = () => {
		setModalState((prev) => ({ ...prev, show: false }));
	};

	// ==================
	//   MODAL COMPONENT
	// ==================
	const renderModal = () => {
		if (!modalState.show) return null;

		return (
			<Modal isVisible={modalState.show} onBackdropPress={hideModal}>
				<Modal.Container>
					<Modal.Header title={modalState.title} />
					<Modal.Body>
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

						{(modalState.type === 'photoChoice' ||
							modalState.type === 'info') && (
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
	//   COMPONENT RENDER SECTION
	// ============================
	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
		>
			<View style={styles.container}>
				<Header
					title="Create Memory Pin"
					subtitle="Capture this moment forever"
				/>

				<ScrollView
					ref={scrollViewRef}
					style={styles.scrollContainer}
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
					keyboardDismissMode="interactive"
				>
					<View style={styles.content}>
						{/* Location Selection Section */}
						<View style={styles.section}>
							<LabelText style={styles.sectionLabel}>
								Where are you?
							</LabelText>
							<Input
								ref={locationInputRef}
								label="Search Location"
								placeholder="Search for a location..."
								value={locationQuery}
								onChangeText={setLocationQuery}
								onFocus={() =>
									handleInputFocus(
										locationInputRef,
										'location'
									)
								}
								onBlur={handleInputBlur}
								style={styles.fullWidth}
							/>
							<CaptionText style={styles.helperText}>
								We'll pin your memory to this exact location
							</CaptionText>
						</View>

						{/* Privacy Selection Section */}
						<View style={styles.section}>
							<LabelText style={styles.sectionLabel}>
								Who can see this memory?
							</LabelText>

							<View style={styles.visibilityContainer}>
								{(
									[
										'public',
										'social',
										'private',
									] as VisibilityOption[]
								).map((option) => (
									<Button
										key={option}
										onPress={() =>
											handleVisibilitySelect(option)
										}
										style={[
											styles.visibilityButton,
											isVisibilitySelected(option) &&
												styles.selectedVisibilityButton,
										]}
										variant={
											isVisibilitySelected(option)
												? 'primary'
												: 'secondary'
										}
									>
										{getVisibilityIcon(option)}{' '}
										{option.charAt(0).toUpperCase() +
											option.slice(1)}
										{isVisibilitySelected(option) && ' ✓'}
									</Button>
								))}
							</View>

							<CaptionText style={styles.visibilityDescription}>
								{getVisibilityDescription()}
							</CaptionText>
						</View>

						{/* Memory Content Section */}
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
								onFocus={() =>
									handleInputFocus(titleInputRef, 'title')
								}
								onBlur={handleInputBlur}
								style={styles.fullWidth}
							/>

							<Input
								ref={descriptionInputRef}
								label="Tell the story"
								placeholder="Describe what made this moment special..."
								value={memoryDescription}
								onChangeText={setMemoryDescription}
								onFocus={() =>
									handleInputFocus(
										descriptionInputRef,
										'description'
									)
								}
								onBlur={handleInputBlur}
								style={styles.fullWidth}
								multiline={true}
								numberOfLines={4}
								textAlignVertical="top"
							/>
						</View>

						{/* Media Capture Section */}
						<View style={styles.section}>
							<LabelText style={styles.sectionLabel}>
								Add media to your memory
							</LabelText>

							{/* Media Display */}
							{(selectedMedia.length > 0 || audioUri) && (
								<View style={styles.mediaPreview}>
									{/* Photos/Videos */}
									{selectedMedia.map((uri, index) => (
										<View
											key={index}
											style={styles.mediaItem}
										>
											<CaptionText numberOfLines={1}>
												📷 Photo {index + 1}
											</CaptionText>
											<Button
												onPress={() => removeMedia(uri)}
												style={styles.removeButton}
												size="small"
												variant="danger"
											>
												Remove
											</Button>
										</View>
									))}

									{/* Audio */}
									{audioUri && (
										<View style={styles.mediaItem}>
											<CaptionText>
												🎤 Audio recording
											</CaptionText>
											<Button
												onPress={removeAudio}
												style={styles.removeButton}
												size="small"
												variant="danger"
											>
												Remove
											</Button>
										</View>
									)}
								</View>
							)}

							<View style={styles.mediaButtons}>
								<IconButton
									style={styles.mediaAddButton}
									icon="camera"
									onPress={handleCameraPress}
									label="Camera"
									variant="filled"
									backgroundColor={ReMapColors.primary.blue}
								/>
								<IconButton
									style={styles.mediaAddButton}
									icon="microphone"
									onPress={handleAudioPress}
									label={isRecording ? 'Stop' : 'Record'}
									variant="filled"
									backgroundColor={
										isRecording
											? ReMapColors.semantic.error
											: ReMapColors.primary.violet
									}
								/>
							</View>

							<CaptionText style={styles.helperText}>
								{isRecording
									? '🔴 Recording... Tap microphone to stop'
									: 'Tap camera to add photos or microphone to record audio'}
							</CaptionText>
						</View>
					</View>
				</ScrollView>

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
								onPress={handleSavePin}
								style={styles.saveButton}
								variant="primary"
								disabled={
									!memoryTitle.trim() || !locationQuery.trim()
								}
							>
								Save Memory
							</Button>
						</View>
					</View>
				</Footer>

				{/* NOTE: Custom Modal System Above. NOT IN MODAL COMPONENT */}
				{renderModal()}
			</View>
		</KeyboardAvoidingView>
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
		paddingHorizontal: 20,
		paddingVertical: 20,
	},

	// Section Styling
	section: {
		marginBottom: 24,
	},
	sectionLabel: {
		marginBottom: 12,
		fontSize: 16,
	},
	scrollContent: {
		paddingBottom: 20,
	},
	scrollContainer: {},
	footer: {},

	// Modal Styling
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

	// Form Styling
	fullWidth: {
		width: '100%',
	},
	helperText: {
		marginTop: 8,
		paddingHorizontal: 4,
	},

	// Visibility Selection
	visibilityContainer: {
		flexDirection: 'row',
		gap: 5,
		marginBottom: 5,
	},
	visibilityButton: {
		flex: 1,
		minHeight: 44,
	},
	selectedVisibilityButton: {
		// Additional styling handled by variant prop
	},
	visibilityDescription: {
		marginTop: 8,
		padding: 12,
		backgroundColor: ReMapColors.ui.cardBackground,
		borderRadius: 8,
		borderLeftWidth: 3,
		borderLeftColor: ReMapColors.primary.violet,
	},

	// Media Section
	mediaRow: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		gap: 12,
		marginBottom: 8,
	},
	mediaInputContainer: {
		flex: 1,
	},
	mediaInput: {
		flex: 1,
	},
	mediaButtons: {
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 16,
		paddingBottom: 10,
		marginBottom: 8,
	},
	actionButton: {
		width: 'auto',
		padding: 15,
		height: 'auto',
	},
	mediaAddButton: {
		width: 'auto',
		height: 'auto',
		padding: 15,
	},
	mediaPreview: {
		backgroundColor: ReMapColors.ui.cardBackground,
		borderRadius: 8,
		padding: 12,
		marginBottom: 12,
		borderLeftWidth: 3,
		borderLeftColor: ReMapColors.primary.blue,
	},
	mediaItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: ReMapColors.ui.border,
	},
	removeButton: {
		width: 100,
	},

	// Footer Styling
	buttonContainer: {
		width: '100%',
	},
	navigationRow: {
		flexDirection: 'row',
		gap: 12,
		padding: 10,
	},
	backButton: {
		flex: 1,
	},
	saveButton: {
		flex: 4,
	},
});
