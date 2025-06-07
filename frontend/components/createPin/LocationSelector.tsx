// ================
//   CORE IMPORTS
// ================
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

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
 * ```tsx
 * // In createPin.tsx:
 * const { locationQuery, setLocationQuery, handleCoordinateChange } = useMemoryContent();
 *
 * <LocationSelector
 *   value={locationQuery}                    // What user has typed
 *   onChange={setLocationQuery}              // Update hook when they type
 *   onCoordinateChange={handleCoordinateChange} // Update hook when they drag pin
 *   inputRef={locationInputRef}              // For focusing the field
 *   required={true}                          // Show red asterisk
 * />
 * ```
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
		console.log('📍 LocationSelector passing coordinates:', coords);
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
			<Input
				ref={inputRef}
				label="Search Location"
				placeholder={placeholder}
				value={value}
				onChangeText={onChange}
				onFocus={onFocus}
				onBlur={onBlur}
				style={styles.fullWidth}
				editable={!disabled}
			/>
			{/* ==================== */}
			{/*   MINI MAP           */}
			{/* ==================== */}
			<MiniMap
				locationQuery={value}
				onLocationChange={handleLocationChange}
				visible={showMap}
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
