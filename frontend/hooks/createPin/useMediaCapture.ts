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

/**
 * Individual media item structure for photos and videos
 *
 * LAYMAN TERMS: "Each photo or video that users add to their memory gets
 * packaged into this format. Contains the file location, whether it's a
 * photo or video, and a friendly name for display."
 *
 * TECHNICAL: Media item interface for unified photo/video handling with
 * file system integration and type discrimination
 *
 * @interface MediaItem
 */
interface MediaItem {
	uri: string;
	type: 'photo' | 'video';
	name: string;
}
/**
 * Return interface for useMediaCapture hook
 *
 * LAYMAN TERMS: "Everything this media hook gives back to components that use it.
 * Includes the current photos/videos/audio, functions to add/remove media,
 * recording controls, playback controls, and helper functions."
 *
 * TECHNICAL: Comprehensive interface defining all state, handlers, objects,
 * and utilities returned by the useMediaCapture hook for media management
 *
 * @interface UseMediaCaptureReturn
 */
interface UseMediaCaptureReturn {
	selectedMedia: MediaItem[];
	audioUri: string | null;
	isRecording: boolean;
	isPlayingAudio: boolean;
	recording: Audio.Recording | null;
	sound: Audio.Sound | null;
	handleCameraPress: () => Promise<void>;
	removeMedia: (index: number) => void;
	handleAudioPress: () => Promise<void>;
	playRecording: () => Promise<void>;
	stopPlayback: () => Promise<void>;
	removeAudio: () => void;
	resetMedia: () => void;
	getMediaSummary: () => {
		totalItems: number;
		photoCount: number;
		videoCount: number;
		hasAudio: boolean;
	};
}
/**
 * Props interface for useMediaCapture hook
 *
 * LAYMAN TERMS: "What this hook needs from the component to work properly.
 * Just needs a function to show success/error popups to users."
 *
 * TECHNICAL: Hook dependency interface for modal integration
 *
 * @interface UseMediaCaptureProps
 */
interface UseMediaCaptureProps {
	showModal: (
		type: 'error' | 'success' | 'info',
		title: string,
		message: string
	) => void;
}

// =============================
// CUSTOM HOOK IMPLEMENTATION
// =============================

/**
 * Custom hook for comprehensive media capture and management
 *
 * LAYMAN TERMS: "This hook is like a multimedia studio manager for memories.
 * It handles everything related to photos, videos, and audio recordings. Users
 * can take photos, choose from their photo library, record voice notes, play
 * them back, and manage their media collection. It handles all the complex
 * stuff like permissions, file management, and audio playback."
 *
 * Key features:
 * - Photo capture (camera or library selection)
 * - Audio recording with start/stop controls
 * - Audio playback with automatic cleanup
 * - Media removal and management
 * - Permission handling for camera and microphone
 * - Error handling with user-friendly messages
 * - Automatic resource cleanup on unmount
 *
 * TECHNICAL: Custom React hook encapsulating multimedia functionality with
 * Expo ImagePicker and Audio APIs. Manages complex state interactions between
 * recording, playback, and media collection with proper resource lifecycle
 * management and permission handling.
 *
 * @hook useMediaCapture
 * @param {UseMediaCaptureProps} props - Hook configuration object
 * @param {Function} props.showModal - Modal display function for user feedback
 * @returns {UseMediaCaptureReturn} Complete media management interface
 *
 * @example
 * In CreatePin component:
 * const mediaCapture = useMediaCapture({ showModal });
 *
 * const {
 *   selectedMedia,
 *   handleCameraPress,
 *   audioUri,
 *   isRecording,
 *   handleAudioPress,
 *   playRecording,
 *   getMediaSummary
 * } = mediaCapture;
 *
 * In JSX:
 * <MediaCapture
 *   selectedMedia={selectedMedia}
 *   onCameraPress={handleCameraPress}
 *   audioUri={audioUri}
 *   isRecording={isRecording}
 *   onAudioPress={handleAudioPress}
 *   onPlayAudio={playRecording}
 *   mediaSummary={getMediaSummary()}
 * />
 *
 * @see {@link MediaCapture} for UI component integration
 * @see {@link MediaItem} for individual media item structure
 */
