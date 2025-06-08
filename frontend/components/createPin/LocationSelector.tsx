// ================
//   CORE IMPORTS
// ================
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

// ================================
//   INTERNAL 'UI' COMPONENTS
// ================================
import { Input } from '@/components/ui/TextInput';
import { LabelText, CaptionText } from '@/components/ui/Typography';

// ================================
//   INTERNAL 'CONSTANTS' IMPORTS
// ================================
import { ReMapColors } from '@/constants/Colors';

// ======================
//   COMPONENT IMPORTS
// ======================
import { MiniMap } from './MiniMap';
import { useCurrentLocation } from '@/hooks/createPin/useCurrentLocation';

// ===================
// TYPE DEFINITIONS
// ===================

/**
 * Props interface for LocationSelector component
 *
 * LAYMAN TERMS: "This is the contract defining what the LocationSelector needs
 * from the parent component (createPin.tsx) to work properly. It's like a
 * shopping list of required and optional items."
 *
 * TECHNICAL: Comprehensive props interface supporting text input, map integration,
 * validation feedback, and coordinate management with flexible customization options
 *
 * @interface LocationSelectorProps
 */
interface LocationSelectorProps {
	value: string;
	onChange: (value: string) => void;
	inputRef: React.RefObject<any>;
	onFocus?: () => void;
	onBlur?: () => void;
	label?: string;
	placeholder?: string;
	helperText?: string;
	required?: boolean;
	style?: any;
	disabled?: boolean;
	onCoordinateChange?: (coords: {
		latitude: number;
		longitude: number;
		address: string;
	}) => void;
}

/**
 *
 * LAYMAN TERMS: "This is the small blue button with a GPS pin icon that sits
 * next to the location search box. When users tap it, their phone asks for
 * location permission and then gets their exact current coordinates. The button
 * shows a loading spinner while working and gets disabled if there are errors."
 *
 * TECHNICAL: Presentational component providing GPS location trigger functionality
 * with comprehensive visual state management. Handles loading states, disabled
 * states, and error handling.
 *
 * @component GPSLocationButton
 * @since 1.0.0
 *
 * @param {Object} props - Component configuration object
 * @param {() => void} props.onPress - Callback function triggered when button is tapped
 * @param {boolean} props.isLoading - Whether GPS location request is in progress
 * @param {boolean} [props.disabled=false] - Whether button should be disabled (optional)
 *
 * @returns {JSX.Element} Rendered GPS button with dynamic styling and states
 *
 * @description
 * Visual states managed:
 * - **Normal**: Blue background, white GPS pin icon
 * - **Loading**: Gray background, spinning icon, button disabled
 * - **Disabled**: Faded appearance, non-interactive
 * - **Error**: Gracefully handles error states via parent component
 *
 * @example
 * Basic usage in LocationSelector:
 * <GPSLocationButton
 *   onPress={handleGPSLocation}        // Function to get current location
 *   isLoading={isGettingLocation}      // Boolean from useCurrentLocation hook
 *   disabled={false}                   // Always enabled unless form is disabled
 * />
 *
 * @example
 * State progression during GPS request:
 * Initial:  isLoading=false → Shows "📍" icon, blue background
 * Tap:      isLoading=true  → Shows "🔁" icon, gray background, disabled
 * Success:  isLoading=false → Returns to "📍" icon, blue background
 *
 * @example
 * Complete workflow integration:
 * // In LocationSelector component:
 * const { isGettingLocation, getCurrentLocation } = useCurrentLocation();
 *
 * const handleGPSLocation = async () => {
 *   const coords = await getCurrentLocation(); // ← isGettingLocation becomes true
 *   if (coords) {
 *     onChange(coords.address);                // ← Update input field
 *     setGpsCoordinates(coords);              // ← Update map
 *   }
 *   // ← isGettingLocation becomes false
 * };
 *
 * return (
 *   <GPSLocationButton
 *     onPress={handleGPSLocation}
 *     isLoading={isGettingLocation}     // ← Reflects GPS request state
 *   />
 * );
 *
 * @see {@link useCurrentLocation} for GPS functionality
 * @see {@link LocationSelector.handleGPSLocation} for integration handler
 * @see {@link styles.gpsButton} for styling definitions
 */
