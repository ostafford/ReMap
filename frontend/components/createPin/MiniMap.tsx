// ================
//   CORE IMPORTS
// ================
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

// =======================
//   THIRD-PARTY IMPORTS
// =======================
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';

// ================================
//   INTERNAL 'UI' COMPONENTS
// ================================
import { CaptionText } from '@/components/ui/Typography';

// ================================
//   INTERNAL 'CONSTANTS' IMPORTS
// ================================
import { ReMapColors } from '@/constants/Colors';

// ======================
//   COMPONENT IMPORTS
// ======================
import { useGeocodingMap } from '@/hooks/createPin/useGeocodingMap';

// ==================
// TYPE DEFINITIONS
// ==================

type MiniMapProps = {
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
};

// ===========================
// COMPONENT IMPLEMENTATION
// ===========================

export function MiniMap({
	locationQuery,
	onLocationChange,
	visible,
	style,
	initialCoordinates,
}: MiniMapProps) {
	// ====================================
	// HOOK CONSUMPTION
	// ====================================
	const {
		mapData,
		handleLocationSearchWithDebounce,
		handleMarkerDragComplete,
		handleRegionChange,
		setMapVisibility,
		centerMapOnCoordinates,
	} = useGeocodingMap();

	// ================
	// EVENT HANDLERS
	// ================

	const handlePinDragEnd = (event: any) => {
		const coordinates = event.nativeEvent.coordinate;

		const result = handleMarkerDragComplete(coordinates);

		onLocationChange({
			latitude: result.latitude,
			longitude: result.longitude,
			address: result.address,
		});
	};

	const handleMapRegionChange = (region: any) => {
		handleRegionChange(region);
	};

	// ===============
	// SIDE EFFECTS
	// ===============

	useEffect(() => {
		if (locationQuery && locationQuery.length >= 5) {
			handleLocationSearchWithDebounce(locationQuery);
		}
	}, [locationQuery, handleLocationSearchWithDebounce]);

	// If dragged do this
	useEffect(() => {
		setMapVisibility(visible);
	}, [visible, setMapVisibility]);

	// if typed do this
	useEffect(() => {
		if (initialCoordinates) {
			centerMapOnCoordinates(initialCoordinates);
		}
	}, [initialCoordinates, centerMapOnCoordinates]);

	if (!visible) return null;

	// =================
	// RENDER COMPONENT
	// =================

	return (
		<View style={[styles.container, style]}>
			{/* ==================== */}
			{/*     MAP HEADER       */}
			{/* ==================== */}
			<View style={styles.header}>
				<CaptionText style={styles.title}>
					📍 Pin Location {mapData.isGeocoding && '(Searching...)'}
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
				region={mapData.region}
				onRegionChangeComplete={handleMapRegionChange}
				mapType="standard"
				showsUserLocation={true}
				showsMyLocationButton={true}
			>
				{/* Draggable red pin for location selection */}
				<Marker
					coordinate={mapData.markerCoordinate}
					draggable
					onDragEnd={handlePinDragEnd}
					title="Memory Pin"
					description="Drag to adjust"
					pinColor="red"
				/>
			</MapView>
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
});

export default MiniMap;
