/** Handles logic to communicate to backend */

import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database';
<<<<<<< HEAD
import { Platform } from 'react-native';

// ==================
// TYPE DEFINITIONS
// ==================

export interface CreateMemoryRequest {
	name: string;
	description: string;
	latitude: number;
	longitude: number;
	location_query: string; // Human readable location (What the user typed in, or what the GPS button returns)
	visibility: string[];
	social_circle_ids: string[];
	media: {
		photos: Array<{ uri: string; name: string }>;
		videos: Array<{ uri: string; name: string }>;
		audio: { uri: string } | null;
	};
}

// Frontend pin structure for map display
export interface MapPin {
	id: string;
	name: string;
	description: string;
	latitude: number;
	longitude: number;
	address: string;
	author: string;
	createdAt: string;
	visibility: string;
	imageUrls: string[] | null;
	audioUrl: string | null;
	videoUrls: string[] | null;
	ownerId: string;
	locationQuery: string;
	socialCircleIds: string[];
	categories: {
		id: string;
		name: string;
		icon: string;
		primary: boolean;
	}[];
	starterPackCategory: string;
}

// ==================
// UTILITY FUNCTIONS
// ==================
=======
>>>>>>> 13d4256c699d9b048d56625de6074c3413f684c7

const getApiBaseUrl = (): string => {
	const url = process.env.EXPO_PUBLIC_BACKEND_URL;

	if (!url) {
		throw new Error('Backend url not defined');
	}

	return url;
};
<<<<<<< HEAD

/**
 * Utility function to derive privatePin from visibility
 * Use this if you need the boolean privatePin value
 */
export const isPrivatePin = (visibility: string): boolean => {
	return visibility === 'private';
};
=======
>>>>>>> 13d4256c699d9b048d56625de6074c3413f684c7

// Put ip address here
const API_BASE_URL = getApiBaseUrl();

export default class RemapClient {
	private baseUrl;

	constructor() {
		if (!API_BASE_URL) {
			throw new Error('api base not defined');
		}

		this.baseUrl = API_BASE_URL;
	}

<<<<<<< HEAD
	// ==================
	// AUTHENTICATION METHODS
	// ==================

