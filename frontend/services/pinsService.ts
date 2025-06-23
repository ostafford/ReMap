// =====================================
//   PINS SERVICE - BACKEND PIN FETCHING
// =====================================
// Purpose: API service for fetching pins from backend
// Replaces dummy pin data with real backend integration
import { getCurrentUser } from '@/services/auth';
import { supabase } from '@/lib/supabase';

// ==================
// TYPE DEFINITIONS
// ==================

// Backend pin structure (based on your controller)
export interface BackendPin {
	id: string;
	name: string;
	description: string;
	latitude: number;
	longitude: number;
	location_query: string;
	image_urls: string[];
	audio_url: string | null;
	owner_id: string;
	visibility: string;
	social_circle_ids: string[] | null;
	private_pin: boolean;
	created_at: string;
	updated_at: string;
}

// Frontend pin structure (what your map expects)
export interface MapPin {
	id: string;
	coordinate: {
		latitude: number;
		longitude: number;
	};
	title: string;
	description: string;
	// Additional data for bottom sheet
	pinData: {
		memory: {
			title: string;
			description: string;
			author: string;
			createdAt: string;
			media: {
				photos: Array<{ name: string; uri: string }>;
				videos: any[];
				audio: {
					recorded: string;
				} | null;
			};
			visibility: string[];
		};
		name: string;
		location: {
			address: string;
			latitude: number;
			longitude: number;
		};
	};
}

