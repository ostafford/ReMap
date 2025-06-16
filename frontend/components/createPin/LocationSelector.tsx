// ================
//   CORE IMPORTS
// ================
import React from 'react';
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

type LocationSelectorProps = {
	inputRef: React.RefObject<any>;
	onFocus?: () => void;
	onBlur?: () => void;
	onCoordinateChange?: (coords: {
		latitude: number;
		longitude: number;
		address: string;
	}) => void;
	label?: string;
	placeholder?: string;
	helperText?: string;
	required?: boolean;
	style?: any;
	disabled?: boolean;
};

// ===============================
//	UI COMPONENT: GPS BUTTON
// ===============================
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

export function LocationSelector({
	inputRef,
	onFocus,
	onBlur,
	onCoordinateChange,
	label = 'Where are you?',
	placeholder = 'Search for a location...',
	// helperText = "We'll pin your memory to this exact location",
	required = true,
	style,
	disabled = false,
}: LocationSelectorProps) {
	// ====================
	// 	HOOK CONSUMPTION
	// ====================
	const {
		locationData,
		fetchUserCurrentLocation,
		handleLocationSearchChange,
		handleCoordinateSelection,
	} = useCurrentLocation();

	// ================
	// EVENT HANDLERS: UI interaction functions
	// ================

	const handleGPSButtonPress = async () => {
		const currentLocation = await fetchUserCurrentLocation();

		if (currentLocation && onCoordinateChange) {
			onCoordinateChange(currentLocation);
		}
	};

	const handleLocationChange = (coords: {
		latitude: number;
		longitude: number;
		address: string;
	}) => {
		handleCoordinateSelection(coords);
		onCoordinateChange?.(coords);
	};

	const handleSearchTextChange = (text: string) => {
		handleLocationSearchChange(text);
	};

	// =================
	// RENDER COMPONENT
	// =================

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
					value={locationData.searchValue}
					onChangeText={handleSearchTextChange}
					onFocus={onFocus}
					onBlur={onBlur}
					style={styles.locationInput}
					editable={!disabled}
				/>
				<GPSLocationButton
					onPress={handleGPSButtonPress}
					isLoading={locationData.isGettingLocation}
					disabled={disabled}
				/>
			</View>

			{/* ==================== */}
			{/*   MINI MAP           */}
			{/* ==================== */}
			<MiniMap
				locationQuery={locationData.searchValue}
				onLocationChange={handleLocationChange}
				visible={locationData.showMap}
				initialCoordinates={locationData.gpsCoordinates}
			/>

			{/*  Commented the below section out as we may not need it but kept it to revise   */}

			{/* ==================== */}
			{/*   HELPER TEXT        */}
			{/* ==================== */}
			{/* {helperText && (
				<CaptionText style={styles.helperText}>
					{helperText}
				</CaptionText>
			)} */}

			{/* ==================== */}
			{/*   COORDINATE DISPLAY */}
			{/* ==================== */}
			{/* {locationData.coordinates && (
				<CaptionText style={styles.coordinateDisplay}>
					📍 Pin will be placed at:{' '}
					{locationData.coordinates.latitude.toFixed(4)},{' '}
					{locationData.coordinates.longitude.toFixed(4)}
				</CaptionText>
			)} */}
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
		borderRadius: 6,
		marginTop: 28,
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
