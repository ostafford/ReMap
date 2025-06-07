// ================
//   CORE IMPORTS
// ================
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

// =======================
//   THIRD-PARTY IMPORTS
// =======================
import MapView, { PROVIDER_GOOGLE, Marker, Region } from 'react-native-maps';

// ================================
//   INTERNAL 'UI' COMPONENTS
// ================================
import { CaptionText } from '@/components/ui/Typography';

// ================================
//   INTERNAL 'CONSTANTS' IMPORTS
// ================================
import { ReMapColors } from '@/constants/Colors';

// ==================
// TYPE DEFINITIONS
// ==================

/**
 * Props interface for MiniMap component
 *
 * LAYMAN TERMS: "This defines what the MiniMap needs from its parent
 * (LocationSelector) to work properly. It's like a contract saying
 * 'give me these things and I'll show you a working map'."
 *
 * TECHNICAL: Minimal props interface for embedded map functionality
 * with geocoding integration and coordinate callback system
 *
 * @interface MiniMapProps
 */
interface MiniMapProps {
	locationQuery: string;
	onLocationChange: (coordinates: {
		latitude: number;
		longitude: number;
		address: string;
	}) => void;
	visible: boolean;
	style?: any;
	initialCoordinates?: {
		latitude: number;
		longitude: number;
	} | null;
}

// ===========================
// COMPONENT IMPLEMENTATION
// ===========================

/**
 * MiniMap - Embedded geocoding map with draggable pin functionality
 *
 * LAYMAN TERMS: "This is a small interactive map that does two main things:
 * 1. When user types a location, it finds that place and shows it on the map
 * 2. When user drags the red pin, it captures the exact GPS coordinates
 *
 * It's like having a mini Google Maps built into your form that automatically
 * searches for places and lets users fine-tune the exact spot by dragging."
 *
 * Key features:
 * - Auto-geocoding (converts text to map location)
 * - Draggable pin for precise positioning
 * - Real-time coordinate display
 * - Debounced search (waits 1 second before searching)
 * - Melbourne-focused (adds ', Melbourne, Australia' to searches)
 *
 * TECHNICAL: React Native Maps component with integrated geocoding functionality.
 * Uses OpenStreetMap Nominatim API for geocoding with 1-second debouncing.
 * Manages map region, marker position, and coordinate callbacks with proper
 * error handling and loading states.
 *
 * @component MiniMap
 * @param {MiniMapProps} props - Component configuration object
 * @returns {JSX.Element | null} Interactive map component or null if not visible
 *
 * @example

 * In LocationSelector.tsx:
 * <MiniMap
 *   locationQuery="Melbourne CBD"              // What user typed
 *   onLocationChange={handleLocationChange}    // Callback for coordinates
 *   visible={showMap}                         // Show when user starts typing
 * />
 *
 * Results in:
 * 1. Map searches for "Melbourne CBD, Melbourne, Australia"
 * 2. Shows pin at found location
 * 3. User can drag pin to fine-tune
 * 4. Coordinates sent back via onLocationChange callback
 *
 * @see {@link LocationSelector} for parent component integration
 * @see {@link useMemoryContent} for coordinate storage and management
 */
