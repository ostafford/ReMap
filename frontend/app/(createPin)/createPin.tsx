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
	Image,
	TouchableOpacity,
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

import {
	createMemoryPin,
	getUserSocialCircles,
	type CreateMemoryRequest,
	type UploadProgress,
} from '@/services/memoryService';

// =========================
//   TYPE DEFINITIONS
// =========================
type VisibilityOption = 'public' | 'social' | 'private';

// NEW: Social Circle Types
interface SocialCircle {
	id: string;
	name: string;
	memberCount: number;
	description: string;
	color: string;
}

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
	socialCircles: string[]; // NOTE: Selected social circle IDs
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

// =========================
//   DUMMY SOCIAL CIRCLES
// =========================
const DUMMY_SOCIAL_CIRCLES: SocialCircle[] = [
	{
		id: 'family',
		name: 'Family Circle',
		memberCount: 8,
		description: 'Close family members',
		color: '#FF6B6B',
	},
	{
		id: 'work_friends',
		name: 'Work Friends',
		memberCount: 12,
		description: 'Colleagues and work buddies',
		color: '#4ECDC4',
	},
	{
		id: 'university',
		name: 'University Squad',
		memberCount: 15,
		description: 'University friends and classmates',
		color: '#45B7D1',
	},
	{
		id: 'hiking_group',
		name: 'Adventure Hikers',
		memberCount: 6,
		description: 'Weekend hiking enthusiasts',
		color: '#96CEB4',
	},
	{
		id: 'book_club',
		name: 'Book Club',
		memberCount: 9,
		description: 'Monthly book discussion group',
		color: '#FFEAA7',
	},
];

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

	// ATTN: Social Circle State
	const [selectedSocialCircles, setSelectedSocialCircles] = useState<
		string[]
	>([]);
	const [showSocialDropdown, setShowSocialDropdown] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
		null
	);
	const [userSocialCircles, setUserSocialCircles] = useState<any[]>([]);

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
	const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);
	const [recording, setRecording] = useState<Audio.Recording | null>(null);
	const [isRecording, setIsRecording] = useState(false);
	const [audioUri, setAudioUri] = useState<string | null>(null);
	const [sound, setSound] = useState<Audio.Sound | null>(null);
	const [isPlayingAudio, setIsPlayingAudio] = useState(false);

	// ATTN: Image Preview State
	const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);

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

	// ATTN: Load user's actual social circles
	useEffect(() => {
		const loadUserSocialCircles = async () => {
			const circles = await getUserSocialCircles();
			setUserSocialCircles(circles);
			console.log('👥 Loaded user social circles:', circles);
		};

		loadUserSocialCircles();
	}, []);

	// =======================
	//   NAVIGATION HANDLERS
	// =======================
	const goBack = () => {
		router.replace('/worldmap');
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
					const newVisibility = prev.filter(
						(item) => item !== option
					);
					// Hide social dropdown if social is deselected
					if (option === 'social') {
						setShowSocialDropdown(false);
						setSelectedSocialCircles([]);
					}
					return newVisibility;
				}
				return prev;
			} else {
				const newVisibility = [...prev, option];
				// Show social dropdown if social is selected
				if (option === 'social') {
					setShowSocialDropdown(true);
				}
				return newVisibility;
			}
		});
	};

	const isVisibilitySelected = (option: VisibilityOption) => {
		return selectedVisibility.includes(option);
	};

	// NOTE: Social Circle Handlers
	const handleSocialCircleToggle = (circleId: string) => {
		setSelectedSocialCircles((prev) => {
			if (prev.includes(circleId)) {
				return prev.filter((id) => id !== circleId);
			} else {
				return [...prev, circleId];
			}
		});
	};

	const getSelectedSocialCircles = () => {
		return userSocialCircles.filter((circle) =>
			selectedSocialCircles.includes(circle.id)
		);
	};

	const getVisibilityDescription = () => {
		let description = '';

		if (selectedVisibility.includes('public')) {
			description += 'Visible to everyone in the ReMap community';
		}

		if (selectedVisibility.includes('social')) {
			if (description) description += ' and ';
			if (selectedSocialCircles.length > 0) {
				description += `visible to ${selectedSocialCircles.length} selected social circle(s)`;
			} else {
				description +=
					'visible to your social circles (none selected yet)';
			}
		}

		if (selectedVisibility.includes('private')) {
			if (description) description += ' and ';
			description += 'kept private to you';
		}

		return description || 'Select your visibility preferences';
	};

	// ========================
	//   INPUT FOCUS HANDLERS
	// ========================
	const handleInputFocus = (inputRef: any, inputId: string) => {
		setActiveInputId(inputId);
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
		if (currentType === 'imagePreview') {
			setPreviewImageUri(null);
		}
	};

	// ATTN: Image Preview Handler
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
					type: 'photo',
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
					type: 'photo',
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
			socialCircles: selectedSocialCircles, // NEW: Include social circles
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
		return {
			name: memoryTitle.trim(),
			description: memoryDescription.trim(),
			latitude: 0, // TODO: Get from location service
			longitude: 0, // TODO: Get from location service
			location_query: locationQuery.trim(),
			visibility: selectedVisibility,
			social_circle_ids: selectedSocialCircles,
			media: {
				photos: selectedMedia.filter((item) => item.type === 'photo'),
				videos: selectedMedia.filter((item) => item.type === 'video'),
				audio: audioUri ? { uri: audioUri } : null,
			},
		};
	};

	const handlePreviewMemory = () => {
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
				// Simple testing simulation
				console.log('Testing mode: Simulating save...');

				// Quick progress simulation
				const totalFiles = selectedMedia.length + (audioUri ? 1 : 0);
				setUploadProgress({
					total: totalFiles,
					completed: totalFiles,
					currentFile: 'Complete',
					percentage: 100,
				});

				// Brief delay to show progress
				await new Promise((resolve) => setTimeout(resolve, 1000));

				// Log data structures for backend team
				console.log('Frontend data:', memoryData);
				console.log('Backend payload:', backendData);
				console.log('✅ Test save completed');

				// Success flow
				const result = {
					success: true,
					data: {
						id: `test-${Date.now()}`,
						name: backendData.name,
					},
				};

				handleSaveSuccess(memoryData, result);
			} else {
				// Production API call
				const result = await createMemoryPin(
					backendData,
					setUploadProgress
				);

				if (result.success) {
					console.log('Memory saved:', result.data);
					handleSaveSuccess(memoryData, result);
				} else {
					handleSaveError(result.error);
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

	// Helper functions to reduce duplication
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
		setLocationQuery('');
		setSelectedMedia([]);
		setAudioUri(null);
		setSelectedVisibility(['public']);
		setSelectedSocialCircles([]);
		setShowSocialDropdown(false);
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

						{/* NEW: Social Circles Preview */}
						{previewData.socialCircles.length > 0 && (
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

					{/* Media with Enhanced Previews */}
					{previewData.metadata.totalMediaItems > 0 && (
						<View style={styles.previewSection}>
							<LabelText>Attached Media:</LabelText>

							{/* Photos with Thumbnails */}
							{previewData.media.photos.map((photo, index) => (
								<TouchableOpacity
									key={`photo-${index}`}
									style={styles.previewMediaItem}
									onPress={() => showImagePreview(photo.uri)}
								>
									<Image
										source={{ uri: photo.uri }}
										style={styles.mediaThumbnail}
										resizeMode="cover"
									/>
									<View style={styles.mediaItemInfo}>
										<BodyText style={styles.mediaItemText}>
											📷 {photo.name}
										</BodyText>
										<CaptionText
											style={styles.tapToPreview}
										>
											Tap to view full size
										</CaptionText>
									</View>
								</TouchableOpacity>
							))}

							{/* Videos with Thumbnails */}
							{previewData.media.videos.map((video, index) => (
								<View
									key={`video-${index}`}
									style={styles.previewMediaItem}
								>
									<View
										style={styles.videoThumbnailContainer}
									>
										<Image
											source={{ uri: video.uri }}
											style={styles.mediaThumbnail}
											resizeMode="cover"
										/>
										<View style={styles.videoPlayOverlay}>
											<BodyText style={styles.playIcon}>
												▶️
											</BodyText>
										</View>
									</View>
									<View style={styles.mediaItemInfo}>
										<BodyText style={styles.mediaItemText}>
											🎥 {video.name}
										</BodyText>
										<CaptionText
											style={styles.tapToPreview}
										>
											Video preview
										</CaptionText>
									</View>
								</View>
							))}

							{/* Audio with Enhanced Display */}
							{previewData.media.audio && (
								<View style={styles.previewMediaItem}>
									<View
										style={styles.audioThumbnailContainer}
									>
										<View style={styles.audioWaveform}>
											<BodyText style={styles.audioIcon}>
												🎤
											</BodyText>
										</View>
									</View>
									<View style={styles.mediaItemInfo}>
										<BodyText style={styles.mediaItemText}>
											Audio recording
										</BodyText>
										<View
											style={styles.audioPreviewControls}
										>
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
												size={16}
												style={
													styles.previewAudioButton
												}
											/>
											<CaptionText
												style={styles.audioStatus}
											>
												{isPlayingAudio
													? 'Playing...'
													: 'Tap to play'}
											</CaptionText>
										</View>
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
						{modalState.type === 'progress' && uploadProgress && (
							<View style={styles.progressContainer}>
								<BodyText style={styles.progressTitle}>
									Saving Your Memory...
								</BodyText>
								<View style={styles.progressBar}>
									<View
										style={[
											styles.progressFill,
											{
												width: `${uploadProgress.percentage}%`,
											},
										]}
									/>
								</View>
								<CaptionText style={styles.progressText}>
									{uploadProgress.currentFile} (
									{uploadProgress.percentage}%)
								</CaptionText>
								<CaptionText style={styles.progressStep}>
									Step {uploadProgress.completed} of{' '}
									{uploadProgress.total}
								</CaptionText>
							</View>
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

							{/* NEW: Social Circle Dropdown */}
							{showSocialDropdown &&
								isVisibilitySelected('social') && (
									<View style={styles.inlineSocialDropdown}>
										<View
											style={styles.socialDropdownHeader}
										>
											<LabelText
												style={styles.inlineLabel}
											>
												Select Social Circles (
												{selectedSocialCircles.length}{' '}
												selected):
											</LabelText>
										</View>

										<View style={styles.socialCirclesGrid}>
											{userSocialCircles.map((circle) => (
												<TouchableOpacity
													key={circle.id}
													style={[
														styles.inlineSocialCircleItem,
														selectedSocialCircles.includes(
															circle.id
														) &&
															styles.selectedInlineSocialCircle,
														{
															borderColor:
																circle.color,
														},
													]}
													onPress={() =>
														handleSocialCircleToggle(
															circle.id
														)
													}
												>
													<BodyText
														style={[
															styles.inlineSocialCircleName,
															selectedSocialCircles.includes(
																circle.id
															) &&
																styles.selectedInlineText,
														]}
													>
														{circle.name}
														{selectedSocialCircles.includes(
															circle.id
														) && ' ✓'}
													</BodyText>
													<CaptionText
														style={
															styles.inlineMembers
														}
													>
														{circle.memberCount}{' '}
														members
													</CaptionText>
												</TouchableOpacity>
											))}
										</View>
									</View>
								)}
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
								required={true}
							/>
						</View>

						{/* Media Capture Section */}
						<View style={styles.section}>
							<LabelText style={styles.sectionLabel}>
								Add media to your memory
							</LabelText>

							{/* Enhanced Media Display with Thumbnails */}
							{(selectedMedia.length > 0 || audioUri) && (
								<View style={styles.mediaPreview}>
									<SubheaderText
										style={styles.mediaPreviewTitle}
									>
										Attached Media:
									</SubheaderText>

									{/* Photos/Videos with Thumbnails */}
									{selectedMedia.map((media, index) => (
										<View
											key={index}
											style={styles.mediaItem}
										>
											<TouchableOpacity
												onPress={() =>
													media.type === 'photo' &&
													showImagePreview(media.uri)
												}
												style={styles.mediaItemContent}
											>
												<Image
													source={{ uri: media.uri }}
													style={
														styles.mediaItemThumbnail
													}
													resizeMode="cover"
												/>
												<View
													style={
														styles.mediaItemDetails
													}
												>
													<BodyText
														style={
															styles.mediaItemText
														}
													>
														{media.type === 'photo'
															? '📷'
															: '🎥'}{' '}
														{media.name}
													</BodyText>
													{media.type === 'photo' && (
														<CaptionText
															style={
																styles.tapToPreview
															}
														>
															Tap to preview
														</CaptionText>
													)}
													{media.type === 'video' && (
														<CaptionText
															style={
																styles.tapToPreview
															}
														>
															Video file
														</CaptionText>
													)}
												</View>
											</TouchableOpacity>
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

									{/* Enhanced Audio Display */}
									{audioUri && (
										<View style={styles.mediaItem}>
											<View
												style={styles.audioItemContent}
											>
												<View
													style={
														styles.audioVisualizer
													}
												>
													<BodyText
														style={styles.audioIcon}
													>
														🎶
													</BodyText>
													<View
														style={
															styles.audioWaveform
														}
													>
														{/* Simple waveform visualization */}
														{[1, 2, 3, 4, 5].map(
															(bar) => (
																<View
																	key={bar}
																	style={[
																		styles.waveformBar,
																		isPlayingAudio &&
																			styles.waveformBarActive,
																	]}
																/>
															)
														)}
													</View>
												</View>
												<View
													style={
														styles.audioItemDetails
													}
												>
													<BodyText
														style={
															styles.mediaItemText
														}
													>
														Audio recording
													</BodyText>
													<View
														style={
															styles.audioControls
														}
													>
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
																ReMapColors
																	.primary
																	.blue
															}
															size={20}
															style={
																styles.audioButton
															}
														/>
														<CaptionText
															style={
																styles.audioStatus
															}
														>
															{isPlayingAudio
																? 'Playing...'
																: 'Ready to play'}
														</CaptionText>
													</View>
												</View>
											</View>
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

				{/* Enhanced Modal System */}
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

	// NEW: Social Circle Dropdown Styles

	socialCircleName: {
		flex: 1,
		fontWeight: '500',
	},

	socialCircleMembers: {
		color: ReMapColors.ui.textSecondary,
		fontSize: 11,
	},

	// Enhanced Media Section
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
		marginBottom: 12,
	},

	// Enhanced Media Item Styles
	mediaItem: {
		flexDirection: 'column',
		marginBottom: 12,
		backgroundColor: ReMapColors.ui.background,
		borderRadius: 8,
		padding: 8,
	},
	mediaItemContent: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	mediaItemThumbnail: {
		width: 60,
		height: 60,
		borderRadius: 8,
		marginRight: 12,
	},
	mediaItemDetails: {
		flex: 1,
	},
	mediaItemText: {
		marginBottom: 2,
	},
	tapToPreview: {
		color: ReMapColors.primary.blue,
		fontStyle: 'italic',
	},

	// Enhanced Audio Styles
	audioItemContent: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	audioVisualizer: {
		width: 60,
		height: 60,
		backgroundColor: ReMapColors.ui.cardBackground,
		borderRadius: 8,
		marginRight: 12,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: ReMapColors.ui.border,
	},
	audioIcon: {
		fontSize: 24,
		marginBottom: 4,
	},
	audioWaveform: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		gap: 2,
	},
	waveformBar: {
		width: 3,
		height: 8,
		backgroundColor: ReMapColors.ui.textSecondary,
		borderRadius: 1,
	},
	waveformBarActive: {
		backgroundColor: ReMapColors.primary.blue,
		height: 12,
	},
	audioItemDetails: {
		flex: 1,
	},
	audioControls: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginTop: 4,
	},
	audioButton: {
		width: 32,
		height: 32,
	},
	audioStatus: {
		color: ReMapColors.ui.textSecondary,
	},
	removeButton: {
		width: 80,
		alignSelf: 'flex-end',
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

	// Enhanced Preview Modal Styles
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

	// NEW: Social Circles Preview Styles
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

	// Enhanced Media Preview Styles
	previewMediaItem: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 8,
		backgroundColor: ReMapColors.ui.background,
		borderRadius: 6,
		marginBottom: 4,
	},
	mediaThumbnail: {
		width: 50,
		height: 50,
		borderRadius: 6,
		marginRight: 12,
	},
	mediaItemInfo: {
		flex: 1,
	},
	videoThumbnailContainer: {
		position: 'relative',
		width: 50,
		height: 50,
		marginRight: 12,
	},
	videoPlayOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0,0,0,0.3)',
		borderRadius: 6,
		alignItems: 'center',
		justifyContent: 'center',
	},
	playIcon: {
		color: 'white',
		fontSize: 18,
	},
	audioThumbnailContainer: {
		width: 50,
		height: 50,
		marginRight: 12,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: ReMapColors.ui.cardBackground,
		borderRadius: 6,
		borderWidth: 1,
		borderColor: ReMapColors.ui.border,
	},
	audioPreviewControls: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginTop: 4,
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

	// NEW: Image Preview Modal Styles
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
	// NEW: Inline Social Circle Styles
	inlineSocialDropdown: {
		marginTop: 12,
		marginBottom: 8,
	},
	socialDropdownHeader: {
		marginBottom: 8,
	},
	inlineLabel: {
		color: ReMapColors.primary.blue,
		fontSize: 13,
	},
	socialCirclesGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	inlineSocialCircleItem: {
		backgroundColor: ReMapColors.ui.cardBackground,
		borderRadius: 20,
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderWidth: 1,
		minWidth: 100,
		alignItems: 'center',
	},
	selectedInlineSocialCircle: {
		backgroundColor: '#F0F8FF',
		borderWidth: 2,
	},
	inlineSocialCircleName: {
		fontSize: 12,
		fontWeight: '500',
		textAlign: 'center',
	},
	selectedInlineText: {
		color: ReMapColors.primary.blue,
		fontWeight: '600',
	},
	inlineMembers: {
		fontSize: 10,
		textAlign: 'center',
		marginTop: 2,
	},

	// Progress Modal Styles
	progressContainer: {
		padding: 20,
		alignItems: 'center',
	},
	progressTitle: {
		marginBottom: 20,
		textAlign: 'center',
	},
	progressBar: {
		width: '100%',
		height: 8,
		backgroundColor: ReMapColors.ui.border,
		borderRadius: 4,
		marginBottom: 12,
		overflow: 'hidden',
	},
	progressFill: {
		height: '100%',
		backgroundColor: ReMapColors.primary.violet,
		borderRadius: 4,
	},
	progressText: {
		textAlign: 'center',
		marginBottom: 4,
	},
	progressStep: {
		textAlign: 'center',
		color: ReMapColors.ui.textSecondary,
	},
	loadingText: {
		textAlign: 'center',
		fontStyle: 'italic',
		color: ReMapColors.ui.textSecondary,
		padding: 16,
	},
});
