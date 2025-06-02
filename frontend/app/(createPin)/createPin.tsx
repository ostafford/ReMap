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
	Alert,
} from 'react-native';

// =======================
//   THIRD-PARTY IMPORTS
// =======================
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
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
	type:
		| 'error'
		| 'permission'
		| 'photoChoice'
		| 'success'
		| 'info'
		| 'preview';
	title: string;
	message: string;
	actions?: Array<{
		text: string;
		onPress: () => void;
		style?: 'primary' | 'secondary' | 'danger';
	}>;
}

interface MediaItem {
	uri: string;
	type: 'photo' | 'video';
	name: string;
}

interface MemoryData {
	id: string;
	timestamp: string;
	location: {
		query: string;
	};
	content: {
		title: string;
		description: string;
	};
	visibility: VisibilityOption[];
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
	const [sound, setSound] = useState<Audio.Sound | null>(null);
	const [isPlayingAudio, setIsPlayingAudio] = useState(false);

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

	// =================================
	//   STATE MANAGEMENT [ PREVIEW ]
	// =================================
	const [previewData, setPreviewData] = useState<MemoryData | null>(null);

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

	// ============================
	//   CLEANUP AUDIO ON UNMOUNT
	// ============================
	useEffect(() => {
		return () => {
			if (sound) {
				sound.unloadAsync();
			}
			if (recording) {
				recording.stopAndUnloadAsync();
			}
		};
	}, [sound, recording]);

	// =======================
	//   NAVIGATION HANDLERS
	// =======================
	const goBack = () => {
		router.back();
	};

	const navigateToWorldMap = () => {
		router.replace('/worldmap');
	};

	// ==================
	//   VISIBILITY HANDLERS
	// ==================
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

	// ========================
	//   INPUT FOCUS HANDLERS
	// ========================
	const handleInputFocus = (inputRef: any, inputId: string) => {
		setActiveInputId(inputId);
		// Immediate scroll without waiting for keyboard
		scrollToInput(inputRef, inputId);
	};

	const handleInputBlur = () => {
		setActiveInputId(null);
	};

	const scrollToInput = (inputRef: any, inputId: string) => {
		if (scrollViewRef.current) {
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
		}
	};

