// hooks/createPin/useCreatePin.ts
import { useState, useCallback } from 'react';
import { router } from 'expo-router';
import {
	createMemoryPin,
	type CreateMemoryRequest,
	type UploadProgress,
} from '@/services/memoryService';
import { MediaItem } from './useMediaCapture';

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

	// Modal system
	showModal: (
		type: string,
		title: string,
		message: string,
		actions?: any[]
	) => void;
	hideModal: () => void;
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
		showModal,
		hideModal,
	} = props;

	// ==================
	//   STATE MANAGEMENT
	// ==================
	const [previewData, setPreviewData] = useState<MemoryData | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
		null
	);

	// =======================
	//  DATA TRANSFORMATION
	// =======================

	// Global
	const createCoreMemoryData = useCallback(() => {
		// Shared validation and data preparation
		if (!coordinates) {
			throw new Error('Location coordinates are required');
		}

		return {
			// Core content (used by both formatters)
			title: memoryTitle.trim(),
			description: memoryDescription.trim(),
			coordinates,
			locationQuery: locationQuery.trim(),
			visibility: selectedVisibility,
			socialCircles: selectedSocialCircles,

			// Processed media (used by both formatters)
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
	// Frontend
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

	// Backend
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
	//   PREVIEW FUNCTIONALITY
	// ===========================
	const handlePreviewMemory = useCallback(() => {
		if (!validateMemoryContent()) {
			return;
		}

		const memoryData = createPreviewData();
		setPreviewData(memoryData);
	}, [validateMemoryContent, createPreviewData]);

	// ===========================
	//   SAVE FUNCTIONALITY
	// ===========================
	const handleConfirmSave = useCallback(async () => {
		const TESTING_MODE = __DEV__ || process.env.NODE_ENV === 'development';

		setIsSaving(true);
		setUploadProgress({
			total: 0,
			completed: 0,
			currentFile: 'Preparing...',
			percentage: 0,
		});

		try {
			const memoryData = createPreviewData();
			const backendData = createSubmissionData();

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

				console.log('Frontend data (OBJECT):', memoryData);
				console.log('Backend payload (OBJECT):', backendData);

				const result = {
					success: true,
					data: {
						id: `test-${Date.now()}`,
						name: backendData.name,
					},
				};

				handleSaveSuccess(memoryData, result);
			} else {
				const result = await createMemoryPin(backendData, {
					onStart: () => {
						console.log('Upload started');
					},
					onProgress: setUploadProgress,
					onFileComplete: (fileName) => {
						console.log(`File completed: ${fileName}`);
					},
					onComplete: () => {
						console.log('All uploads completed');
					},
					onError: (error) => {
						console.error('Upload error:', error);
					},
				});

				if (result.success) {
					console.log('Memory saved:', result.data);
					handleSaveSuccess(memoryData, result);
				} else {
					handleSaveError(result.error || 'Unknown error occurred'); // ✅ Fixed
				}
			}
		} catch (error) {
			console.error('Save error:', error);
			handleSaveError('Unexpected error occurred');
		} finally {
			setIsSaving(false);
			setUploadProgress(null);
		}
	}, [createPreviewData, createSubmissionData, selectedMedia, audioUri]);

	const handleSaveSuccess = useCallback(
		(memoryData: MemoryData, result: any) => {
			hideModal();
			console.log('Save successful:', memoryData, result);
			router.replace('/worldmap');
			resetForm();
		},
		[hideModal]
	);

	const handleSaveError = useCallback((error: string) => {
		console.log('Save Failed', error);
	}, []);

	const resetForm = useCallback(() => {
		hideModal();
		setMemoryTitle('');
		setMemoryDescription('');
		resetMemoryContent();
		resetMedia();
		resetAllPrivacySettings();
		setPreviewData(null);
	}, [
		hideModal,
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
		uploadProgress,

		// Actions
		handlePreviewMemory,
		hideModal,
		handleConfirmSave,
		resetForm,

		// Data creators (in case you need them elsewhere)
		createPreviewData,
		createSubmissionData,
	};
};
