// ================
//   CORE IMPORTS
// ================
import React from 'react';
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

interface MiniMapDisplayProps {
	// Data to display
	coordinates: { latitude: number; longitude: number } | null;
	displayAddress: string;
	isLoading: boolean;
	visible: boolean;

	// User interaction callbacks
	onPinDragComplete: (coords: {
		latitude: number;
		longitude: number;
	}) => void;
	onMapRegionChange?: (region: Region) => void;

	// Optional styling
	style?: any;
}

// ===========================
// COMPONENT IMPLEMENTATION
// ===========================

export function MiniMapDisplay({
	coordinates,
	displayAddress,
	isLoading,
	visible,
	onPinDragComplete,
	onMapRegionChange,
	style,
}: MiniMapDisplayProps) {
	// ==================
	// EARLY RETURN:
	// ==================
	if (!visible) return null;

	// ==================
	// DEFAULT COORDINATES: Melbourne CBD fallback
	// ==================
	const displayCoordinates = coordinates || {
		latitude: -37.817979,
		longitude: 144.960408,
	};

	// ==================
	// MAP REGION:
	// ==================
	const mapRegion: Region = {
		latitude: displayCoordinates.latitude,
		longitude: displayCoordinates.longitude,
		latitudeDelta: 0.01,
		longitudeDelta: 0.01,
	};

	// ===========================
	// USER INTERACTION HANDLERS
	// ===========================

	const handlePinDragEnd = (event: any) => {
		const newCoordinates = event.nativeEvent.coordinate;
		onPinDragComplete(newCoordinates);
	};

	const handleMapRegionChangeComplete = (region: Region) => {
		onMapRegionChange?.(region);
	};

	// ==================
	// RENDER COMPONENT
	// ==================
	return (
		<View style={[styles.mapContainer, style]}>
			{/* ==================== */}
			{/*     MAP HEADER       */}
			{/* ==================== */}
			<View style={styles.mapHeader}>
				<CaptionText style={styles.mapTitle}>
					📍 Pin Location {isLoading && '(Loading...)'}
				</CaptionText>
				<CaptionText style={styles.mapInstruction}>
					Drag the red pin to set exact location
				</CaptionText>
			</View>

			{/* ==================== */}
			{/*   INTERACTIVE MAP    */}
			{/* ==================== */}
			<MapView
				style={styles.mapView}
				provider={PROVIDER_GOOGLE}
				region={mapRegion}
				onRegionChangeComplete={handleMapRegionChangeComplete}
				mapType="standard"
				showsUserLocation={false}
				showsMyLocationButton={false}
			>
				{/* Draggable red pin for location selection */}
				<Marker
					coordinate={displayCoordinates}
					draggable
					onDragEnd={handlePinDragEnd}
					title="Memory Pin"
					description="Drag to adjust location"
					pinColor="red"
				/>
			</MapView>

			{/* ==================== */}
			{/*   ADDRESS DISPLAY    */}
			{/* ==================== */}
			<View style={styles.mapFooter}>
				<CaptionText style={styles.addressText}>
					📍 {displayAddress || 'Select a location'}
				</CaptionText>
				<CaptionText style={styles.coordinatesText}>
					Lat: {displayCoordinates.latitude.toFixed(6)}, Lng:{' '}
					{displayCoordinates.longitude.toFixed(6)}
				</CaptionText>
			</View>
		</View>
	);
}

// ===================
// COMPONENT STYLES
// ===================
const styles = StyleSheet.create({
	mapContainer: {
		backgroundColor: ReMapColors.ui.cardBackground,
		borderRadius: 8,
		overflow: 'hidden',
		marginTop: 8,
		borderWidth: 1,
		borderColor: ReMapColors.ui.border,
	},

	mapHeader: {
		padding: 8,
		backgroundColor: ReMapColors.ui.background,
	},

	mapTitle: {
		fontWeight: '500',
		color: ReMapColors.primary.blue,
		fontSize: 12,
		marginBottom: 2,
	},

	mapInstruction: {
		color: ReMapColors.ui.textSecondary,
		fontSize: 10,
	},

	mapView: {
		height: 200,
		width: '100%',
	},

	mapFooter: {
		padding: 8,
		backgroundColor: ReMapColors.ui.background,
	},

	addressText: {
		color: ReMapColors.primary.blue,
		fontSize: 11,
		fontWeight: '500',
		marginBottom: 4,
	},

	coordinatesText: {
		textAlign: 'center',
		color: ReMapColors.ui.textSecondary,
		fontSize: 9,
		fontFamily: 'monospace',
	},
});

// ================
// DEFAULT EXPORT
// ================
export default MiniMapDisplay;
