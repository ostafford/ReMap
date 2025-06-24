// ================
//   CORE IMPORTS
// ================
import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';

// =======================
//   THIRD-PARTY IMPORTS
// =======================
import * as ImagePicker from 'expo-image-picker';

import {
	useAudioRecorder,
	useAudioPlayer,
	AudioModule,
	RecordingPresets,
	AudioPlayer,
	AudioRecorder,
} from 'expo-audio';

// ===================
// TYPE DEFINITIONS
// ===================

interface MediaItem {
	uri: string;
	type: 'photo' | 'video';
	name: string;
	mimeType?: string;
	fileSize?: number;
	fileName?: string | null;
	width?: number;
	height?: number;
}

interface UseMediaCaptureReturn {
	selectedMedia: MediaItem[];
	audioUri: string | null;
	isRecording: boolean;
	isPlayingAudio: boolean;
	recording: AudioRecorder | null;
	sound: AudioPlayer | null;
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
	const audioRecorder = useAudioRecorder(RecordingPresets.LOW_QUALITY);
	const [isRecording, setIsRecording] = useState(false);
	const [audioUri, setAudioUri] = useState<string | null>(null);
	const audioPlayer = useAudioPlayer();
	const [isPlayingAudio, setIsPlayingAudio] = useState(false);

	// =====================
	// CLEANUP ON UNMOUNT
	// =====================

	useEffect(() => {
		return () => {
			try {
				// Only try to stop if recorder exists and is recording (THIS PLAYER NEEDS TO EXIST)
				if (audioRecorder && audioRecorder.isRecording) {
					audioRecorder.stop();
				}
			} catch (error) {}

			try {
				// Only try to remove if player exists
				if (audioPlayer) {
					audioPlayer.remove();
				}
			} catch (error) {}
		};
	}, [audioRecorder, audioPlayer]);

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
				const asset = result.assets[0];
				const newMedia: MediaItem = {
					uri: asset.uri,
					type: 'photo',
					name:
						asset.fileName ||
						`Captured Memory ${selectedMedia.length + 1}`,
					mimeType: asset.mimeType,
					fileSize: asset.fileSize,
					fileName: asset.fileName,
					width: asset.width,
					height: asset.height,
				};
				if (mode === 'single-photo') {
					setSelectedMedia([newMedia]);
				} else {
					setSelectedMedia((prev) => [...prev, newMedia]);
				}
				showModal(
					'success',
					'Photo Added!',
					customLabels.photoAdded ||
						'Your photo has been successfully added.'
				);
			}
		} catch (error) {
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
				const asset = result.assets[0];
				const newMedia: MediaItem = {
					uri: asset.uri,
					type: 'photo',
					name:
						asset.fileName ||
						`Captured Memory ${selectedMedia.length + 1}`,
					mimeType: asset.mimeType,
					fileSize: asset.fileSize,
					fileName: asset.fileName,
					width: asset.width,
					height: asset.height,
				};
				if (mode === 'single-photo') {
					setSelectedMedia([newMedia]); // Replace existing photo (THIS IS USED FOR PROFILE PHOTO)
				} else {
					setSelectedMedia((prev) => [...prev, newMedia]); // Add to Object
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
			const status = await AudioModule.requestRecordingPermissionsAsync();

			if (!status.granted) {
				Alert.alert(
					'Microphone Permission Required',
					'Please enable microphone access in your device settings to record audio.',
					[{ text: 'OK' }]
				);
				return;
			}

			await audioRecorder.prepareToRecordAsync();
			audioRecorder.record();
			setIsRecording(true);
		} catch (error) {
			Alert.alert(
				'Recording Error',
				'Could not start recording. Please try again.',
				[{ text: 'OK' }]
			);
		}
	}, []);

	const stopRecording = useCallback(async () => {
		try {
			setIsRecording(false);

			await audioRecorder.stop();

			const uri = audioRecorder.uri;
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
		} catch (error) {
			Alert.alert(
				'Recording Error',
				'Could not stop recording. Please try again.',
				[{ text: 'OK' }]
			);
		}
	}, [audioRecorder, showModal, customLabels]);

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
			setIsPlayingAudio(true);

			// Use new player hook
			audioPlayer.replace({ uri: audioUri });
			audioPlayer.play();
		} catch (error) {
			setIsPlayingAudio(false);
			Alert.alert(
				'Playback Error',
				'Could not play the recording. Please try again.',
				[{ text: 'OK' }]
			);
		}
	}, [audioUri, audioPlayer]);

	const stopPlayback = useCallback(async () => {
		try {
			audioPlayer.pause();
			setIsPlayingAudio(false);
		} catch (error) {}
	}, [audioPlayer]);

	const removeAudio = useCallback(() => {
		try {
			if (audioPlayer) {
				audioPlayer.pause();
			}
		} catch (error) {}
		setIsPlayingAudio(false);
		setAudioUri(null);
	}, [audioPlayer]);

	// ===================
	// UTILITY FUNCTIONS
	// ===================

	const resetMedia = useCallback(() => {
		setSelectedMedia([]);
		removeAudio();

		try {
			if (audioRecorder && audioRecorder.isRecording) {
				audioRecorder.stop();
				setIsRecording(false);
			}
		} catch (error) {
			setIsRecording(false);
		}
	}, [audioRecorder, removeAudio]);

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
		recording: allowAudio ? audioRecorder : null,
		sound: allowAudio ? audioPlayer : null,

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
