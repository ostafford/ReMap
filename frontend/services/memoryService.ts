// =====================================
//   MEMORY SERVICE - BACKEND API INTEGRATION
// =====================================
// Purpose: API communication layer between frontend hooks and Express.js backend
// Replaces direct Supabase calls with backend API calls

import { supabase, supabaseUrl, supabaseAnonKey } from '@/lib/supabase';
import { getCurrentUser } from '@/services/auth';

// ==================
// TYPE DEFINITIONS
// ==================

export interface CreateMemoryRequest {
	name: string;
	description: string;
	latitude: number;
	longitude: number;
	location_query: string;
	visibility: string[];
	social_circle_ids: string[];
	media: {
		photos: Array<{ uri: string; name: string }>;
		videos: Array<{ uri: string; name: string }>;
		audio: { uri: string } | null;
	};
}

export interface UploadProgress {
	total: number;
	completed: number;
	currentFile: string;
	percentage: number;
}

export interface UploadProgressCallbacks {
	onStart?: () => void;
	onProgress?: (progress: UploadProgress) => void;
	onFileComplete?: (fileName: string) => void;
	onComplete?: () => void;
	onError?: (error: Error) => void;
}

interface ApiResponse {
	success: boolean;
	data?: any;
	error?: string;
}

// ==================
// CONFIGURATION
// ==================

const API_BASE_URL = __DEV__
	? 'http://192.168.1.22:3000'
	: 'https://your-production-api.com'; // TODO: Replace with actual production URL

const API_ENDPOINTS = {
	CREATE_PIN: '/api/pins/user',
	HEALTH_CHECK: '/api/profiles',
} as const;

// ==================
// AUTHENTICATION HELPER
// ==================

/**
 * Gets the JWT token from Supabase auth for backend API calls
 * Following your teammate's noted pattern:
 * "Add JWT to headers as 'Authorization': 'Bearer {token}'"
 */
const getAuthToken = async (): Promise<string> => {
	try {
		const { user } = await getCurrentUser();
		if (!user) {
			throw new Error('User not authenticated');
		}

		// Get the session to access the JWT token
		const { supabase } = await import('@/lib/supabase');
		const {
			data: { session },
			error,
		} = await supabase.auth.getSession();

		if (error || !session?.access_token) {
			throw new Error('Could not retrieve authentication token');
		}

		return session.access_token;
	} catch (error) {
		console.error('Failed to get auth token:', error);
		throw new Error('Authentication failed');
	}
};

// ==================
// DATA TRANSFORMATION
// ==================

/**
 * Converts frontend data format to FormData for backend API
 * Handles the separation of regular data vs files
 */
const buildFormDataForBackend = async (
	memoryData: CreateMemoryRequest
): Promise<FormData> => {
	const formData = new FormData();

	// Add regular text data
	formData.append('name', memoryData.name);
	formData.append('description', memoryData.description);
	formData.append('latitude', memoryData.latitude.toString());
	formData.append('longitude', memoryData.longitude.toString());

	// Add visibility as JSON string (since FormData doesn't handle arrays well)
	formData.append('visibility', JSON.stringify(memoryData.visibility));
	formData.append(
		'social_circle_ids',
		JSON.stringify(memoryData.social_circle_ids)
	);
	formData.append('location_query', memoryData.location_query);

	// Add image files
	for (const photo of memoryData.media.photos) {
		try {
			// Convert URI to blob for upload
			const response = await fetch(photo.uri);
			const blob = await response.blob();

			formData.append('image', blob, photo.name);
		} catch (error) {
			console.error(`Failed to process photo ${photo.name}:`, error);
			throw new Error(`Could not process photo: ${photo.name}`);
		}
	}

	// Add video files
	for (const video of memoryData.media.videos) {
		try {
			const response = await fetch(video.uri);
			const blob = await response.blob();

			formData.append('video', blob, video.name);
		} catch (error) {
			console.error(`Failed to process video ${video.name}:`, error);
			throw new Error(`Could not process video: ${video.name}`);
		}
	}

	// Add audio file
	if (memoryData.media.audio) {
		try {
			const response = await fetch(memoryData.media.audio.uri);
			const blob = await response.blob();

			formData.append('audio', blob, 'audio_recording.m4a');
		} catch (error) {
			console.error('Failed to process audio:', error);
			throw new Error('Could not process audio recording');
		}
	}

	return formData;
};

// ==================
// PROGRESS TRACKING
// ==================

/**
 * Simulates upload progress for better UX
 * In a real implementation, you might track actual upload progress
 */
const simulateUploadProgress = (
	totalFiles: number,
	callbacks?: UploadProgressCallbacks
): Promise<void> => {
	return new Promise((resolve) => {
		let completed = 0;

		const updateProgress = (fileName: string) => {
			completed++;
			const percentage = Math.round((completed / (totalFiles + 1)) * 100);

			callbacks?.onProgress?.({
				total: totalFiles + 1,
				completed,
				currentFile: fileName,
				percentage,
			});

			callbacks?.onFileComplete?.(fileName);
		};

		// Simulate file uploads
		const files = [
			'Preparing files...',
			'Uploading images...',
			'Uploading audio...',
			'Creating memory...',
		];

		files.slice(0, totalFiles + 1).forEach((fileName, index) => {
			setTimeout(() => {
				updateProgress(fileName);
				if (index === files.length - 1 || index === totalFiles) {
					resolve();
				}
			}, index * 800); // 800ms delay between updates
		});
	});
};

