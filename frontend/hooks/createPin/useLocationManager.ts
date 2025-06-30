// ========================
//   REACT NATIVE IMPORTS
// ========================
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';

// ======================
//   TYPE DEFINITIONS
// ======================

type LocationManagerData = {
	searchQuery: string;
	currentCoordinates: { latitude: number; longitude: number } | null;
	displayAddress: string;
	isFromGPS: boolean;
};

interface LocationManagerHook {
	locationData: LocationManagerData;
	isLoadingGPS: boolean;
	isLoadingGeocode: boolean;
	fetchDeviceGPSLocation: () => Promise<void>;
	convertAddressToCoordinates: (address: string) => Promise<void>;
	convertCoordinatesToAddress: (coords: {
		latitude: number;
		longitude: number;
	}) => Promise<void>;
	updateLocationFromUserInput: (query: string) => void;
	updateLocationFromMapDrag: (coords: {
		latitude: number;
		longitude: number;
		address?: string;
	}) => void;
	resetLocationData: () => void;
	setCoordinatesDirectly: (coords: {
		latitude: number;
		longitude: number;
		address: string;
	}) => void;
}

// ======================
//   CUSTOM HOOK
// ======================

export const useLocationManager = (): LocationManagerHook => {
	// =========================
	// STATE MANAGEMENT:
	// =========================
	const [locationData, setLocationData] = useState<LocationManagerData>({
		searchQuery: '',
		currentCoordinates: null,
		displayAddress: '',
		isFromGPS: false,
	});

	const [isLoadingGPS, setIsLoadingGPS] = useState(false);
	const [isLoadingGeocode, setIsLoadingGeocode] = useState(false);

	// =========================
	// UPDATE FUNCTIONS:
	// =========================

	// Update function for dynamic field updates
	const updateLocationField = useCallback(
		<Field extends keyof LocationManagerData>(
			field: Field,
			value: LocationManagerData[Field]
		) => {
			setLocationData((prev) => ({
				...prev,
				[field]: value,
			}));
		},
		[]
	);

	const resetLocationData = useCallback(() => {
		setLocationData({
			searchQuery: '',
			currentCoordinates: null,
			displayAddress: '',
			isFromGPS: false,
		});
	}, [setLocationData]);

	// =========================
	// GPS LOCATION FUNCTIONS
	// =========================

	// Get current device location using GPS
	const fetchDeviceGPSLocation = useCallback(async () => {
		setIsLoadingGPS(true);

		try {
			const { status } =
				await Location.requestForegroundPermissionsAsync();

			if (status !== 'granted') {
				Alert.alert(
					'Location Permission Required',
					'Please enable location access in your device settings to use GPS location.'
				);
				return;
			}

			const location = await Location.getCurrentPositionAsync({
				accuracy: Location.Accuracy.High,
			});

			const coordinates = {
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
			};

			// Validate coordinates are within valid geographic ranges
			if (coordinates.latitude < -90 || coordinates.latitude > 90) {
				console.error(
					'Invalid latitude from GPS:',
					coordinates.latitude
				);
				Alert.alert(
					'Invalid GPS Coordinates',
					'Received invalid coordinates from GPS. Please try again or use manual location search.'
				);
				return;
			}
			if (coordinates.longitude < -180 || coordinates.longitude > 180) {
				console.error(
					'Invalid longitude from GPS:',
					coordinates.longitude
				);
				Alert.alert(
					'Invalid GPS Coordinates',
					'Received invalid coordinates from GPS. Please try again or use manual location search.'
				);
				return;
			}

			// Update location data
			updateLocationField('currentCoordinates', coordinates);
			updateLocationField('isFromGPS', true);

			// Get address from coordinates
			await convertCoordinatesToAddress(coordinates);
		} catch (error) {
			console.error('GPS location error:', error);
			Alert.alert(
				'GPS Error',
				'Could not get your current location. Please try again or use manual location search.'
			);
		} finally {
			setIsLoadingGPS(false);
		}
	}, [updateLocationField, convertCoordinatesToAddress]);

	// =========================
	// GEOCODING FUNCTIONS
	// =========================

	// Convert text address to coordinates (forward geocoding)
	const convertAddressToCoordinates = useCallback(
		async (address: string) => {
			if (!address || address.length < 3) return;

			setIsLoadingGeocode(true);

			try {
				// API call to get coordinates from address
				const response = await fetch(
					`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
						address + ', Melbourne, Australia'
					)}&limit=1`,
					{
						headers: {
							'User-Agent': 'ReMap/1.0 (remap.app)', // Policy compliance
						},
					}
				);

				const data = await response.json();

				// Extract coordinates from API response
				if (data && data.length > 0) {
					const location = data[0];
					const latitude = parseFloat(location.lat);
					const longitude = parseFloat(location.lon);

					// Validate coordinates are within valid geographic ranges
					if (latitude < -90 || latitude > 90) {
						console.error(
							'Invalid latitude from Nominatim:',
							latitude
						);
						return;
					}
					if (longitude < -180 || longitude > 180) {
						console.error(
							'Invalid longitude from Nominatim:',
							longitude
						);
						return;
					}

					const coordinates = {
						latitude,
						longitude,
					};

					// Update location data
					updateLocationField('searchQuery', address);
					updateLocationField('currentCoordinates', coordinates);
					updateLocationField(
						'displayAddress',
						location.display_name || address
					);
					updateLocationField('isFromGPS', false);
				}
			} catch (error) {
				console.error('Geocoding error:', error);
			} finally {
				setIsLoadingGeocode(false);
			}
		},
		[updateLocationField]
	);

	// (reverse geocoding)
	const convertCoordinatesToAddress = useCallback(
		async (coords: { latitude: number; longitude: number }) => {
			setIsLoadingGeocode(true);

			try {
				// API call to get address from coordinates
				const response = await fetch(
					`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`,
					{
						headers: {
							'User-Agent': 'ReMap/1.0 (remap.app)', // Policy compliance
						},
					}
				);

				const data = await response.json();

				// Extract address from API response
				if (data && data.display_name) {
					updateLocationField('displayAddress', data.display_name);
					updateLocationField('searchQuery', data.display_name);
				}
			} catch (error) {
				console.error('Reverse geocoding error:', error);
				// Fallback to coordinates as address
				updateLocationField(
					'displayAddress',
					`${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(
						6
					)}`
				);
				updateLocationField(
					'searchQuery',
					`${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(
						6
					)}`
				);
			} finally {
				setIsLoadingGeocode(false);
			}
		},
		[updateLocationField]
	);

	// =========================
	// USER INTERACTION FUNCTIONS
	// =========================

	const updateLocationFromUserInput = useCallback(
		(query: string) => {
			updateLocationField('searchQuery', query);
			// Note: Actual geocoding should be debounced and called separately
		},
		[updateLocationField]
	);

	const updateLocationFromMapDrag = useCallback(
		(coords: { latitude: number; longitude: number; address?: string }) => {
			updateLocationField('currentCoordinates', coords);
			updateLocationField('isFromGPS', false);

			if (coords.address) {
				updateLocationField('displayAddress', coords.address);
				updateLocationField('searchQuery', coords.address);
			} else {
				// If no address provided, use coordinates as fallback
				const coordinateString = `${coords.latitude.toFixed(
					6
				)}, ${coords.longitude.toFixed(6)}`;
				updateLocationField('displayAddress', coordinateString);
				updateLocationField('searchQuery', coordinateString);
			}
		},
		[updateLocationField]
	);

	const setCoordinatesDirectly = useCallback(
		(coords: { latitude: number; longitude: number; address: string }) => {
			updateLocationField('currentCoordinates', {
				latitude: coords.latitude,
				longitude: coords.longitude,
			});
			updateLocationField('displayAddress', coords.address);
			updateLocationField('searchQuery', coords.address);
			updateLocationField('isFromGPS', false);
		},
		[updateLocationField]
	);

	// =========================
	// RETURN INTERFACE:
	// =========================
	return {
		// State data
		locationData,
		isLoadingGPS,
		isLoadingGeocode,

		// Location fetching functions
		fetchDeviceGPSLocation,
		convertAddressToCoordinates,
		convertCoordinatesToAddress,

		// User interaction functions
		updateLocationFromUserInput,
		updateLocationFromMapDrag,

		// Utility functions
		resetLocationData,
		setCoordinatesDirectly,
	};
};
