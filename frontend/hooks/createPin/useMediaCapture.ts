// ================
//   CORE IMPORTS
// ================
import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';

// =======================
//   THIRD-PARTY IMPORTS
// =======================
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';

// ===================
// TYPE DEFINITIONS
// ===================

interface MediaItem {
	uri: string;
	type: 'photo' | 'video';
	name: string;
}

interface UseMediaCaptureReturn {
	selectedMedia: MediaItem[];
	audioUri: string | null;
	isRecording: boolean;
	isPlayingAudio: boolean;
	recording: Audio.Recording | null;
	sound: Audio.Sound | null;
	handleCameraPress: () => Promise<void>;
	removeMedia: (index: number) => void;
	handleAudioPress?: () => Promise<void>;
	playRecording?: () => Promise<void>;
	stopPlayback?: () => Promise<void>;
	removeAudio?: () => void;
	resetMedia: () => void;
	getMediaSummary: () => {
		totalItems: number;
		photoCount: number;
		videoCount: number;
		hasAudio: boolean;
	};
}

interface UseMediaCaptureProps {
	showModal: (
		type: 'error' | 'success' | 'info',
		title: string,
		message: string
	) => void;
	// New configuration options
	mode?: 'full' | 'photo-only' | 'single-photo';
	allowAudio?: boolean;
	allowMultiple?: boolean;
	customLabels?: {
		photoAdded?: string;
		audioComplete?: string;
	};
}

// =============================
// CUSTOM HOOK IMPLEMENTATION
// =============================

export function useMediaCapture({
	showModal,
	mode = 'full',
	allowAudio = true,
	allowMultiple = true,
	customLabels = {},
}: UseMediaCaptureProps): UseMediaCaptureReturn {
	// ==================
	// STATE MANAGEMENT
	// ==================
	const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);
	const [recording, setRecording] = useState<Audio.Recording | null>(null);
	const [isRecording, setIsRecording] = useState(false);
	const [audioUri, setAudioUri] = useState<string | null>(null);
	const [sound, setSound] = useState<Audio.Sound | null>(null);
	const [isPlayingAudio, setIsPlayingAudio] = useState(false);

	// =====================
	// CLEANUP ON UNMOUNT
	// =====================

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

	// ==========================
	// CAMERA & PHOTO HANDLERS
	// ==========================

	const handleCameraPress = useCallback(async () => {
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
	}, []);

	const openCamera = useCallback(async () => {
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
					name: `Captured Memory ${selectedMedia.length + 1}`,
				};
				if (mode === 'single-photo') {
					setSelectedMedia([newMedia]); // Replace existing photo
				} else {
					setSelectedMedia((prev) => [...prev, newMedia]); // Add to collection
				}
				showModal(
					'success',
					'Photo Added!',
					customLabels.photoAdded ||
						'Your photo has been successfully added.'
				);
			}
		} catch (error) {
			console.error('Error opening camera:', error);
			Alert.alert(
				'Camera Error',
				'Could not open camera. Please try again.'
			);
		}
	}, [selectedMedia.length, showModal]);

	const openImageLibrary = useCallback(async () => {
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
				if (mode === 'single-photo') {
					setSelectedMedia([newMedia]); // Replace existing photo
				} else {
					setSelectedMedia((prev) => [...prev, newMedia]); // Add to collection
				}
				showModal(
					'success',
					'Photo Added!',
					customLabels.photoAdded ||
						'Your photo has been successfully added.'
				);
			}
		} catch (error) {
			console.error('Error opening image library:', error);
			Alert.alert(
				'Library Error',
				'Could not access photo library. Please try again.'
			);
		}
	}, [selectedMedia.length, showModal]);

	const removeMedia = useCallback((indexToRemove: number) => {
		setSelectedMedia((prev) =>
			prev.filter((_, index) => index !== indexToRemove)
		);
	}, []);

	// ==========================
	// AUDIO RECORDING HANDLERS
	// ==========================

	const startRecording = useCallback(async () => {
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
	}, []);

	const stopRecording = useCallback(async () => {
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
					customLabels.audioComplete ||
						'Your audio has been saved successfully.'
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
	}, [recording, showModal]);

	const handleAudioPress = useCallback(async () => {
		if (isRecording) {
			await stopRecording();
		} else {
			await startRecording();
		}
	}, [isRecording, stopRecording, startRecording]);

	// =========================
	// AUDIO PLAYBACK HANDLERS
	// =========================

	const playRecording = useCallback(async () => {
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
	}, [audioUri, sound]);

	const stopPlayback = useCallback(async () => {
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
	}, [sound]);

	const removeAudio = useCallback(() => {
		if (sound) {
			sound.unloadAsync();
			setSound(null);
		}
		setIsPlayingAudio(false);
		setAudioUri(null);
	}, [sound]);

	// ===================
	// UTILITY FUNCTIONS
	// ===================

	const resetMedia = useCallback(() => {
		setSelectedMedia([]);
		removeAudio();
		if (recording) {
			recording.stopAndUnloadAsync();
			setRecording(null);
			setIsRecording(false);
		}
	}, [recording, removeAudio]);

	const getMediaSummary = useCallback(() => {
		const photoCount = selectedMedia.filter(
			(item) => item.type === 'photo'
		).length;
		const videoCount = selectedMedia.filter(
			(item) => item.type === 'video'
		).length;

		return {
			totalItems: selectedMedia.length + (audioUri ? 1 : 0),
			photoCount,
			videoCount,
			hasAudio: !!audioUri,
		};
	}, [selectedMedia, audioUri]);

	// ========================
	// RETURN HOOK INTERFACE
	// ========================
	return {
		// Current state
		selectedMedia,
		audioUri: allowAudio ? audioUri : null,
		isRecording: allowAudio ? isRecording : false,
		isPlayingAudio: allowAudio ? isPlayingAudio : false,
		recording: allowAudio ? recording : null,
		sound: allowAudio ? sound : null,

		// Camera/Photo handlers
		handleCameraPress,
		removeMedia,

		// Audio handlers (only if audio enabled)
		...(allowAudio && {
			handleAudioPress,
			playRecording,
			stopPlayback,
			removeAudio,
		}),

		// Utility functions
		resetMedia,
		getMediaSummary,
	};
}

// ===============================
// HELPER TYPES FOR EXTERNAL USE
// ===============================

export type MediaCaptureHook = ReturnType<typeof useMediaCapture>;

export type { MediaItem };

export default useMediaCapture;
