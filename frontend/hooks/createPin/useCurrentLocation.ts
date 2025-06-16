// ========================
//   REACT NATIVE IMPORTS
// ========================
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';

// ======================
//   TYPE DEFINITIONS
// ======================
type LocationCoordinates = {
	latitude: number;
	longitude: number;
	address: string;
};

type CurrentLocationData = {
	isGettingLocation: boolean;
	showMap: boolean;
	coordinates: LocationCoordinates | null;
	gpsCoordinates: { latitude: number; longitude: number } | null;
	searchValue: string;
};

// ================
//   CUSTOM HOOK
// ================
export const useCurrentLocation = () => {
	// Essentially an empty canvas for the search input
	const [locationData, setLocationData] = useState<CurrentLocationData>({
		isGettingLocation: false,
		showMap: false,
		coordinates: null,
		gpsCoordinates: null,
		searchValue: '',
	});

	// When search field is doing it's thing each 'key' is getting updated with this function
	const updateLocationField = <Field extends keyof CurrentLocationData>(
		field: Field,
		value: CurrentLocationData[Field]
	) => {
		setLocationData((prev) => ({
			...prev, // preserve existing values
			[field]: value,
		}));
	};

	//	Essentially allowing location services to be enabled and then passing it
	const fetchUserCurrentLocation =
		useCallback(async (): Promise<LocationCoordinates | null> => {
			updateLocationField('isGettingLocation', true);

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

				const location = await Location.getCurrentPositionAsync({
					accuracy: Location.Accuracy.Balanced,
				});

				const { latitude, longitude } = location.coords;
				console.log('Got GPS coordinates:', { latitude, longitude });

				const result: LocationCoordinates = {
					latitude,
					longitude,
					address: 'Current Location',
				};

				// Update hook state with GPS coordinates
				updateLocationField('gpsCoordinates', { latitude, longitude });
				updateLocationField('coordinates', result);
				updateLocationField('searchValue', result.address);

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
				updateLocationField('isGettingLocation', false);
			}
		}, []);

	const handleLocationSearchChange = useCallback(
		(searchText: string) => {
			updateLocationField('searchValue', searchText);

			updateLocationField('showMap', searchText.length >= 5);

			// ** Reset
			if (
				searchText !== 'Current Location' &&
				locationData.gpsCoordinates
			) {
				updateLocationField('gpsCoordinates', null);
			}
		},
		[locationData.gpsCoordinates]
	);

	const handleCoordinateSelection = useCallback(
		(coordinates: LocationCoordinates) => {
			updateLocationField('coordinates', coordinates);
		},
		[]
	);

	const clearLocationData = useCallback(() => {
		setLocationData({
			isGettingLocation: false,
			showMap: false,
			coordinates: null,
			gpsCoordinates: null,
			searchValue: '',
		});
	}, []);

	return {
		locationData,

		updateLocationField,

		fetchUserCurrentLocation,
		handleLocationSearchChange,
		handleCoordinateSelection,
		clearLocationData,
	};
};