const GPSLocationButton = ({
	onPress,
	isLoading,
	disabled,
}: {
	onPress: () => void;
	isLoading: boolean;
	disabled?: boolean;
}) => (
	<TouchableOpacity
		style={[
			styles.gpsButton,
			...(isLoading ? [styles.gpsButtonLoading] : []),
			...(disabled ? [styles.gpsButtonDisabled] : []),
		]}
		onPress={onPress}
		disabled={isLoading || disabled}
	>
		<CaptionText
			style={[
				styles.gpsButtonText,
				...(isLoading ? [styles.gpsButtonTextLoading] : []),
			]}
		>
			{isLoading ? '🔁' : '📍'}
		</CaptionText>
	</TouchableOpacity>
);

// ==========================
// COMPONENT IMPLEMENTATION
// ==========================

/**
 * LocationSelector - Combined location input and mini-map component
 *
 * LAYMAN TERMS: "This component gives users a text field to search for locations
 * and shows a little map underneath when they start typing. Users can either
 * type a location name OR drag a pin on the map to set the exact spot. It's
 * like having Google Maps built into your form."
 *
 * Key user interactions:
 * 1. User types location → Map appears and shows that location
 * 2. User drags map pin → Updates coordinates and sends them back to parent
 * 3. Parent gets both the text they typed AND the exact GPS coordinates
 *
 * TECHNICAL: Composite component combining text input with integrated map functionality.
 * Manages local map visibility state while coordinating with parent component for
 * location data and coordinate management. Provides real-time geocoding feedback.
 *
 * @component LocationSelector
 * @param {LocationSelectorProps} props - Component configuration object
 * @returns {JSX.Element} Combined location input and map interface
 *
 * @example
 * In createPin.tsx:
 * const { locationQuery, setLocationQuery, handleCoordinateChange } = useMemoryContent();
 *
 * <LocationSelector
 *   value={locationQuery}                    // What user has typed
 *   onChange={setLocationQuery}              // Update hook when they type
 *   onCoordinateChange={handleCoordinateChange} // Update hook when they drag pin
 *   inputRef={locationInputRef}              // For focusing the field
 *   required={true}                          // Show red asterisk
 * />
 *
 * @see {@link useMemoryContent} for parent hook integration
 * @see {@link MiniMap} for map functionality details
 */