export function MiniMap({
	locationQuery,
	onLocationChange,
	visible,
	style,
	initialCoordinates,
}: MiniMapProps) {
	// =========================
	// LOCAL STATE MANAGEMENT
	// =========================
	/**
	 * LAYMAN TERMS: "The current map view area (what part of the world we're looking at)"
	 *
	 * TECHNICAL: Map region state controlling viewport with Melbourne default center
	 */
	const [region, setRegion] = useState<Region>({
		latitude: -37.817979,
		longitude: 144.960408,
		latitudeDelta: 0.01,
		longitudeDelta: 0.01,
	});
	/**
	 * LAYMAN TERMS: "Where the red pin is currently positioned on the map"
	 *
	 * TECHNICAL: Marker coordinate state for draggable pin positioning
	 */
	const [markerCoordinate, setMarkerCoordinate] = useState({
		latitude: -37.817979,
		longitude: 144.960408,
	});
	/**
	 * LAYMAN TERMS: "Are we currently searching for the location the user typed?"
	 *
	 * TECHNICAL: Loading state for geocoding API calls with user feedback
	 */
	const [isGeocoding, setIsGeocoding] = useState(false);

	// =========================
	// GEOCODING FUNCTIONALITY
	// =========================

	/**
	 * Convert location text to GPS coordinates using geocoding API
	 *
	 * LAYMAN TERMS: "Take the text the user typed (like 'Melbourne CBD') and
	 * ask the internet 'where is that place?' to get the GPS numbers. Then
	 * move the map and pin to show that location."
	 *
	 * TECHNICAL: Async geocoding function using OpenStreetMap Nominatim API.
	 * Automatically appends ', Melbourne, Australia' to queries for local focus.
	 * Handles loading states, error recovery, and coordinate callbacks.
	 *
	 * @async
	 * @function geocodeLocation
	 * @param {string} query - User's location search text
	 *
	 * @example
	 * User types "Federation Square"
	 * geocodeLocation("Federation Square");
	 *
	 * API call: search for "Federation Square, Melbourne, Australia"
	 * Result: { lat: -37.8179, lon: 144.9690 }
	 * Map updates to show Federation Square with pin
	 * Parent gets callback with coordinates
	 *
	 */
	const geocodeLocation = async (query: string) => {
		if (!query || query.length < 3) return;
		setIsGeocoding(true);

		try {
			// LAYMAN TERMS: "Ask the internet where this location is"
			// TECHNICAL: OpenStreetMap Nominatim geocoding API with Melbourne bias
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
					query + ', Melbourne, Australia'
				)}&limit=1`
			);

			const data = await response.json();

			// "If we found a location, update the map!!"
			if (data && data.length > 0) {
				const location = data[0];
				const coordinates = {
					latitude: parseFloat(location.lat),
					longitude: parseFloat(location.lon),
				};

				setRegion({
					...coordinates,
					latitudeDelta: 0.01,
					longitudeDelta: 0.01,
				});

				setMarkerCoordinate(coordinates);

				onLocationChange({
					...coordinates,
					address: location.display_name || query,
				});
			}
		} catch (error) {
			console.error('Geocoding error:', error);
		} finally {
			setIsGeocoding(false);
		}
	};

	// ==========================
	// DEBOUNCED SEARCH EFFECT
	// ==========================

	/**
	 * Debounced geocoding trigger based on location query changes
	 *
	 * LAYMAN TERMS: "Watch what the user types. Wait 1 second after they
	 * stop typing, then search for that location. This prevents searching
	 * on every single letter they type (which would be wasteful and slow)."
	 *
	 * TECHNICAL: Effect with cleanup-based debouncing for geocoding API calls.
	 * 1-second delay prevents excessive API requests during typing.
	 */
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			geocodeLocation(locationQuery);
		}, 1000);

		return () => clearTimeout(timeoutId);
	}, [locationQuery]);

	/**
	 *
	 * LAYMAN TERMS: "When LocationSelector tells MiniMap 'here are the GPS coordinates',
	 * this effect immediately updates the map view to show that exact location. It moves
	 * the map camera and places the red pin at the GPS coordinates without making any
	 * internet requests or triggering callbacks that could cause infinite loops."
	 *
	 * TECHNICAL: React effect managing direct coordinate injection for GPS functionality.
	 * Handles map region updates and marker positioning while avoiding callback loops
	 * that could violate Nominatim API rate limits. Designed for one-way data flow
	 * from GPS source to map display.
	 *
	 * @description
	 * This effect is triggered when:
	 * - User taps GPS button in LocationSelector
	 * - initialCoordinates prop receives new GPS data
	 * - Component needs to display user's current location
	 *
	 * @example
	 * Typical GPS workflow:
	 * 1. User taps GPS button → LocationSelector gets coordinates
	 * 2. LocationSelector sets gpsCoordinates state
	 * 3. LocationSelector passes coordinates via initialCoordinates prop
	 * 4. THIS EFFECT triggers → updates map region and marker
	 * 5. User sees map centered on their exact location
	 *
	 * @example
	 * Coordinate transformation:
	 * Input: initialCoordinates = { latitude: -37.986, longitude: 145.062 }
	 * Effect processes:
	 * setRegion({
	 *   latitude: -37.986,
	 *   longitude: 145.062,
	 *   latitudeDelta: 0.01,  // ← Zoom level (smaller = more zoomed in)
	 *   longitudeDelta: 0.01  // ← Zoom level
	 * });
	 *
	 *
	 * @see {@link LocationSelector.handleGPSLocation} for GPS coordinate source
	 * @see {@link useCurrentLocation} for GPS coordinate acquisition
	 */
	useEffect(() => {
		if (initialCoordinates) {
			const coordinates = {
				latitude: initialCoordinates.latitude,
				longitude: initialCoordinates.longitude,
			};

			setRegion({
				...coordinates,
				latitudeDelta: 0.01,
				longitudeDelta: 0.01,
			});

			setMarkerCoordinate(coordinates);
		}
	}, [initialCoordinates]);

	// ===================
	// PIN DRAG HANDLER
	// ===================

	/**
	 * Handle user dragging the map pin to new coordinates
	 *
	 * LAYMAN TERMS: "When user drags the red pin to a new spot, capture
	 * those exact GPS coordinates and send them back to the parent component.
	 * Since we don't know the address of arbitrary coordinates, just show
	 * the GPS numbers as the address."
	 *
	 * TECHNICAL: Marker drag event handler extracting coordinates from map
	 * interaction and updating both local state and parent component via callback
	 *
	 * @function handleMarkerDragEnd
	 * @param {any} event - React Native Maps drag event object
	 *
	 * @example
	 * User drags pin to new location
	 * event.nativeEvent.coordinate = { latitude: -37.8200, longitude: 144.9650 }
	 *
	 * handleMarkerDragEnd(event);
	 *
	 * Results in:
	 * 1. Pin visually moves to new position
	 * 2. Coordinate display updates to show new GPS numbers
	 * 3. Parent component receives new coordinates via callback
	 */
	const handleMarkerDragEnd = (event: any) => {
		const coordinates = event.nativeEvent.coordinate;

		setMarkerCoordinate(coordinates);
		onLocationChange({
			...coordinates,
			address: `${coordinates.latitude.toFixed(
				6
			)}, ${coordinates.longitude.toFixed(6)}`,
		});
	};

	if (!visible) return null;

	// ==================
	// RENDER COMPONENT
	// ==================

	/**
	 * LAYMAN TERMS: "Build the complete mini-map interface"
	 *
	 * TECHNICAL: Render method combining header info, interactive map, and coordinate footer
	 */
	return (
		<View style={[styles.container, style]}>
			{/* ==================== */}
			{/*     MAP HEADER       */}
			{/* ==================== */}
			<View style={styles.header}>
				<CaptionText style={styles.title}>
					📍 Pin Location {isGeocoding && '(Searching...)'}
				</CaptionText>
				<CaptionText style={styles.instruction}>
					Drag the red pin to set exact location
				</CaptionText>
			</View>
			{/* ==================== */}
			{/*   INTERACTIVE MAP    */}
			{/* ==================== */}
			<MapView
				style={styles.map}
				provider={PROVIDER_GOOGLE}
				region={region}
				onRegionChangeComplete={setRegion}
				mapType="standard"
				showsUserLocation={false}
				showsMyLocationButton={false}
			>
				{/* Draggable red pin for location selection */}
				<Marker
					coordinate={markerCoordinate}
					draggable
					onDragEnd={handleMarkerDragEnd}
					title="Memory Pin"
					description="Drag to adjust"
					pinColor="red"
				/>
			</MapView>
			{/* ==================== */}
			{/*   COORDINATE FOOTER  */}
			{/* ==================== */}
			<View style={styles.footer}>
				<CaptionText style={styles.coordinates}>
					Lat: {markerCoordinate.latitude.toFixed(6)}, Lng:{' '}
					{markerCoordinate.longitude.toFixed(6)}
				</CaptionText>
			</View>
		</View>
	);
}

// ===================
// COMPONENT STYLES
// ===================

const styles = StyleSheet.create({
	container: {
		backgroundColor: ReMapColors.ui.cardBackground,
		borderRadius: 8,
		overflow: 'hidden',
		marginTop: 8,
		borderWidth: 1,
		borderColor: ReMapColors.ui.border,
	},
	header: {
		padding: 8,
		backgroundColor: ReMapColors.ui.background,
	},
	title: {
		fontWeight: '500',
		color: ReMapColors.primary.blue,
		fontSize: 12,
		marginBottom: 2,
	},
	instruction: {
		color: ReMapColors.ui.textSecondary,
		fontSize: 10,
	},
	map: {
		height: 200,
		width: '100%',
	},
	footer: {
		padding: 6,
		backgroundColor: ReMapColors.ui.background,
	},
	coordinates: {
		textAlign: 'center',
		color: ReMapColors.ui.textSecondary,
		fontSize: 9,
		fontFamily: 'monospace',
	},
});

export default MiniMap;