// ==================
// VALIDATION
// ==================

/**
 * Client-side validation before sending to backend
 * Backend will also validate, but this provides immediate feedback
 */
const validateMemoryData = (data: CreateMemoryRequest): string[] => {
	const errors: string[] = [];

	if (!data.name.trim()) {
		errors.push('Memory title is required');
	}

	if (data.name.trim().length > 100) {
		errors.push('Memory title must be less than 100 characters');
	}

	if (!data.description.trim()) {
		errors.push('Memory description is required');
	}

	if (data.description.trim().length > 500) {
		errors.push('Memory description must be less than 500 characters');
	}

	if (!data.latitude || !data.longitude) {
		errors.push('Valid location coordinates are required');
	}

	if (!data.location_query.trim()) {
		errors.push('Location description is required');
	}

	if (data.visibility.length === 0) {
		errors.push('Please select at least one visibility option');
	}

	return errors;
};

// ==================
// MAIN API FUNCTION
// ==================

/**
 * Creates a memory pin by calling the backend API
 * Replaces the previous direct Supabase implementation
 *
 * @param memoryData - The memory data from frontend hooks
 * @param callbacks - Progress and status callbacks for UI updates
 * @returns Promise with success/error result
 */
export const createMemoryPin = async (
	memoryData: CreateMemoryRequest,
	callbacks?: UploadProgressCallbacks
): Promise<ApiResponse> => {
	try {
		console.log('🚀 [DEBUG] createMemoryPin called with data:', {
			name: memoryData.name,
			hasPhotos: memoryData.media.photos.length > 0,
			hasAudio: !!memoryData.media.audio,
		});
		// Start the process
		callbacks?.onStart?.();
		console.log('🚀 Starting memory creation via backend API...');

		// Validate data before sending
		console.log('🔍 [DEBUG] Starting validation...');
		const validationErrors = validateMemoryData(memoryData);
		if (validationErrors.length > 0) {
			throw new Error(
				`Validation failed: ${validationErrors.join(', ')}`
			);
		}
		console.log('✅ [DEBUG] Validation passed');

		// Get authentication token
		console.log('🔍 [DEBUG] Getting auth token...');
		const authToken = await getAuthToken();
		console.log('✅ Authentication token retrieved');

		// Calculate total files for progress tracking
		const totalFiles =
			memoryData.media.photos.length +
			memoryData.media.videos.length +
			(memoryData.media.audio ? 1 : 0);

		// Start progress simulation (you can replace this with real progress tracking)
		const progressPromise = simulateUploadProgress(totalFiles, callbacks);

		// Build FormData for backend
		console.log('📦 Preparing files and data for upload...');
		const formData = await buildFormDataForBackend(memoryData);
		console.log('✅ [DEBUG] FormData built');

		// Make API call to your backend
		console.log(
			'📡 [DEBUG] Making API call to:',
			`${API_BASE_URL}${API_ENDPOINTS.CREATE_PIN}`
		);
		const response = await fetch(
			`${API_BASE_URL}${API_ENDPOINTS.CREATE_PIN}`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${authToken}`,
					// Note: Don't set Content-Type header when using FormData
					// The browser will set it automatically with boundary
				},
				body: formData,
			}
		);
		console.log('📡 [DEBUG] Response received, status:', response.status);

		// Wait for progress simulation to complete
		await progressPromise;

		// Handle response
		if (!response.ok) {
			const errorText = await response.text();
			console.error('❌ Backend API error:', {
				status: response.status,
				statusText: response.statusText,
				body: errorText,
			});

			throw new Error(`Backend error (${response.status}): ${errorText}`);
		}

		// Parse successful response
		const result = await response.json();
		console.log('✅ Memory created successfully:', result);

		callbacks?.onComplete?.();

		return {
			success: true,
			data: result,
		};
	} catch (error) {
		console.error('💥 Memory creation failed:', error);

		callbacks?.onError?.(error as Error);

		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'Unknown error occurred',
		};
	}
};

// ==================
// HEALTH CHECK UTILITY
// ==================

/**
 * Simple health check to verify backend connectivity
 * Useful for debugging connection issues
 */
export const checkBackendHealth = async (): Promise<boolean> => {
	try {
		const response = await fetch(
			`${API_BASE_URL}${API_ENDPOINTS.HEALTH_CHECK}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);

		return response.ok;
	} catch (error) {
		console.error('Backend health check failed:', error);
		return false;
	}
};

// ==================
// EXPORT ALL TYPES AND FUNCTIONS
// ==================

export type { ApiResponse };
export default createMemoryPin;
