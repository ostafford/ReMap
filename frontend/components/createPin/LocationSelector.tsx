import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Input } from '@/components/ui/TextInput';
import { LabelText, CaptionText } from '@/components/ui/Typography';
import { ReMapColors } from '@/constants/Colors';
import { MiniMap } from './MiniMap';

// ==========================================
// TYPE DEFINITIONS
// ==========================================
interface LocationSelectorProps {
	// Core props
	value: string;
	onChange: (value: string) => void;

	// Input management
	inputRef: React.RefObject<any>;
	onFocus?: () => void;
	onBlur?: () => void;

	// Customization
	label?: string;
	placeholder?: string;
	helperText?: string;
	required?: boolean;

	// Styling
	style?: any;
	disabled?: boolean;

	// Coordinats for Minimap
	onCoordinateChange?: (coords: {
		latitude: number;
		longitude: number;
		address: string;
	}) => void;
}

// ==========================================
// COMPONENT IMPLEMENTATION
// ==========================================
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
	const [showMap, setShowMap] = useState(false);
	const [coordinates, setCoordinates] = useState<{
		latitude: number;
		longitude: number;
		address: string;
	} | null>(null);

	const handleLocationChange = (coords: {
		latitude: number;
		longitude: number;
		address: string;
	}) => {
		setCoordinates(coords);
		// Optionally update the input field with the address
		onCoordinateChange?.(coords);
		console.log('📍 LocationSelector passing coordinates:', coords);
	};

	useEffect(() => {
		// Show map when user starts typing
		setShowMap(value.length > 2);
	}, [value]);
	// ==========================================
	// RENDER COMPONENT
	// ==========================================
	return (
		<View style={[styles.section, style]}>
			<LabelText style={styles.sectionLabel}>
				{label}
				{required && <LabelText style={styles.required}> *</LabelText>}
			</LabelText>

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

			{/* Mini Map */}
			<MiniMap
				locationQuery={value}
				onLocationChange={handleLocationChange}
				visible={showMap}
			/>

			{helperText && (
				<CaptionText style={styles.helperText}>
					{helperText}
				</CaptionText>
			)}

			{/* Coordinate display */}
			{coordinates && (
				<CaptionText style={styles.coordinateDisplay}>
					📍 Pin will be placed at: {coordinates.latitude.toFixed(4)},{' '}
					{coordinates.longitude.toFixed(4)}
				</CaptionText>
			)}
		</View>
	);
}

// ==========================================
// COMPONENT STYLES
// ==========================================
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
	validationIndicator: {
		marginTop: 6,
		paddingHorizontal: 4,
	},
	validationText: {
		color: ReMapColors.semantic.success,
		fontSize: 12,
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

// ==========================================
// DEFAULT EXPORT
// ==========================================
export default LocationSelector;
