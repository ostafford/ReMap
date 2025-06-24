// ================
//   CORE IMPORTS
// ================
import React, { useEffect } from 'react';
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
import { MiniMapDisplay } from './MiniMapDisplay';
import { useLocationManager } from '@/hooks/createPin/useLocationManager';

// ===================
// TYPE DEFINITIONS
// ===================

interface LocationSelectorProps {
	// Props for connecting to parent form (useMemoryContent)
	value: string;
	onChange: (value: string) => void;
	onCoordinateChange?: (coords: {
		latitude: number;
		longitude: number;
		address: string;
	}) => void;

	// Form control props
	inputRef: React.RefObject<any>;
	onFocus?: () => void;
	onBlur?: () => void;

	// Display customization
	label?: string;
	placeholder?: string;
	helperText?: string;
	required?: boolean;
	style?: any;
	disabled?: boolean;

	// Prefilled props
	prefilledCoordinates?: {
		latitude: number;
		longitude: number;
		address: string;
	};
}

// ================================
// GPS BUTTON SUB-COMPONENT
// ================================
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
	prefilledCoordinates,
}: LocationSelectorProps) {
	// ========================
	// LOCATION LOGIC HOOK
	// ========================
	const {
		locationData,
		isLoadingGPS,
		isLoadingGeocode,
		fetchDeviceGPSLocation,
		convertAddressToCoordinates,
		updateLocationFromUserInput,
		updateLocationFromMapDrag,
		setCoordinatesDirectly,
	} = useLocationManager();

	// ================
	// EVENT HANDLERS
	// ================

	const handleSearchInputChange = (searchText: string) => {
		onChange(searchText);
		updateLocationFromUserInput(searchText);
	};

	// Handle GPS button press
	const handleGPSButtonPress = async () => {
		await fetchDeviceGPSLocation();
	};

	const handleMapPinDrag = (coords: {
		latitude: number;
		longitude: number;
	}) => {
		updateLocationFromMapDrag(coords);
	};

	// ===============
	// SIDE EFFECTS
	// ===============

	// Debounced search: Wait 3 seconds after user stops typing before geocoding
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			if (
				locationData.searchQuery.length > 2 &&
				!locationData.isFromGPS
			) {
				convertAddressToCoordinates(locationData.searchQuery);
			}
		}, 3000); // API policy compliance

		return () => clearTimeout(timeoutId);
	}, [
		locationData.searchQuery,
		locationData.isFromGPS,
		convertAddressToCoordinates,
	]);

	// Sync location data back to parent when coordinates change
	useEffect(() => {
		if (locationData.currentCoordinates && locationData.displayAddress) {
			const coordinateData = {
				latitude: locationData.currentCoordinates.latitude,
				longitude: locationData.currentCoordinates.longitude,
				address: locationData.displayAddress,
			};
			onCoordinateChange?.(coordinateData);
		}
	}, [
		locationData.currentCoordinates,
		locationData.displayAddress,
		onCoordinateChange,
	]);

	// Sync GPS results to search input (Converting long & lat to text)
	useEffect(() => {
		if (locationData.isFromGPS && locationData.displayAddress) {
			onChange(locationData.displayAddress);
		}
	}, [locationData.isFromGPS, locationData.displayAddress, onChange]);

	// Handle prefilled coordinates from parent
	useEffect(() => {
		if (prefilledCoordinates) {
			console.log(
				'📍 [LOCATION-SELECTOR] Received prefilled coordinates:',
				prefilledCoordinates
			);
			setCoordinatesDirectly(prefilledCoordinates);
		}
	}, [prefilledCoordinates?.latitude, prefilledCoordinates?.longitude]);

	// ==================
	// COMPUTED VALUES
	// ==================

	// Show map when user has typed enough characters or has coordinates
	const shouldShowMap =
		value.length > 2 || locationData.currentCoordinates !== null;

	const isAnyLoading = isLoadingGPS || isLoadingGeocode;

	// =================
	// RENDER COMPONENT
	// =================

	return (
		<View style={[styles.locationSection, style]}>
			{/* ==================== */}
			{/*   FIELD LABEL        */}
			{/* ==================== */}
			<LabelText style={styles.sectionLabel}>
				{label}
				{required && (
					<LabelText style={styles.requiredIndicator}> *</LabelText>
				)}
			</LabelText>

			{/* ==================== */}
			{/*   SEARCH INPUT ROW   */}
			{/* ==================== */}
			<View style={styles.searchInputContainer}>
				<Input
					ref={inputRef}
					label="Search Location"
					placeholder={placeholder}
					value={value}
					onChangeText={handleSearchInputChange}
					onFocus={onFocus}
					onBlur={onBlur}
					style={styles.searchInput}
					editable={!disabled}
				/>
				<GPSLocationButton
					onPress={handleGPSButtonPress}
					isLoading={isLoadingGPS}
					disabled={disabled}
				/>
			</View>

			{/* ==================== */}
			{/*   INTERACTIVE MAP    */}
			{/* ==================== */}
			<MiniMapDisplay
				coordinates={locationData.currentCoordinates}
				displayAddress={locationData.displayAddress}
				isLoading={isAnyLoading}
				visible={shouldShowMap}
				onPinDragComplete={handleMapPinDrag}
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
			{locationData.currentCoordinates && (
				<CaptionText style={styles.coordinateDisplay}>
					📍 Pin will be placed at:{' '}
					{locationData.currentCoordinates.latitude.toFixed(4)},{' '}
					{locationData.currentCoordinates.longitude.toFixed(4)}
				</CaptionText>
			)}
		</View>
	);
}

// ==================
// COMPONENT STYLES
// ==================

const styles = StyleSheet.create({
	locationSection: {
		marginBottom: 24,
	},

	sectionLabel: {
		marginBottom: 12,
		fontSize: 16,
	},

	requiredIndicator: {
		color: ReMapColors.semantic.error,
	},

	searchInputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},

	searchInput: {
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
