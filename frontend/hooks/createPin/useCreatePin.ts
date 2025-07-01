// ========================
//   CORE IMPORTS
// ========================
import { useState, useCallback } from 'react';
import { router } from 'expo-router';
<<<<<<< HEAD

// ========================
//   INTERNAL IMPORTS
// ========================
=======
import RemapClient from '@/app/services/remap';
import { MediaItem } from './useMediaCapture';
>>>>>>> 13d4256c699d9b048d56625de6074c3413f684c7
import { useNotification } from '@/contexts/NotificationContext';
import { MediaItem } from './useMediaCapture';
import RemapClient, { type CreateMemoryRequest } from '@/app/services/remap';

// ========================
//   TYPE DEFINITIONS
// ========================
interface MemoryData {
	id: string;
	timestamp: string;
	location: {
		query: string;
	};
	content: {
		name: string;
		description: string;
	};
	visibility: string[];
	socialCircles: string[];
	media: {
		photos: any[];
		videos: any[];
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

// FormData interface for remap.ts
interface CreatePinFormData {
	name: string;
	description: string;
	latitude: number;
	longitude: number;
	location_query: string;
	visibility: string[];
	social_circles: string[];
	media: {
		photos: Array<{ uri: string; name: string }>;
		videos: Array<{ uri: string; name: string }>;
		audio: { uri: string } | null;
	};
}

interface UseCreatePinProps {
	// Content data
	memoryName: string;
	memoryDescription: string;
	locationQuery: string;
	coordinates: {
		latitude: number;
		longitude: number;
		address: string;
	} | null;

	// Privacy data
	selectedVisibility: string[];
	selectedSocialCircles: string[];

	// Media data
	selectedMedia: MediaItem[];
	audioUri: string | null;

	// Validation function
	validateMemoryContent: () => boolean;

	// Reset functions
	resetMemoryContent: () => void;
	resetMedia: () => void;
	resetAllPrivacySettings: () => void;
	setMemoryName: (name: string) => void;
	setMemoryDescription: (description: string) => void;

	// Success callback (kept for compatibility, but Context handles notifications)
	// OKKY: I want to have a look into this more as i think 'context' may be a 'hook like' method for notifications.
	onSuccess: (title: string, message: string) => void;
}

export const useCreatePin = (props: UseCreatePinProps) => {
	const {
		memoryName,
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
		resetAllPrivacySettings,
		setMemoryName,
		setMemoryDescription,
	} = props;

	// ==================
	//   CONTEXT HOOKS
	// ==================
	const { showSuccess, showError } = useNotification();

	// ==================
	//   REMAP CLIENT
	// ==================
	const remapClient = new RemapClient();

	// ==================
	//   STATE MANAGEMENT
	// ==================
	const [previewData, setPreviewData] = useState<MemoryData | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);

	// =======================
	//  DATA TRANSFORMATION
	// =======================

	// Global - shared data preparation
	const createCoreMemoryData = useCallback(() => {
		// Shared validation and data preparation
		if (!coordinates) {
			throw new Error('Location coordinates are required');
		}

		// Validate coordinates are within valid geographic ranges
		const { latitude, longitude } = coordinates;
		if (latitude < -90 || latitude > 90) {
			throw new Error('Latitude must be between -90 and 90 degrees');
		}
		if (longitude < -180 || longitude > 180) {
			throw new Error('Longitude must be between -180 and 180 degrees');
		}

		return {
			// Core content
			name: memoryName.trim(),
			description: memoryDescription.trim(),
			coordinates,
			locationQuery: locationQuery.trim(),
			visibility: selectedVisibility,
			socialCircles: selectedSocialCircles,

			// Processed media
			processedMedia: {
				photos: selectedMedia.filter((item) => item.type === 'photo'),
				videos: selectedMedia.filter((item) => item.type === 'video'),
				audio: audioUri,
			},

			// Calculated metadata
			totalMediaItems: selectedMedia.length + (audioUri ? 1 : 0),
			hasDescription: !!memoryDescription.trim(),
			timestamp: new Date().toISOString(),
		};
	}, [
		memoryName,
		memoryDescription,
		coordinates,
		locationQuery,
		selectedVisibility,
		selectedSocialCircles,
		selectedMedia,
		audioUri,
	]);

	// Frontend - creates preview data structure
	const createPreviewData = useCallback((): MemoryData => {
		const coreData = createCoreMemoryData();

		return {
			id: Date.now().toString(),
			timestamp: coreData.timestamp,
			location: {
				query: coreData.coordinates?.address || coreData.locationQuery,
			},
			content: {
				name: coreData.name,
				description: coreData.description,
			},
			visibility: coreData.visibility,
			socialCircles: coreData.socialCircles,
			media: {
				photos: coreData.processedMedia.photos,
				videos: coreData.processedMedia.videos,
				audio: coreData.processedMedia.audio
					? {
							uri: coreData.processedMedia.audio,
							recorded: coreData.timestamp,
					  }
					: null,
			},
			metadata: {
				totalMediaItems: coreData.totalMediaItems,
				hasDescription: coreData.hasDescription,
				createdAt: coreData.timestamp,
			},
		};
	}, [createCoreMemoryData]);

	// Backend - creates API submission data
	const createSubmissionData = useCallback((): CreatePinFormData => {
		const coreData = createCoreMemoryData();

		return {
			name: coreData.name,
			description: coreData.description,
			latitude: coreData.coordinates.latitude,
			longitude: coreData.coordinates.longitude,
			location_query: coreData.locationQuery,
			visibility: coreData.visibility,
			social_circles: coreData.socialCircles,
			media: {
				photos: coreData.processedMedia.photos.map((item) => ({
					uri: item.uri,
					name: item.name,
				})),
				videos: coreData.processedMedia.videos.map((item) => ({
					uri: item.uri,
					name: item.name,
				})),
				audio: coreData.processedMedia.audio
					? { uri: coreData.processedMedia.audio }
					: null,
			},
		};
	}, [createCoreMemoryData]);

	// ===========================
	//   MODAL CONTROL FUNCTIONS
	// ===========================

	const hidePreviewModal = useCallback(() => {
		console.log('🎯 [HOOK] Hiding preview modal');
		setPreviewData(null);
		setSaveError(null);
	}, []);

	// ===========================
	//   PREVIEW FUNCTIONALITY
	// ===========================
	const handlePreviewMemory = useCallback(() => {
		if (!validateMemoryContent()) {
			return;
		}

		const memoryData = createPreviewData();
		setPreviewData(memoryData);
		setSaveError(null);
	}, [validateMemoryContent, createPreviewData]);

	// ===========================
	//   SAVE FUNCTIONALITY
	// ===========================
	const handleConfirmSave = useCallback(async () => {
		try {
			setIsSaving(true);
			setSaveError(null);

			console.log('📡 [HOOK] Starting pin creation process');

			// Validate data
			if (!validateMemoryContent()) {
				throw new Error('Please fill in all required fields');
			}

			// Prepare data for backend
			const backendData = createSubmissionData();
			console.log('📡 [HOOK] Prepared backend data:', backendData);

			// Convert to FormData for remap.ts
			const formData = new FormData();
			formData.append('name', backendData.name);
			formData.append('description', backendData.description);
			formData.append('latitude', backendData.latitude.toString());
			formData.append('longitude', backendData.longitude.toString());
			formData.append('location_query', backendData.location_query);
			formData.append(
				'visibility',
				JSON.stringify(backendData.visibility)
			);
			formData.append(
				'social_circles',
				JSON.stringify(backendData.social_circles)
			);

			// Add media files
			backendData.media.photos.forEach((photo, index) => {
				formData.append('image', {
					uri: photo.uri,
					type: 'image/jpeg',
					name: photo.name,
				} as any);
			});

			backendData.media.videos.forEach((video, index) => {
				formData.append('video', {
					uri: video.uri,
					type: 'video/mp4',
					name: video.name,
				} as any);
			});

			if (backendData.media.audio) {
				formData.append('audio', {
					uri: backendData.media.audio.uri,
					type: 'audio/m4a',
					name: 'audio.m4a',
				} as any);
			}

			console.log('📡 [HOOK] Calling backend API via RemapClient');

<<<<<<< HEAD
			const result = await remapClient.createMemoryPin(backendData);
=======
			const remapClient = new RemapClient();
			const result = await remapClient.createPin(formData);
>>>>>>> 13d4256c699d9b048d56625de6074c3413f684c7

			console.log('🎯 [HOOK] Backend response:', result);

			if (result.success) {
				// Success handling
				showSuccess(
					'Memory Created!',
					'Your memory has been saved successfully.'
				);

				// Reset form
				resetMemoryContent();
				resetMedia();
				resetAllPrivacySettings();

				// Navigate back to map
				router.replace('/worldmap');
			} else {
				throw new Error(result.error || 'Failed to create memory');
			}
		} catch (error) {
			console.error('🎯 [HOOK] Pin creation failed:', error);

			const errorMessage =
				error instanceof Error
					? error.message
					: 'Unknown error occurred';
			setSaveError(errorMessage);
			showError('Creation Failed', errorMessage);
		} finally {
			setIsSaving(false);
		}
	}, [
<<<<<<< HEAD
		createPreviewData,
		createSubmissionData,
		hidePreviewModal,
		remapClient,
	]);

	// Success handler - uses Context notification
	const handleSaveSuccess = useCallback(
		(memoryData: MemoryData, result: any) => {
			console.log(
				'🎉 [HOOK] Save successful, showing notification and navigating'
			);

			// Reset all form state
			setIsSaving(false);
			setSaveError(null);

			// Show success notification via Context (TOP SHEET)
			showSuccess(
				'Pin created successfully! 🎉',
				`"${memoryData.content.title}" added to ${memoryData.location.query}`
			);

			router.replace('/worldmap');
		},
		[showSuccess]
	);

	// Error handler
	const handleSaveError = useCallback(
		(error: string) => {
			console.error('❌ [HOOK] Save failed:', error);
			setIsSaving(false);
			setSaveError(error);

			// Show error notification via Context
			showError('Failed to create pin', error);
		},
		[showError]
	);
=======
		validateMemoryContent,
		createSubmissionData,
		resetMemoryContent,
		resetMedia,
		resetAllPrivacySettings,
		showSuccess,
		showError,
	]);
>>>>>>> 13d4256c699d9b048d56625de6074c3413f684c7

	// Form reset utility
	const resetForm = useCallback(() => {
		hidePreviewModal();
		setMemoryName('');
		setMemoryDescription('');
		resetMemoryContent();
		resetMedia();
		resetAllPrivacySettings();
		setPreviewData(null);
		setIsSaving(false);
		setSaveError(null);
	}, [
		hidePreviewModal,
		setMemoryName,
		setMemoryDescription,
		resetMemoryContent,
		resetMedia,
		resetAllPrivacySettings,
	]);

	// ==================
	//   RETURN INTERFACE
	// ==================
	return {
		// State
		previewData,
		isSaving,
		saveError,

		// Actions
		handlePreviewMemory,
		hidePreviewModal,
		handleConfirmSave,
		resetForm,

		// Data creators (exported in case needed elsewhere)
		createPreviewData,
		createSubmissionData,
	};
};