export function useMediaCapture({
	showModal,
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

	/**
	 * Cleanup audio resources when component unmounts
	 *
	 * LAYMAN TERMS: "When the user leaves this screen, make sure to properly
	 * close any audio files or recordings that are still open. This prevents
	 * memory leaks and ensures the microphone isn't stuck recording."
	 *
	 * TECHNICAL: Effect hook for audio resource cleanup on component unmount
	 * to prevent memory leaks and resource conflicts
	 */
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

	/**
	 * Handle camera button press with permission check and option selection
	 *
	 * LAYMAN TERMS: "When user taps the camera button, first check if we have
	 * permission to use the camera. If yes, show them choices: take a new photo
	 * or pick from their photo library. If no permission, show helpful message."
	 *
	 * TECHNICAL: Primary camera interaction handler with permission management
	 * and user choice modal for camera vs library selection
	 *
	 * @async
	 * @function handleCameraPress
	 *
	 * @example
	 * User taps camera button in MediaCapture component
	 * await handleCameraPress();
	 *
	 * Results in:
	 * 1. Permission check
	 * 2. If granted: Alert with "Take Photo" / "Choose from Library" options
	 * 3. If denied: Permission error alert
	 */
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

	/**
	 * Open device camera for photo capture
	 *
	 * LAYMAN TERMS: "Open the camera app so user can take a new photo. When they
	 * take the photo, add it to their memory and show a success message."
	 *
	 * TECHNICAL: Camera launch handler with result processing and state updates
	 *
	 * @async
	 * @function openCamera
	 */
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
	}, [selectedMedia.length, showModal]);

	/**
	 * Open photo library for image selection
	 *
	 * LAYMAN TERMS: "Open the photo library so user can pick an existing photo.
	 * When they select one, add it to their memory and show success message."
	 *
	 * TECHNICAL: Photo library launch handler with result processing and state updates
	 *
	 * @async
	 * @function openImageLibrary
	 */
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
	}, [selectedMedia.length, showModal]);

	/**
	 * Remove a specific media item from the collection
	 *
	 * LAYMAN TERMS: "When user taps 'Remove' on a photo or video, delete it
	 * from their memory collection. Simple removal by position in the list."
	 *
	 * TECHNICAL: Media removal handler using array filtering by index
	 *
	 * @function removeMedia
	 * @param {number} indexToRemove - Array index of media item to remove
	 *
	 * @example
	 * User has 3 photos and wants to remove the 2nd one (index 1)
	 * removeMedia(1);
	 * Result: selectedMedia array goes from 3 items to 2 items
	 */
	const removeMedia = useCallback((indexToRemove: number) => {
		setSelectedMedia((prev) =>
			prev.filter((_, index) => index !== indexToRemove)
		);
	}, []);

	// ==========================
	// AUDIO RECORDING HANDLERS
	// ==========================

	/**
	 * Start audio recording with permission check and setup
	 *
	 * LAYMAN TERMS: "When user wants to start recording, check if we can use
	 * the microphone, set up the audio system, then start recording. Show
	 * error if something goes wrong."
	 *
	 * TECHNICAL: Audio recording initiation with permission management,
	 * audio mode configuration, and recording object creation
	 *
	 * @async
	 * @function startRecording
	 */
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

	/**
	 * Stop audio recording and save the result
	 *
	 * LAYMAN TERMS: "When user wants to stop recording, stop the microphone,
	 * save the audio file, and show success message. Clean up the recording object."
	 *
	 * TECHNICAL: Audio recording termination with file saving and state cleanup
	 *
	 * @async
	 * @function stopRecording
	 */
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
	}, [recording, showModal]);

	/**
	 * Toggle audio recording on/off
	 *
	 * LAYMAN TERMS: "When user taps the microphone button, start recording if
	 * not recording, or stop recording if currently recording. Simple toggle."
	 *
	 * TECHNICAL: Audio recording state toggle handler
	 *
	 * @async
	 * @function handleAudioPress
	 */
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

	/**
	 * Play back the recorded audio
	 *
	 * LAYMAN TERMS: "When user taps the play button, load the audio file and
	 * start playing it. Set up automatic cleanup when playback finishes."
	 *
	 * TECHNICAL: Audio playback initiation with sound object management
	 * and automatic cleanup on completion
	 *
	 * @async
	 * @function playRecording
	 */
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

	/**
	 * Stop audio playback manually
	 *
	 * LAYMAN TERMS: "When user taps stop button during playback, immediately
	 * stop the audio and clean up the player."
	 *
	 * TECHNICAL: Manual audio playback termination with cleanup
	 *
	 * @async
	 * @function stopPlayback
	 */
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

	/**
	 * Remove the recorded audio completely
	 *
	 * LAYMAN TERMS: "When user wants to delete their audio recording, stop
	 * any playback, clean up the player, and clear the audio file reference."
	 *
	 * TECHNICAL: Complete audio removal with playback cleanup
	 *
	 * @function removeAudio
	 */
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

	/**
	 * Reset all media state to empty
	 *
	 * LAYMAN TERMS: "Clear out all photos, videos, and audio recordings.
	 * Used when starting a new memory or when user wants to start over."
	 *
	 * TECHNICAL: Complete media state reset for form cleanup
	 *
	 * @function resetMedia
	 */
	const resetMedia = useCallback(() => {
		setSelectedMedia([]);
		removeAudio();
		if (recording) {
			recording.stopAndUnloadAsync();
			setRecording(null);
			setIsRecording(false);
		}
	}, [recording, removeAudio]);

	/**
	 * Calculate summary statistics about attached media
	 *
	 * LAYMAN TERMS: "Count up how many photos, videos, and audio recordings
	 * are attached to this memory. Used for showing summaries to users."
	 *
	 * TECHNICAL: Media collection analyzer for UI feedback and validation
	 *
	 * @function getMediaSummary
	 * @returns {object} Summary statistics object with counts and flags
	 *
	 * @example
	 * User has 2 photos, 1 video, and 1 audio recording
	 * const summary = getMediaSummary();
	 * Result: {
	 *    totalItems: 4,
	 *    photoCount: 2,
	 *    videoCount: 1,
	 *    hasAudio: true
	 *  }
	 */
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
		audioUri,
		isRecording,
		isPlayingAudio,
		recording,
		sound,

		// Camera/Photo handlers
		handleCameraPress,
		removeMedia,

		// Audio handlers
		handleAudioPress,
		playRecording,
		stopPlayback,
		removeAudio,

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