	// ==================================
	//   MODAL HELPER FUNCTIONS
	// ==================================
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
		const currentType = modalState.type;
		setModalState((prev) => ({ ...prev, show: false }));
		if (currentType === 'preview') {
			setPreviewData(null);
		}
	};

	// ==================================
	//   MEDIA HANDLING - CAMERA & PHOTOS
	// ==================================
	const handleCameraPress = async () => {
		try {
			const { status } =
				await ImagePicker.requestCameraPermissionsAsync();

			if (status !== 'granted') {
				Alert.alert(
					'Camera Permission Required',
					'Please enable camera access in your device settings to take photos.',
					[{ text: 'OK' }]
				);
				return;
			}

			Alert.alert(
				'Add Photo',
				'Choose how you want to add a photo to your memory',
				[
					{
						text: 'Take Photo',
						onPress: () => openCamera(),
					},
					{
						text: 'Choose from Library',
						onPress: () => openImageLibrary(),
					},
					{
						text: 'Cancel',
						style: 'cancel',
					},
				]
			);
		} catch (error) {
			console.error('Error accessing camera:', error);
			Alert.alert(
				'Camera Error',
				'Could not access camera. Please try again.',
				[{ text: 'OK' }]
			);
		}
	};

	const openCamera = async () => {
		try {
			await ImagePicker.requestCameraPermissionsAsync();
			let result = await ImagePicker.launchCameraAsync({
				allowsEditing: true,
				quality: 0.75,
			});

			if (!result.canceled && result.assets[0]) {
				const newMedia: MediaItem = {
					uri: result.assets[0].uri,
					type: 'photo', // Simplified - assume photo
					name: `Camera Photo ${selectedMedia.length + 1}`,
				};
				setSelectedMedia((prev) => [...prev, newMedia]);
				showModal(
					'success',
					'Photo Added!',
					'Your photo has been added to this memory.'
				);
			}
		} catch (error) {
			console.error('Error opening camera:', error);
			Alert.alert(
				'Camera Error',
				'Could not open camera. Please try again.'
			);
		}
	};

	const openImageLibrary = async () => {
		try {
			let result = await ImagePicker.launchImageLibraryAsync({
				allowsEditing: true,
				quality: 0.75,
			});

			if (!result.canceled && result.assets[0]) {
				const newMedia: MediaItem = {
					uri: result.assets[0].uri,
					type: 'photo', // Simplified - assume photo
					name: `Library Photo ${selectedMedia.length + 1}`,
				};
				setSelectedMedia((prev) => [...prev, newMedia]);
				showModal(
					'success',
					'Photo Added!',
					'Your photo has been added to this memory.'
				);
			}
		} catch (error) {
			console.error('Error opening image library:', error);
			Alert.alert(
				'Library Error',
				'Could not access photo library. Please try again.'
			);
		}
	};

	const removeMedia = (indexToRemove: number) => {
		setSelectedMedia((prev) =>
			prev.filter((_, index) => index !== indexToRemove)
		);
	};

	// ======================================
	//   AUDIO HANDLING - RECORD & PLAYBACK
	// ======================================
	const startRecording = async () => {
		try {
			const { status } = await Audio.requestPermissionsAsync();

			if (status !== 'granted') {
				Alert.alert(
					'Microphone Permission Required',
					'Please enable microphone access in your device settings to record audio.',
					[{ text: 'OK' }]
				);
				return;
			}

			await Audio.setAudioModeAsync({
				allowsRecordingIOS: true,
				playsInSilentModeIOS: true,
			});

			const { recording } = await Audio.Recording.createAsync(
				Audio.RecordingOptionsPresets.LOW_QUALITY
			);

			setRecording(recording);
			setIsRecording(true);
			console.log('Started recording...');
		} catch (error) {
			console.error('Error starting recording:', error);
			Alert.alert(
				'Recording Error',
				'Could not start recording. Please try again.',
				[{ text: 'OK' }]
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
			Alert.alert(
				'Recording Error',
				'Could not stop recording. Please try again.',
				[{ text: 'OK' }]
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

	const playRecording = async () => {
		if (!audioUri) {
			Alert.alert(
				'No Recording',
				'Please record audio first before trying to play it back.',
				[{ text: 'OK' }]
			);
			return;
		}

		try {
			// Stop any currently playing sound
			if (sound) {
				await sound.unloadAsync();
				setSound(null);
			}

			setIsPlayingAudio(true);

			const { sound: newSound } = await Audio.Sound.createAsync(
				{ uri: audioUri },
				{ shouldPlay: true }
			);

			setSound(newSound);

			// NOTE: Set up playback status listener
			newSound.setOnPlaybackStatusUpdate((status) => {
				if (status.isLoaded && status.didJustFinish) {
					setIsPlayingAudio(false);
					newSound.unloadAsync();
					setSound(null);
				}
			});

			console.log('Playing recording from:', audioUri);
		} catch (error) {
			console.error('Error playing recording:', error);
			setIsPlayingAudio(false);
			Alert.alert(
				'Playback Error',
				'Could not play the recording. Please try again.',
				[{ text: 'OK' }]
			);
		}
	};

	const stopPlayback = async () => {
		try {
			if (sound) {
				await sound.stopAsync();
				await sound.unloadAsync();
				setSound(null);
			}
			setIsPlayingAudio(false);
		} catch (error) {
			console.error('Error stopping playback:', error);
		}
	};

	const removeAudio = () => {
		// NOTE: Stop any playing audio first
		if (sound) {
			sound.unloadAsync();
			setSound(null);
		}
		setIsPlayingAudio(false);
		setAudioUri(null);
	};

	// ==================================
	//   MEMORY PREVIEW & SAVE HANDLERS
	// ==================================
	const createMemoryData = (): MemoryData => {
		return {
			id: Date.now().toString(),
			timestamp: new Date().toISOString(),
			location: {
				query: locationQuery.trim(),
			},
			content: {
				title: memoryTitle.trim(),
				description: memoryDescription.trim(),
			},
			visibility: selectedVisibility,
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

	const handlePreviewMemory = () => {
		// Validation
		if (!memoryTitle.trim()) {
			showModal(
				'error',
				'Missing Title',
				'Please add a title for your memory before previewing.'
			);
			return;
		}

		if (!locationQuery.trim()) {
			showModal(
				'error',
				'Missing Location',
				'Please add a location for your memory before previewing.'
			);
			return;
		}

		// Create preview data and show modal
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

	const handleConfirmSave = () => {
		console.log('DEBUG: previewData exists?', !!previewData);
		console.log('DEBUG: previewData title:', previewData?.content?.title);
		const currentMemoryData = createMemoryData();

		if (
			!currentMemoryData.content.title.trim() ||
			!currentMemoryData.location.query.trim()
		) {
			console.error('Missing required data for saving');
			return;
		}

		// Log the memory data (in production, this would be sent to your backend)
		console.log('Saving memory pin with data:');
		console.log(JSON.stringify(currentMemoryData, null, 2));

		// Hide preview modal and show success
		hideModal();

		showModal(
			'success',
			'Memory Posted!',
			`Your memory "${currentMemoryData.content.title}" has been successfully posted to ${currentMemoryData.location.query}.`,
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
					onPress: () => {
						hideModal();
						// Reset form
						setMemoryTitle('');
						setMemoryDescription('');
						setLocationQuery('');
						setSelectedMedia([]);
						setAudioUri(null);
						setSelectedVisibility(['public']);
						setPreviewData(null); // IMPORTANT: Clear preview data
					},
					style: 'secondary',
				},
			]
		);
	};

	// ====================
	//   MODAL COMPONENTS
	// ====================
	const renderPreviewModal = () => {
		if (!previewData) return null;

		return (
			<ScrollView style={styles.previewScrollView}>
				<View style={styles.previewContainer}>
					{/* Header */}
					<View style={styles.previewHeader}>
						<HeaderText align="center" style={styles.previewTitle}>
							{previewData.content.title}
						</HeaderText>
						<CaptionText
							align="center"
							style={styles.previewLocation}
						>
							📍 {previewData.location.query}
						</CaptionText>
						<CaptionText
							align="center"
							style={styles.previewTimestamp}
						>
							{new Date(previewData.timestamp).toLocaleString()}
						</CaptionText>
					</View>

					{/* Description */}
					{previewData.content.description && (
						<View style={styles.previewSection}>
							<LabelText>Description:</LabelText>
							<BodyText style={styles.previewDescription}>
								{previewData.content.description}
							</BodyText>
						</View>
					)}

					{/* Visibility */}
					<View style={styles.previewSection}>
						<LabelText>Visibility:</LabelText>
						<View style={styles.previewVisibility}>
							{previewData.visibility.map((option, index) => (
								<View
									key={option}
									style={styles.previewVisibilityItem}
								>
									<BodyText>
										{option.charAt(0).toUpperCase() +
											option.slice(1)}
									</BodyText>
								</View>
							))}
						</View>
					</View>

					{/* Media */}
					{previewData.metadata.totalMediaItems > 0 && (
						<View style={styles.previewSection}>
							<LabelText>Attached Media:</LabelText>

							{/* Photos */}
							{previewData.media.photos.map((photo, index) => (
								<View
									key={`photo-${index}`}
									style={styles.previewMediaItem}
								>
									<BodyText>📷 {photo.name}</BodyText>
								</View>
							))}

							{/* Videos */}
							{previewData.media.videos.map((video, index) => (
								<View
									key={`video-${index}`}
									style={styles.previewMediaItem}
								>
									<BodyText>🎥 {video.name}</BodyText>
								</View>
							))}

							{/* Audio */}
							{previewData.media.audio && (
								<View style={styles.previewMediaItem}>
									<View style={styles.previewAudioItem}>
										<BodyText
											style={styles.previewAudioText}
										>
											🎤 Audio recording
										</BodyText>
										<IconButton
											icon={
												isPlayingAudio ? 'stop' : 'play'
											}
											onPress={
												isPlayingAudio
													? stopPlayback
													: playRecording
											}
											backgroundColor={
												ReMapColors.primary.blue
											}
											size={16}
											style={styles.previewAudioButton}
										/>
									</View>
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
								required={true}
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
									<SubheaderText
										style={styles.mediaPreviewTitle}
									>
										Attached Media:
									</SubheaderText>

									{/* Photos/Videos */}
									{selectedMedia.map((media, index) => (
										<View
											key={index}
											style={styles.mediaItem}
										>
											<BodyText
												style={styles.mediaItemText}
											>
												{media.type === 'photo'
													? '📷'
													: '🎥'}{' '}
												{media.name}
											</BodyText>
											<Button
												onPress={() =>
													removeMedia(index)
												}
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
											<BodyText
												style={styles.mediaItemText}
											>
												Audio recording
											</BodyText>
											<View style={styles.audioControls}>
												<IconButton
													icon={
														isPlayingAudio
															? 'stop'
															: 'play'
													}
													onPress={
														isPlayingAudio
															? stopPlayback
															: playRecording
													}
													backgroundColor={
														ReMapColors.primary.blue
													}
													size={20}
													style={styles.audioButton}
												/>
												<Button
													onPress={removeAudio}
													style={styles.removeButton}
													size="small"
													variant="danger"
												>
													Remove
												</Button>
											</View>
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
								onPress={handlePreviewMemory}
								style={styles.previewButton}
								variant="primary"
								disabled={
									!memoryTitle.trim() || !locationQuery.trim()
								}
							>
								Preview Memory
							</Button>
						</View>
					</View>
				</Footer>

				{/* ATTN: Custom Modal System */}
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
	scrollContainer: {
		flex: 1,
	},
	scrollContent: {
		paddingBottom: 20,
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
		gap: 8,
		marginBottom: 12,
		flexWrap: 'wrap',
	},
	visibilityButton: {
		flex: 1,
		minHeight: 44,
		minWidth: 100,
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
	mediaButtons: {
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 16,
		paddingBottom: 10,
		marginBottom: 8,
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
	mediaPreviewTitle: {
		marginBottom: 8,
	},
	mediaItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: ReMapColors.ui.border,
	},
	mediaItemText: {
		flex: 1,
	},
	audioControls: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	audioButton: {
		width: 36,
		height: 36,
	},
	removeButton: {
		width: 80,
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
	previewButton: {
		flex: 3,
	},

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

	// Preview Modal Styles
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
	previewVisibility: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		marginTop: 4,
	},
	previewVisibilityItem: {
		backgroundColor: ReMapColors.ui.background,
		padding: 6,
		borderRadius: 6,
	},
	previewMediaItem: {
		padding: 8,
		backgroundColor: ReMapColors.ui.background,
		borderRadius: 6,
		marginBottom: 4,
	},
	previewAudioItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	previewAudioText: {
		flex: 1,
	},
	previewAudioButton: {
		width: 32,
		height: 32,
	},
	previewFooter: {
		marginTop: 16,
		padding: 12,
		backgroundColor: ReMapColors.ui.background,
		borderRadius: 8,
		opacity: 0.8,
	},
});
