// ========================
//   REACT NATIVE IMPORTS
// ========================
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';

// ======================
//   TYPE DEFINITIONS
// ======================
interface CurrentLocationHook {
	isGettingLocation: boolean;
	getCurrentLocation: () => Promise<{
		latitude: number;
		longitude: number;
		address: string;
	} | null>;
}

/**
 * Custom hook for managing current location functionality with permissions
 *
 * LAYMAN TERMS: "This hook is like a GPS assistant for your app. When called,
 * it politely asks the user for permission to access their location, then uses
 * the phone's GPS to find out exactly where they are right now. It handles all
 * the complicated permission stuff and gives you back simple coordinates you
 * can use. If anything goes wrong, it shows helpful error messages to the user."
 *
 * TECHNICAL: Custom React hook encapsulating GPS coordinate acquisition with
 * comprehensive permission management, error handling, and state tracking.
 * Designed to be Nominatim API compliant by avoiding reverse geocoding and
 * providing pure coordinate data for client-side usage.
 *
 * @hook useCurrentLocation
 * @since 1.0.0
 *
 * @returns {CurrentLocationHook} Object containing location state and methods
 * @returns {boolean} returns.isGettingLocation - Loading state for GPS request
 * @returns {Function} returns.getCurrentLocation - Async function to get GPS coordinates
 *
 * @description
 * Hook capabilities:
 * - **Permission Management**: Requests and handles location permissions
 * - **GPS Acquisition**: Gets current coordinates using device location services
 * - **Error Handling**: User-friendly alerts for permission denials and GPS failures
 * - **Loading States**: Tracks operation progress for UI feedback
 * - **No API Calls**: Compliant with Nominatim usage policies
 *
 * @example
 * Basic hook usage in component:
 * function LocationSelector() {
 *   const { isGettingLocation, getCurrentLocation } = useCurrentLocation();
 *
 *   const handleGPSPress = async () => {
 *     const coords = await getCurrentLocation();
 *     if (coords) {
 *       console.log(`User is at: ${coords.latitude}, ${coords.longitude}`);
 *       // coords.address will be "Current Location"
 *     }
 *   };
 *
 *   return (
 *     <GPSButton
 *       onPress={handleGPSPress}
 *       isLoading={isGettingLocation}  // Shows spinner while getting location
 *     />
 *   );
 * }
 *
 *
 * @example
 * GPS accuracy configuration:
 * Using Location.Accuracy.Balanced for optimal performance:
 * await Location.getCurrentPositionAsync({
 *   accuracy: Location.Accuracy.Balanced,  // Good accuracy, reasonable battery usage
 * });
 *
 * Alternative accuracy levels:
 * Location.Accuracy.Lowest     - Fastest, least accurate
 * Location.Accuracy.Low        - Fast, moderate accuracy
 * Location.Accuracy.Balanced   - Good balance (RECOMMENDED)
 * Location.Accuracy.High       - More accurate, slower
 * Location.Accuracy.Highest    - Most accurate, slowest
 *
 *
 * @see {@link https://docs.expo.dev/versions/latest/sdk/location/} Expo Location Documentation
 * @see {@link GPSLocationButton} for UI component integration
 * @see {@link LocationSelector.handleGPSLocation} for usage example
 */
export const useCurrentLocation = (): CurrentLocationHook => {
	const [isGettingLocation, setIsGettingLocation] = useState(false);

	/**
	 * Get user's current GPS coordinates without any geocoding
	 *
	 * LAYMAN TERMS: "Ask the phone 'where am I right now?' and just use
	 * those GPS coordinates directly. No need to ask the internet for
	 * address conversion - keep it simple and fast."
	 *
	 * TECHNICAL: Async function handling location permissions and GPS acquisition
	 * without any geocoding API calls to respect Nominatim usage policies
	 *
	 * @async
	 * @method getCurrentLocation
	 * @returns {Promise<{latitude: number, longitude: number, address: string} | null>}
	 *   GPS coordinates with simple address label, or null if failed
	 *
	 * @throws {Error} Catches and handles all location-related errors internally
	 */
	const getCurrentLocation = useCallback(async () => {
		setIsGettingLocation(true);

		try {
			const { status } =
				await Location.requestForegroundPermissionsAsync();

			if (status !== 'granted') {
				Alert.alert(
					'Location Permission Required',
					'Please enable location access to use your current location',
					[{ text: 'OK' }]
				);
				return null;
			}

			console.log();
			const location = await Location.getCurrentPositionAsync({
				accuracy: Location.Accuracy.Balanced,
			});

			const { latitude, longitude } = location.coords;
			console.log('Got GPS coordinates:', { latitude, longitude });

			const result = {
				latitude,
				longitude,
				address: 'Current Location',
			};

			console.log('Returning GPS result:', result);
			return result;
		} catch (error) {
			console.error('Current location error:', error);
			Alert.alert(
				'Location Error',
				'Could not get your current location. Please try again or enter manually.',
				[{ text: 'OK' }]
			);
			return null;
		} finally {
			setIsGettingLocation(false);
		}
	}, []);

	return {
		isGettingLocation,
		getCurrentLocation,
	};
};