export function LocationSelector({
	value,
	onChange,
	inputRef,
	onFocus,
	onBlur,
	onCoordinateChange,
	label = 'Where are you?',
	placeholder = 'Search for a location...',
	helperText = "We'll pin your memory to this exact location",
	required = true,
	style,
	disabled = false,
}: LocationSelectorProps) {
	// ========================
	// LOCAL STATE MANAGEMENT
	// ========================
	const [showMap, setShowMap] = useState(false);
	const [coordinates, setCoordinates] = useState<{
		latitude: number;
		longitude: number;
		address: string;
	} | null>(null);
	const { isGettingLocation, getCurrentLocation } = useCurrentLocation();
	const [gpsCoordinates, setGpsCoordinates] = useState<{
		latitude: number;
		longitude: number;
	} | null>(null);

	// ================
	// EVENT HANDLERS
	// ================

	/**
	 * Handle coordinate updates from MiniMap component
	 *
	 * LAYMAN TERMS: "When the user drags the pin on the mini-map, this function
	 * saves the new coordinates locally (for showing to user) and passes them
	 * up to the parent component (for actual memory creation)"
	 *
	 * TECHNICAL: Coordinate change handler managing both local state for UI feedback
	 * and parent component integration via callback
	 *
	 * @function handleLocationChange
	 * @param {Object} coords - Coordinate object from MiniMap interaction
	 * @param {number} coords.latitude - GPS latitude value
	 * @param {number} coords.longitude - GPS longitude value
	 * @param {string} coords.address - Human-readable address string
	 *
	 * @example
	 * Called by MiniMap when user drags pin:
	 * handleLocationChange({
	 *   latitude: -37.8154,
	 *   longitude: 144.9636,
	 *   address: "Patricia Coffee Brewers, Melbourne"
	 * });
	 *
	 * Results in:
	 * 1. Local coordinates state updated (for coordinate display) [setCoordinates(coords)]
	 * 2. Parent component handleCoordinateChange called (for memory data) [onCoordinateChange?.(coords);]
	 * 3. Debug log for development tracking
	 */
	const handleLocationChange = (coords: {
		latitude: number;
		longitude: number;
		address: string;
	}) => {
		setCoordinates(coords);
		onCoordinateChange?.(coords);
	};

	/**
	 * GPS location acquisition and state coordination handler
	 *
	 * LAYMAN TERMS: "When someone taps the GPS button, this function coordinates
	 * all the moving parts: it gets their current location from the phone, updates
	 * the text input to show 'Current Location', tells the map to show their exact
	 * position, and passes the coordinates up to the parent component so they can
	 * be saved with the memory.
	 *
	 * TECHNICAL: Async event handler orchestrating GPS coordinate acquisition,
	 * local state management, parent component communication, and UI updates.
	 * Manages error states and provides comprehensive logging for debugging
	 * while maintaining separation of concerns between location services and UI.
	 *
	 * @async
	 * @function handleGPSLocation
	 * @since 1.0.0
	 *
	 * @description
	 * Primary responsibilities:
	 * 1. **Coordinate Acquisition**: Calls useCurrentLocation hook for GPS data
	 * 2. **Input Field Update**: Sets text field to "Current Location"
	 * 3. **Map Synchronization**: Provides coordinates to MiniMap component
	 * 4. **Parent Communication**: Passes coordinates to parent via callback
	 * 5. **Error Handling**: Manages failure cases gracefully
	 *
	 * @returns {Promise<void>} Resolves when GPS operation completes or fails
	 *
	 * @example
	 * Successful GPS workflow:
	 * ```
	 * User taps GPS button
	 *   ↓
	 * handleGPSLocation() called
	 *   ↓
	 * getCurrentLocation() → { lat: -37.986, lng: 145.062, address: "Current Location" }
	 *   ↓
	 * onChange("Current Location")        // Updates input field text
	 *   ↓
	 * setGpsCoordinates({...coords})     // Triggers MiniMap update
	 *   ↓
	 * handleLocationChange({...coords})   // Notifies parent component
	 *   ↓
	 * GPS location applied successfully  // Ready for memory creation
	 * ```
	 *
	 *
	 * @example
	 * Error handling workflow:
	 * ```
	 * User taps GPS button
	 *   ↓
	 * handleGPSLocation() called
	 *   ↓
	 * getCurrentLocation() → null (permission denied or GPS failed)
	 *   ↓
	 * Function exits early, no UI updates
	 *   ↓
	 * User sees error alert from useCurrentLocation hook
	 *   ↓
	 * User can manually type location or try GPS again
	 * ```
	 *
	 * @see {@link useCurrentLocation.getCurrentLocation} for GPS coordinate acquisition
	 * @see {@link useMemoryContent.handleCoordinateChange} for parent component integration
	 * @see {@link MiniMap} for coordinate visualization
	 */
	const handleGPSLocation = async () => {
		const currentLocation = await getCurrentLocation();

		if (currentLocation) {
			onChange(currentLocation.address);

			setGpsCoordinates({
				latitude: currentLocation.latitude,
				longitude: currentLocation.longitude,
			});

			handleLocationChange(currentLocation);
		} else {
			console.log('GPS location failed or was null');
		}
	};

	// ===============
	// SIDE EFFECTS
	// ===============

	/**
	 * Auto-show map when user starts typing
	 *
	 * LAYMAN TERMS: "Watch what the user types. When they've typed at least 3
	 * characters, show the mini-map. If they clear the field, hide the map."
	 *
	 * TECHNICAL: Effect managing map visibility based on input value length
	 * with debounced triggering at 3+ characters
	 */
	useEffect(() => {
		setShowMap(value.length > 2);
	}, [value]);

	useEffect(() => {
		if (value !== 'Current Location' && gpsCoordinates) {
			setGpsCoordinates(null);
		}
	}, [value, gpsCoordinates]);

	// =================
	// RENDER COMPONENT
	// =================

	/**
	 * LAYMAN TERMS: "Build the complete location selection interface"
	 *
	 * TECHNICAL: Render method combining input field, conditional map, helper text,
	 * and coordinate feedback in structured layout
	 */
	return (
		<View style={[styles.section, style]}>
			{/* ==================== */}
			{/*   FIELD LABEL        */}
			{/* ==================== */}
			<LabelText style={styles.sectionLabel}>
				{label}
				{required && <LabelText style={styles.required}> *</LabelText>}
			</LabelText>
			{/* ==================== */}
			{/*   TEXT INPUT FIELD   */}
			{/* ==================== */}
			<View style={styles.inputContainer}>
				<Input
					ref={inputRef}
					label="Search Location"
					placeholder={placeholder}
					value={value}
					onChangeText={onChange}
					onFocus={onFocus}
					onBlur={onBlur}
					style={styles.locationInput}
					editable={!disabled}
				/>
				<GPSLocationButton
					onPress={handleGPSLocation}
					isLoading={isGettingLocation}
					disabled={disabled}
				/>
			</View>
			{/* ==================== */}
			{/*   MINI MAP           */}
			{/* ==================== */}
			<MiniMap
				locationQuery={value}
				onLocationChange={handleLocationChange}
				visible={showMap}
				initialCoordinates={gpsCoordinates}
			/>
			{/* ==================== */}
			{/*   HELPER TEXT        */}
			{/* ==================== */}
			{helperText && (
				<CaptionText style={styles.helperText}>
					{helperText}
				</CaptionText>
			)}
			{/* ==================== */}
			{/*   COORDINATE DISPLAY */}
			{/* ==================== */}
			{coordinates && (
				<CaptionText style={styles.coordinateDisplay}>
					📍 Pin will be placed at: {coordinates.latitude.toFixed(4)},{' '}
					{coordinates.longitude.toFixed(4)}
				</CaptionText>
			)}
		</View>
	);
}

