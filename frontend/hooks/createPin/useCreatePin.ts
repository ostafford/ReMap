// hooks/createPin/useCreatePin.ts
import { useState, useCallback } from 'react';
import { router } from 'expo-router';
import {
	createMemoryPin,
	type CreateMemoryRequest,
} from '@/services/memoryService';
import { MediaItem } from './useMediaCapture';
import { useNotification } from '@/contexts/NotificationContext';

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
		title: string;
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

interface UseCreatePinProps {
	// Content data
	memoryTitle: string;
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
	setMemoryTitle: (title: string) => void;
	setMemoryDescription: (description: string) => void;

	// Success callback (kept for compatibility, but Context handles notifications)
	// OKKY: I want to have a look into this more as i think 'context' may be a 'hook like' method for notifications.
	onSuccess: (title: string, message: string) => void;
}

export const useCreatePin = (props: UseCreatePinProps) => {
	const {
		memoryTitle,
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
		setMemoryTitle,
		setMemoryDescription,
	} = props;

	// ==================
	//   CONTEXT HOOKS
	// ==================
	const { showSuccess, showError } = useNotification();

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

		return {
			// Core content
			title: memoryTitle.trim(),
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
		memoryTitle,
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
				title: coreData.title,
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
	const createSubmissionData = useCallback((): CreateMemoryRequest => {
		const coreData = createCoreMemoryData();

		return {
			name: coreData.title,
			description: coreData.description,
			latitude: coreData.coordinates.latitude,
			longitude: coreData.coordinates.longitude,
			location_query: coreData.locationQuery,
			visibility: coreData.visibility,
			social_circle_ids: coreData.socialCircles,
			media: {
				photos: coreData.processedMedia.photos,
				videos: coreData.processedMedia.videos,
				audio: coreData.processedMedia.audio
					? {
							uri: coreData.processedMedia.audio,
					  }
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
		console.log('🎯 [HOOK] Starting memory save process');

		// Clear any previous errors
		setSaveError(null);

		hidePreviewModal();

		setIsSaving(true);

		try {
			const memoryData = createPreviewData();
			const backendData = createSubmissionData();

			console.log('📡 [HOOK] Calling backend API');

			const result = await createMemoryPin(backendData);

			console.log('🎯 [HOOK] Backend response:', result);

			if (result.success) {
				console.log(
					'✅ [HOOK] Memory saved successfully:',
					result.data
				);
				handleSaveSuccess(memoryData, result);
			} else {
				handleSaveError(result.error || 'Unknown error occurred');
			}
		} catch (error) {
			console.error('💥 [HOOK] Save error:', error);
			handleSaveError('Unexpected error occurred');
		}
	}, [createPreviewData, createSubmissionData, hidePreviewModal]);

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

	// Form reset utility
	const resetForm = useCallback(() => {
		hidePreviewModal();
		setMemoryTitle('');
		setMemoryDescription('');
		resetMemoryContent();
		resetMedia();
		resetAllPrivacySettings();
		setPreviewData(null);
		setIsSaving(false);
		setSaveError(null);
	}, [
		hidePreviewModal,
		setMemoryTitle,
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
