import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Region } from 'react-native-maps';
import { CaptionText } from '@/components/ui/Typography';
import { ReMapColors } from '@/constants/Colors';

// ==========================================
// TYPE DEFINITIONS
// ==========================================
interface MiniMapProps {
	locationQuery: string;
	onLocationChange: (coordinates: {
		latitude: number;
		longitude: number;
		address: string;
	}) => void;
	visible: boolean;
	style?: any;
}

// ==========================================
// COMPONENT IMPLEMENTATION
// ==========================================
export function MiniMap({
	locationQuery,
	onLocationChange,
	visible,
	style,
}: MiniMapProps) {
	const [region, setRegion] = useState<Region>({
		latitude: -37.8136, // Melbourne default
		longitude: 144.9631,
		latitudeDelta: 0.01,
		longitudeDelta: 0.01,
	});

	const [markerCoordinate, setMarkerCoordinate] = useState({
		latitude: -37.8136,
		longitude: 144.9631,
	});

	const [isGeocoding, setIsGeocoding] = useState(false);

	// ==========================================
	// SIMPLE GEOCODING (can be enhanced later)
	// ==========================================
	const geocodeLocation = async (query: string) => {
		if (!query || query.length < 3) return;

		setIsGeocoding(true);

		try {
			// Simple geocoding - you can enhance with Google Places API later
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
					query + ', Melbourne, Australia'
				)}&limit=1`
			);

			const data = await response.json();

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

	// ==========================================
	// DEBOUNCED GEOCODING
	// ==========================================
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			geocodeLocation(locationQuery);
		}, 1000);

		return () => clearTimeout(timeoutId);
	}, [locationQuery]);

	// ==========================================
	// HANDLE MARKER DRAG
	// ==========================================
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

	// ==========================================
	// RENDER COMPONENT
	// ==========================================
	return (
		<View style={[styles.container, style]}>
			<View style={styles.header}>
				<CaptionText style={styles.title}>
					📍 Pin Location {isGeocoding && '(Searching...)'}
				</CaptionText>
				<CaptionText style={styles.instruction}>
					Drag the red pin to set exact location
				</CaptionText>
			</View>

			<MapView
				style={styles.map}
				provider={PROVIDER_GOOGLE} // Use same provider as your worldmap
				region={region}
				onRegionChangeComplete={setRegion}
				mapType="standard"
				showsUserLocation={false} // Keep it simple
				showsMyLocationButton={false}
			>
				<Marker
					coordinate={markerCoordinate}
					draggable
					onDragEnd={handleMarkerDragEnd}
					title="Memory Pin"
					description="Drag to adjust"
					pinColor="red" // Match your worldmap style
				/>
			</MapView>

			<View style={styles.footer}>
				<CaptionText style={styles.coordinates}>
					Lat: {markerCoordinate.latitude.toFixed(6)}, Lng:{' '}
					{markerCoordinate.longitude.toFixed(6)}
				</CaptionText>
			</View>
		</View>
	);
}

// ==========================================
// STYLES
// ==========================================
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
		height: 150, // Compact size
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