// ==================
// COMPONENT STYLES
// ==================

const styles = StyleSheet.create({
	section: {
		marginBottom: 24,
	},
	sectionLabel: {
		marginBottom: 12,
		fontSize: 16,
	},
	required: {
		color: ReMapColors.semantic.error,
	},
	fullWidth: {
		width: '100%',
	},
	helperText: {
		marginTop: 8,
		paddingHorizontal: 4,
	},
	coordinateDisplay: {
		marginTop: 6,
		padding: 6,
		backgroundColor: ReMapColors.ui.background,
		borderRadius: 4,
		color: ReMapColors.semantic.success,
		fontSize: 11,
	},

	// Location & Box Styling
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',

		gap: 8,
	},
	locationInput: {
		flex: 1,
	},
	gpsButton: {
		// backgroundColor: ReMapColors.primary.testing,
		borderRadius: 6,
		marginTop: 28,
		// padding: 12,
		height: 'auto',
		alignItems: 'flex-end',
		justifyContent: 'center',
	},
	gpsButtonLoading: {
		backgroundColor: ReMapColors.ui.textSecondary,
	},
	gpsButtonDisabled: {
		backgroundColor: ReMapColors.ui.border,
		opacity: 0.5,
	},
	gpsButtonText: {
		color: 'white',
		fontSize: 28,
		// fontWeight: '800',
		lineHeight: 32,
	},
	gpsButtonTextLoading: {
		color: ReMapColors.ui.textSecondary,
	},
});

// ================
// DEFAULT EXPORT
// ================
export default LocationSelector;

/**
 * LOCATIONSELCTOR ARCHITECTURE INSIGHTS
 * =====================================
 *
 * LAYMAN TERMS: "This component is like a smart location picker that gives
 * users two ways to set their location:
 * 1. Type it in (like searching Google Maps)
 * 2. Drag a pin on a map (for exact positioning)
 *
 * It talks to both the parent component (to save the location) and the
 * MiniMap child component (to show/update the map)."
 *
 *
 * DATA FLOW SUMMARY:
 * ==================
 * 1. User types → onChange → parent's setLocationQuery → value prop updates
 * 2. value.length > 2 → showMap becomes true → MiniMap appears
 * 3. MiniMap geocodes text → finds coordinates → shows pin on map
 * 4. User drags pin → handleLocationChange → coordinates update locally + sent to parent
 * 5. Parent receives coordinates via onCoordinateChange → useMemoryContent updates
 * 6. Component shows coordinate feedback to user for confirmation
 *
 */