// Map viewport bounds for filtering
export interface MapViewport {
	northEast: {
		latitude: number;
		longitude: number;
	};
	southWest: {
		latitude: number;
		longitude: number;
	};
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
	: 'https://your-production-api.com';

const API_ENDPOINTS = {
	PUBLIC_PINS: '/api/pins',
	USER_PINS: '/api/pins/user',
	SINGLE_PIN: '/api/pins',
} as const;

// ==================
// AUTHENTICATION HELPER
// ==================

/**
 * Gets the JWT token for authenticated requests
 */
const getAuthToken = async (): Promise<string | null> => {
	try {
		const { user } = await getCurrentUser();
		if (!user) {
			return null; // Not authenticated, can still fetch public pins
		}

		const {
			data: { session },
			error,
		} = await supabase.auth.getSession();

		if (error || !session?.access_token) {
			console.warn(
				'⚠️ [PINS-SERVICE] Could not get auth token, fetching public pins only'
			);
			return null;
		}
		console.log(
			'🔑 [PINS-SERVICE] Using JWT token:',
			session.access_token.substring(0, 50) + '...'
		);
		return session.access_token;
	} catch (error) {
		console.warn(
			'⚠️ [PINS-SERVICE] Auth token failed, fetching public pins only'
		);
		return null;
	}
};

// ==================
// DATA TRANSFORMATION
// ==================

/**
 * Converts backend pin data to frontend map pin format
 */
const transformBackendPinToMapPin = (backendPin: BackendPin): MapPin => {
	return {
		id: backendPin.id,
		coordinate: {
			latitude: backendPin.latitude,
			longitude: backendPin.longitude,
		},
		title: backendPin.name,
		description: backendPin.description,
		pinData: {
			memory: {
				title: backendPin.name,
				description: backendPin.description,
				author: 'User', // TODO: Get actual username from backend
				createdAt: backendPin.created_at,
				media: {
					photos: backendPin.image_urls.map((url, index) => ({
						name: `photo_${index + 1}`,
						uri: url,
					})),
					videos: [], // TODO: Add video support when backend supports it
					audio: backendPin.audio_url
						? {
								recorded: backendPin.created_at,
						  }
						: null,
				},
				visibility: [backendPin.visibility],
			},
			name: backendPin.name,
			location: {
				address: backendPin.location_query,
				latitude: backendPin.latitude,
				longitude: backendPin.longitude,
			},
		},
	};
};

/**
 * Filters pins by map viewport bounds
 */
const filterPinsByViewport = (
	pins: MapPin[],
	viewport?: MapViewport
): MapPin[] => {
	if (!viewport) {
		return pins; // Return all pins if no viewport provided
	}

	const { northEast, southWest } = viewport;

	return pins.filter((pin) => {
		const { latitude, longitude } = pin.coordinate;

		return (
			latitude <= northEast.latitude &&
			latitude >= southWest.latitude &&
			longitude <= northEast.longitude &&
			longitude >= southWest.longitude
		);
	});
};

// ==================
// API FUNCTIONS
// ==================

/**
 * Fetches public pins from backend
 */
export const fetchPublicPins = async (
	viewport?: MapViewport
): Promise<ApiResponse> => {
	try {
		console.log('📡 [PINS-SERVICE] Fetching public pins');

		const response = await fetch(
			`${API_BASE_URL}${API_ENDPOINTS.PUBLIC_PINS}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);

		if (!response.ok) {
			const errorText = await response.text();
			console.error('❌ [PINS-SERVICE] Failed to fetch public pins:', {
				status: response.status,
				error: errorText,
			});

			throw new Error(
				`Failed to fetch pins (${response.status}): ${errorText}`
			);
		}

		const result = await response.json();
		console.log('✅ [PINS-SERVICE] Public pins response:', result);

		// Extract pins from response (your backend returns { "List pins": [...] })
		const backendPins: BackendPin[] = result['List pins'] || [];

		// Transform to frontend format
		const mapPins = backendPins.map(transformBackendPinToMapPin);

		// Filter by viewport if provided
		const filteredPins = filterPinsByViewport(mapPins, viewport);

		console.log(
			`📍 [PINS-SERVICE] Transformed ${backendPins.length} pins, ${filteredPins.length} in viewport`
		);

		return {
			success: true,
			data: filteredPins,
		};
	} catch (error) {
		console.error('💥 [PINS-SERVICE] Error fetching public pins:', error);

		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'Unknown error occurred',
		};
	}
};

/**
 * Fetches user's private pins (requires authentication)
 */
export const fetchUserPins = async (
	viewport?: MapViewport
): Promise<ApiResponse> => {
	try {
		console.log('📡 [PINS-SERVICE] Fetching user pins');

		const authToken = await getAuthToken();
		if (!authToken) {
			console.log('🔒 [PINS-SERVICE] No auth token, skipping user pins');
			return {
				success: true,
				data: [], // Return empty array if not authenticated
			};
		}

		const response = await fetch(
			`${API_BASE_URL}${API_ENDPOINTS.USER_PINS}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`,
				},
			}
		);

		if (!response.ok) {
			const errorText = await response.text();
			console.error('❌ [PINS-SERVICE] Failed to fetch user pins:', {
				status: response.status,
				error: errorText,
			});

			// Don't throw error for user pins - just return empty array
			return {
				success: true,
				data: [],
			};
		}

		const result = await response.json();
		console.log('✅ [PINS-SERVICE] User pins response:', result);

		// Extract pins from response (your backend returns { "List user pins": [...] })
		const backendPins: BackendPin[] = result['List user pins'] || [];

		// Transform to frontend format
		const mapPins = backendPins.map(transformBackendPinToMapPin);

		// Filter by viewport if provided
		const filteredPins = filterPinsByViewport(mapPins, viewport);

		console.log(
			`👤 [PINS-SERVICE] Transformed ${backendPins.length} user pins, ${filteredPins.length} in viewport`
		);

		return {
			success: true,
			data: filteredPins,
		};
	} catch (error) {
		console.error('💥 [PINS-SERVICE] Error fetching user pins:', error);

		// Don't fail the entire operation if user pins fail
		return {
			success: true,
			data: [],
		};
	}
};

/**
 * Fetches all visible pins (public + user's private)
 * TODO: Add social circle pins when backend supports it
 */
export const fetchAllVisiblePins = async (
	viewport?: MapViewport
): Promise<ApiResponse> => {
	try {
		console.log('📍 [PINS-SERVICE] Fetching all visible pins');

		// Fetch both public and user pins in parallel
		const [publicResult, userResult] = await Promise.all([
			fetchPublicPins(viewport),
			fetchUserPins(viewport),
		]);

		// Combine successful results
		const allPins: MapPin[] = [
			...(publicResult.success ? publicResult.data : []),
			...(userResult.success ? userResult.data : []),
		];

		// Remove duplicates (in case user's public pins appear in both)
		const uniquePins = allPins.filter(
			(pin, index, array) =>
				array.findIndex((p) => p.id === pin.id) === index
		);

		console.log(
			`🗺️ [PINS-SERVICE] Combined ${uniquePins.length} unique pins`
		);

		return {
			success: true,
			data: uniquePins,
		};
	} catch (error) {
		console.error('💥 [PINS-SERVICE] Error fetching all pins:', error);

		return {
			success: false,
			error:
				error instanceof Error ? error.message : 'Failed to fetch pins',
		};
	}
};

// ==================
// UTILITY FUNCTIONS
// ==================

/**
 * Creates a map viewport from current map region
 */
export const createViewportFromMapRegion = (region: {
	latitude: number;
	longitude: number;
	latitudeDelta: number;
	longitudeDelta: number;
}): MapViewport => {
	const { latitude, longitude, latitudeDelta, longitudeDelta } = region;

	return {
		northEast: {
			latitude: latitude + latitudeDelta / 2,
			longitude: longitude + longitudeDelta / 2,
		},
		southWest: {
			latitude: latitude - latitudeDelta / 2,
			longitude: longitude - longitudeDelta / 2,
		},
	};
};

// ==================
// EXPORTS
// ==================

export type { ApiResponse, MapViewport };
export {
	fetchPublicPins,
	fetchUserPins,
	fetchAllVisiblePins,
	createViewportFromMapRegion,
	transformBackendPinToMapPin,
};
