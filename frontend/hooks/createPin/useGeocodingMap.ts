// ========================
//   REACT NATIVE IMPORTS
// ========================
import { useState, useCallback, useEffect, useRef } from 'react';
import { Region } from 'react-native-maps';

// ======================
//   TYPE DEFINITIONS
// ======================

type MapCoordinates = {
	latitude: number;
	longitude: number;
};

type GeocodingResult = {
	latitude: number;
	longitude: number;
	address: string;
	displayName: string;
};

type GeocodingMapData = {
	region: Region;
	markerCoordinate: MapCoordinates;
	isGeocoding: boolean;
	isVisible: boolean;
	lastSearchQuery: string;
	cachedResults: Map<string, GeocodingResult>;
};

type NominatimResponse = {
	lat: string;
	lon: string;
	display_name: string;
	address?: {
		city?: string;
		suburb?: string;
		road?: string;
		house_number?: string;
	};
};

// ================
//   CUSTOM HOOK
// ================
export const useGeocodingMap = () => {
	const [mapData, setMapData] = useState<GeocodingMapData>({
		region: {
			latitude: -37.817979, // Melbourne default
			longitude: 144.960408, // Melbourne default
			latitudeDelta: 0.01,
			longitudeDelta: 0.01,
		},
		markerCoordinate: {
			latitude: -37.817979,
			longitude: 144.960408,
		},
		isGeocoding: false,
		isVisible: false,
		lastSearchQuery: '',
		cachedResults: new Map(),
	});

	// **RULES**: API Rate limiting refs (Nominatim requires max 1 request per second)
	const lastRequestTime = useRef<number>(0);
	const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const updateMapField = <Field extends keyof GeocodingMapData>(
		field: Field,
		value: GeocodingMapData[Field]
	) => {
		setMapData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const checkRateLimit = useCallback((): boolean => {
		const now = Date.now();
		const timeSinceLastRequest = now - lastRequestTime.current;

		if (timeSinceLastRequest < 3000) {
			console.log('Rate limit: waiting for next request window');
			return false;
		}
		return true;
	}, []);

	const getCachedResult = useCallback(
		(query: string): GeocodingResult | null => {
			const cached = mapData.cachedResults.get(
				query.toLowerCase().trim()
			);
			if (cached) {
				console.log('Using cached geocoding result for:', query);
				return cached;
			}
			return null;
		},
		[mapData.cachedResults]
	);

	const setCachedResult = useCallback(
		(query: string, result: GeocodingResult) => {
			const newCache = new Map(mapData.cachedResults);
			newCache.set(query.toLowerCase().trim(), result);
			updateMapField('cachedResults', newCache);
		},
		[mapData.cachedResults]
	);

	// 8. BUSINESS LOGIC FUNCTIONS: Geocoding operations

	const performGeocodingAPICall = useCallback(
		async (searchQuery: string): Promise<GeocodingResult | null> => {
			if (!checkRateLimit()) {
				return null;
			}

			try {
				lastRequestTime.current = Date.now();

				// Nominatim API call with proper User-Agent and Melbourne bias
				const response = await fetch(
					`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
						searchQuery + ', Melbourne, Australia'
					)}&limit=1&addressdetails=1`,
					{
						headers: {
							'User-Agent':
								'ReMapApp/1.0.0 (memory-mapping-app; contact@remap.app)', // Required by Nominatim
						},
					}
				);

				if (!response.ok) {
					throw new Error(`Geocoding API error: ${response.status}`);
				}

				const data: NominatimResponse[] = await response.json();

				if (data && data.length > 0) {
					const location = data[0];
					const result: GeocodingResult = {
						latitude: parseFloat(location.lat),
						longitude: parseFloat(location.lon),
						address: location.display_name || searchQuery,
						displayName: location.display_name || searchQuery,
					};

					// Cache the result for future use (required by Nominatim policy) [Client side rendering]
					setCachedResult(searchQuery, result);

					console.log('Geocoding API success:', result);
					return result;
				}

				return null;
			} catch (error) {
				console.error('Geocoding API error:', error);
				return null;
			}
		},
		[checkRateLimit, setCachedResult]
	);

	const searchLocationWithGeocoding = useCallback(
		async (searchQuery: string): Promise<void> => {
			if (!searchQuery || searchQuery.length < 5) {
				return;
			}

			// Check cache first (API RULE)
			const cachedResult = getCachedResult(searchQuery);
			if (cachedResult) {
				updateMapField('region', {
					latitude: cachedResult.latitude,
					longitude: cachedResult.longitude,
					latitudeDelta: 0.01,
					longitudeDelta: 0.01,
				});
				updateMapField('markerCoordinate', {
					latitude: cachedResult.latitude,
					longitude: cachedResult.longitude,
				});
				return;
			}

			updateMapField('isGeocoding', true);
			updateMapField('lastSearchQuery', searchQuery);

			const result = await performGeocodingAPICall(searchQuery);

			if (result) {
				// Animation Centering
				centerMapOnCoordinates({
					latitude: result.latitude,
					longitude: result.longitude,
				});
			}

			updateMapField('isGeocoding', false);
		},
		[getCachedResult, performGeocodingAPICall]
	);

	const handleLocationSearchWithDebounce = useCallback(
		(searchQuery: string) => {
			// Clear existing timer
			if (debounceTimer.current) {
				clearTimeout(debounceTimer.current);
			}

			// Set new timer for 3 seconds (safer than 1 second for API compliance)
			debounceTimer.current = setTimeout(() => {
				searchLocationWithGeocoding(searchQuery);
			}, 3000);
		},
		[searchLocationWithGeocoding]
	);

	const handleMarkerDragComplete = useCallback(
		(coordinates: MapCoordinates): GeocodingResult => {
			updateMapField('markerCoordinate', coordinates);

			const result: GeocodingResult = {
				latitude: coordinates.latitude,
				longitude: coordinates.longitude,
				address: `${coordinates.latitude.toFixed(
					6
				)}, ${coordinates.longitude.toFixed(6)}`,
				displayName: `Manual Pin: ${coordinates.latitude.toFixed(
					6
				)}, ${coordinates.longitude.toFixed(6)}`,
			};

			return result;
		},
		[]
	);

	const handleRegionChange = useCallback((newRegion: Region) => {
		updateMapField('region', newRegion);
	}, []);

	const setMapVisibility = useCallback((isVisible: boolean) => {
		updateMapField('isVisible', isVisible);
	}, []);

	const centerMapOnCoordinates = useCallback(
		(coordinates: MapCoordinates) => {
			updateMapField('region', {
				latitude: coordinates.latitude,
				longitude: coordinates.longitude,
				latitudeDelta: 0.01,
				longitudeDelta: 0.01,
			});
			updateMapField('markerCoordinate', coordinates);
		},
		[]
	);

	const clearMapData = useCallback(() => {
		if (debounceTimer.current) {
			clearTimeout(debounceTimer.current);
		}

		setMapData({
			region: {
				latitude: -37.817979,
				longitude: 144.960408,
				latitudeDelta: 0.01,
				longitudeDelta: 0.01,
			},
			markerCoordinate: {
				latitude: -37.817979,
				longitude: 144.960408,
			},
			isGeocoding: false,
			isVisible: false,
			lastSearchQuery: '',
			cachedResults: new Map(),
		});
	}, []);

	useEffect(() => {
		return () => {
			if (debounceTimer.current) {
				clearTimeout(debounceTimer.current);
			}
		};
	}, []);

	return {
		mapData,

		updateMapField,

		handleLocationSearchWithDebounce,
		handleMarkerDragComplete,
		handleRegionChange,
		setMapVisibility,
		centerMapOnCoordinates,
		clearMapData,

		getCachedResult,
	};
};