	/**
	 * Core HTTP request handler with authentication
	 * Example: makeRequest('pins/user', 'POST', { body: formData, isFormData: true })
	 */
	private async makeRequest(
		endpoint: string,
		method: string,
		options: {
			body?: any;
			isFormData?: boolean;
		} = {}
	) {
		// Get auth token
		const { data, error: authError } = await supabase.auth.getSession();
		const token = data.session?.access_token;

=======
	async makeAuthRequest(
		endpoint: string,
		method: string,
		body?: any,
		isFormData?: boolean
	) {
		// Get Supabase session
		const { data, error: authError } = await supabase.auth.getSession();

		const token = data.session?.access_token;

		// Build headers with token
>>>>>>> 13d4256c699d9b048d56625de6074c3413f684c7
		const headers: Record<string, string> = {
			Authorization: `Bearer ${token}`,
		};

<<<<<<< HEAD
		// Add content type header if not form data
		if (!options.isFormData) {
			headers['Content-Type'] = 'application/json';
		}

		// Make HTTP request
		const response = await fetch(`${this.baseUrl}/api/${endpoint}`, {
			headers,
			method,
			body: options.body,
		});

		// Handle errors
		if (response.status === 403) {
=======
		// Handle content types
		if (isFormData) {
			// Let browser set boundary automatically
		} else {
			headers['Content-Type'] = 'application/json';
		}

		// Make request
		const response = await fetch(`${this.baseUrl}/api/${endpoint}`, {
			headers,
			method,
			body,
		});

		// Handle errors
		if (response.status == 403) {
>>>>>>> 13d4256c699d9b048d56625de6074c3413f684c7
			throw new Error('Protected endpoint');
		}

		if (!response.ok) {
			throw new Error('API error');
		}

		return await response.json();
	}

<<<<<<< HEAD
	/**
	 * Public method for JSON requests
	 * Flow: remap.ts → makeRequest() → backend
	 * Example: makeAuthRequest('profiles/123', 'GET')
	 */
	async makeAuthRequest(endpoint: string, method: string, body?: any) {
		return this.makeRequest(endpoint, method, { body });
	}

	/**
	 * Makes authenticated FormData requests
	 */
	async makeFormDataRequest(
		endpoint: string,
		method: string,
		formData: FormData
	) {
		return this.makeRequest(endpoint, method, {
			body: formData,
			isFormData: true,
		});
	}

	async getUserId() {
		const { data, error } = await supabase.auth.getUser();

		return data.user?.id;
	}

	// ==================
	// PROFILE METHODS
	// ==================

	async getProfile(): Promise<Tables<'profiles'> & { pins: number }> {
		const userId = await this.getUserId();

		if (!userId) {
			throw new Error('No user id found');
		}

=======
	async getUserId() {
		const { data, error } = await supabase.auth.getUser();

		return data.user?.id;
	}

	async getProfile(): Promise<Tables<'profiles'> & { pins: number }> {
		const userId = await this.getUserId();

		if (!userId) {
			throw new Error('No user id found');
		}

>>>>>>> 13d4256c699d9b048d56625de6074c3413f684c7
		const response = await this.makeAuthRequest(
			`profiles/${userId}`,
			'GET'
		);

		return response;
	}

<<<<<<< HEAD
	// ==================
	// PIN CREATION METHODS
	// ==================
	/**
	 * Complete flow for creating a memory pin:
	 * 1. User fills form in createPin.tsx
	 * 2. useCreatePin.ts validates and prepares data
	 * 3. createMemoryPin() called with CreateMemoryRequest
	 * 4. buildFormDataForBackend() converts to FormData
	 * 5. makeFormDataRequest() sends HTTP POST
	 * 6. makeRequest() adds authentication headers
	 * 7. Backend receives at POST /api/pins/user
	 * 8. pinsController.ts processes and saves to database
	 * 9. Backend returns success response
	 * 10. Frontend shows success notification
	 */

	/**
	 * Purpose: Converts frontend data structure to FormData for file uploads
	 * Flow: CreateMemoryRequest → FormData → backend
	 * Why FormData: Backend expects multipart/form-data for file uploads
	 */
	private async buildFormDataForBackend(
		memoryData: CreateMemoryRequest
	): Promise<FormData> {
		const formData = new FormData();

		// Add regular text data
		formData.append('name', memoryData.name);
		formData.append('description', memoryData.description);
		formData.append('latitude', memoryData.latitude.toString());
		formData.append('longitude', memoryData.longitude.toString());
		formData.append('visibility', JSON.stringify(memoryData.visibility));
		formData.append(
			'social_circle_ids',
			JSON.stringify(memoryData.social_circle_ids)
		);
		formData.append('location_query', memoryData.location_query);

		// Add image files
		for (const photo of memoryData.media.photos) {
			try {
				const response = await fetch(photo.uri);
				const blob = await response.blob();
				formData.append('image', blob, photo.name);
			} catch (error) {
				console.error(
					`[REMAP] Failed to process photo ${photo.name}:`,
					error
				);
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
				console.error(
					`[REMAP] Failed to process video ${video.name}:`,
					error
				);
				throw new Error(`Could not process video: ${video.name}`);
			}
		}

		// Add audio file
		if (memoryData.media.audio) {
			try {
				const response = await fetch(memoryData.media.audio.uri);
				const originalBlob = await response.blob();

				// Determine correct MIME type based on platform
				let mimeType = 'audio/m4a'; // Default for iOS
				if (Platform.OS === 'android') {
					mimeType = 'audio/mpeg4';
				} else if (Platform.OS === 'web') {
					mimeType = 'audio/webm';
				}

				const audioBlob = new Blob([originalBlob], { type: mimeType });
				formData.append('audio', audioBlob, 'audio_recording.m4a');
			} catch (error) {
				console.error('[REMAP] Failed to process audio:', error);
				throw new Error('Could not process audio recording');
			}
		}

		return formData;
	}

	/**
	 * Purpose: Main method for creating new memory pins
	 * Flow: useCreatePin.ts → createMemoryPin() → buildFormDataForBackend() → makeFormDataRequest() → backend
	 * Example: Called when user clicks "Save Memory" in createPin.tsx
	 */
	async createMemoryPin(
		memoryData: CreateMemoryRequest
	): Promise<{ success: boolean; data?: any; error?: string }> {
		try {
			console.log('[REMAP] Starting memory pin creation');

			// Build FormData for backend
			const formData = await this.buildFormDataForBackend(memoryData);

			// Make API call to backend
			const response = await this.makeFormDataRequest(
				'pins/user',
				'POST',
				formData
			);

			console.log('[REMAP] Memory created successfully:', response);
			// Return success response
			return {
				success: true,
				data: response,
			};
		} catch (error) {
			console.error('[REMAP] Memory creation failed:', error);
			// Return error response
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Unknown error occurred',
			};
		}
	}

	// ==================
	// LEGACY METHODS (for backward compatibility)
	// ==================

	/**
	 * Purpose: Get all social circles for the current user
	 * Flow: useCreatePin.ts → getCircles() → makeAuthRequest() → backend
	 * Example: Called when loading social circle selector in createPin.tsx
	 */
	async getCircles(): Promise<{ id: string; name: string }[]> {
		try {
			const response = await this.makeAuthRequest('circles', 'GET');
			return response.map((circle: any) => ({
				id: circle.id,
				name: circle.name,
			}));
		} catch (error) {
			console.error('[REMAP] Failed to fetch circles:', error);
			return [];
		}
	}

	// ==================
	// PIN FETCHING METHODS
	// ==================

	/**
	 * Purpose: Creates a viewport object from map region for pin fetching
	 * Used by: Map components to define the visible area for pin queries
	 */
	createViewportFromMapRegion(region: {
		latitude: number;
		longitude: number;
		latitudeDelta: number;
		longitudeDelta: number;
	}) {
		const halfLatDelta = region.latitudeDelta / 2;
		const halfLngDelta = region.longitudeDelta / 2;

		return {
			northEast: {
				latitude: region.latitude + halfLatDelta,
				longitude: region.longitude + halfLngDelta,
			},
			southWest: {
				latitude: region.latitude - halfLatDelta,
				longitude: region.longitude - halfLngDelta,
			},
		};
	}

	/**
	 * Purpose: Fetches all visible pins within a viewport
	 * Flow: Map component → fetchAllVisiblePins() → makeAuthRequest() → backend
	 * Example: Called when map region changes to load pins in view
	 */
	async fetchAllVisiblePins(viewport: {
		northEast: { latitude: number; longitude: number };
		southWest: { latitude: number; longitude: number };
	}): Promise<{ success: boolean; data?: MapPin[]; error?: string }> {
		try {
			// Use public endpoint to get all visible pins (not just user's pins)
			const response = await this.makeAuthRequest('pins', 'GET');

			// Backend returns { 'List pins': pins }, so extract the pins array
			const pins = response['List pins'] || [];

			// Filter pins within viewport
			const pinsInViewport = pins.filter((pin: any) => {
				return (
					pin.latitude >= viewport.southWest.latitude &&
					pin.latitude <= viewport.northEast.latitude &&
					pin.longitude >= viewport.southWest.longitude &&
					pin.longitude <= viewport.northEast.longitude
				);
			});

			return {
				success: true,
				data: pinsInViewport,
			};
		} catch (error) {
			console.error('[REMAP] Failed to fetch pins:', error);
			return {
				success: false,
				error: 'Failed to fetch pins',
			};
		}
=======
	async getCircles(): Promise<{ id: string; name: string }[]> {
		return await this.makeAuthRequest('circles', 'GET');
	}

	// ===================
	//   PIN CRUD METHODS
	// ===================

	// CREATE
	async createPin(pinData: FormData): Promise<any> {
		return await this.makeAuthRequest('pins/user', 'POST', pinData, true);
	}

	// READ
	async getUserPins(): Promise<any> {
		return await this.makeAuthRequest('pins/user', 'GET');
	}

	async getPublicPins(): Promise<any> {
		return await this.makeAuthRequest('pins', 'GET');
	}

	async getPin(pinId: string): Promise<any> {
		return await this.makeAuthRequest(`pins/user/${pinId}`, 'GET');
	}

	// UPDATE
	async updatePin(pinId: string, pinData: FormData): Promise<any> {
		return await this.makeAuthRequest(
			`pins/user/${pinId}`,
			'PUT',
			pinData,
			true
		);
	}

	// DELETE
	async deletePin(pinId: string): Promise<any> {
		return await this.makeAuthRequest(`pins/user/${pinId}`, 'DELETE');
	}

	// ===================
	//   PROFILE METHODS
	// ===================

	// UPDATE PROFILE (including avatar upload) (PUT request since it's just appending to the profile)
	async updateProfile(profileData: FormData): Promise<any> {
		const userId = await this.getUserId();

		if (!userId) {
			throw new Error('No user id found');
		}

		return await this.makeAuthRequest(
			`profiles/${userId}`,
			'PUT',
			profileData,
			true
		);
>>>>>>> 13d4256c699d9b048d56625de6074c3413f684c7
	}
}
