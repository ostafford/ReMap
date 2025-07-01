// ================
//   CORE IMPORTS
// ================
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

// ================================
//   INTERNAL 'UI' COMPONENTS
// ================================
import { Input } from '@/components/ui/TextInput';
import { CaptionText, LabelText } from '@/components/ui/Typography';

// ================================
//   INTERNAL 'CONSTANTS' IMPORTS
// ================================
import { ReMapColors } from '@/constants/Colors';

// ===================
// TYPE DEFINITIONS
// ===================

interface SearchResult {
	place_id: string;
	display_name: string;
	lat: string;
	lon: string;
	type: string;
	importance: number;
}

interface NominatimSearchProps {
	onSelect: (result: {
		latitude: number;
		longitude: number;
		address: string;
	}) => void;
	placeholder?: string;
	style?: any;
	onFocus?: () => void;
}

// ================================
// SEARCH RESULT ITEM COMPONENT
// ================================
const SearchResultItem = ({
	item,
	onPress,
}: {
	item: SearchResult;
	onPress: () => void;
}) => (
	<TouchableOpacity style={styles.resultItem} onPress={onPress}>
		<LabelText style={styles.resultTitle} numberOfLines={1}>
			{item.display_name.split(',')[0]}
		</LabelText>
		<CaptionText style={styles.resultSubtitle} numberOfLines={2}>
			{item.display_name}
		</CaptionText>
	</TouchableOpacity>
);

// ==========================
// COMPONENT IMPLEMENTATION
// ==========================

export function NominatimSearch({
	onSelect,
	placeholder = 'Search location...',
	style,
}: NominatimSearchProps) {
	// ========================
	// STATE MANAGEMENT
	// ========================
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [showResults, setShowResults] = useState(false);
	const searchInputRef = useRef<any>(null);

	// ========================
	// SEARCH API FUNCTION
	// ========================
	const searchNominatim = useCallback(async (query: string) => {
		if (query.length < 3) {
			setSearchResults([]);
			setShowResults(false);
			return;
		}

		setIsLoading(true);

		try {
			// Build search URL with Australian filtering and proper parameters
			const searchUrl =
				`https://nominatim.openstreetmap.org/search?` +
				`format=json&` +
				`q=${encodeURIComponent(query)}&` +
				`countrycodes=au&` +
				`limit=5&` +
				`addressdetails=1`;

			const response = await fetch(searchUrl, {
				headers: {
					'User-Agent': 'ReMap/1.0 (remap.app)', // Policy compliance
				},
			});

			if (!response.ok) {
				throw new Error(`Search failed: ${response.status}`);
			}

			const data: SearchResult[] = await response.json();

			// Sort by importance (higher importance first)
			const sortedResults = data.sort(
				(a, b) => (b.importance || 0) - (a.importance || 0)
			);

			setSearchResults(sortedResults);
			setShowResults(sortedResults.length > 0);
		} catch (error) {
			console.error('❌ [NOMINATIM-SEARCH] Search error:', error);
			setSearchResults([]);
			setShowResults(false);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// ================
	// EVENT HANDLERS
	// ================
	const handleSearchInputChange = useCallback((text: string) => {
		setSearchQuery(text);

		// Reset search state when query changes
		if (text.length < 3) {
			setSearchResults([]);
			setShowResults(false);
			setIsLoading(false);
		}
	}, []);

	const handleResultSelect = useCallback(
		(result: SearchResult) => {
			const latitude = parseFloat(result.lat);
			const longitude = parseFloat(result.lon);

			// Validate coordinates are within valid geographic ranges
			if (latitude < -90 || latitude > 90) {
				console.error('Invalid latitude from Nominatim:', latitude);
				return;
			}
			if (longitude < -180 || longitude > 180) {
				console.error('Invalid longitude from Nominatim:', longitude);
				return;
			}

			const coordinates = {
				latitude,
				longitude,
				address: result.display_name,
			};

			// Update search input to show selected result
			setSearchQuery(result.display_name.split(',')[0]);

			// Hide results dropdown
			setShowResults(false);
			setSearchResults([]);

			// Notify parent component
			onSelect(coordinates);
		},
		[onSelect]
	);

	const focusSearchInput = useCallback(() => {
		setTimeout(() => {
			searchInputRef.current?.focus();
		}, 100);
	}, []);

	const handleClearSearch = useCallback(() => {
		setSearchQuery('');
		setSearchResults([]);
		setShowResults(false);
	}, []);

	// ===============
	// SIDE EFFECTS
	// ===============

	// Debounced search: Wait 3 seconds after user stops typing (Policy compliance)
	useEffect(() => {
		// Clear previous results when query changes
		if (searchQuery.length > 2) {
			setIsLoading(true);
			setShowResults(false);
		}

		const timeoutId = setTimeout(() => {
			if (searchQuery.length > 2) {
				searchNominatim(searchQuery);
			}
		}, 3000);

		return () => clearTimeout(timeoutId);
	}, [searchQuery, searchNominatim]);

	useEffect(() => {
		// Auto-focus when component becomes visible
		focusSearchInput();
	}, [focusSearchInput]);

	// ==================
	// RENDER COMPONENT
	// ==================
	return (
		<View style={[styles.container, style]}>
			{/* ==================== */}
			{/*   SEARCH INPUT       */}
			{/* ==================== */}
			<Input
				label="Search Location"
				placeholder={placeholder}
				value={searchQuery}
				onChangeText={handleSearchInputChange}
				style={styles.searchInput}
				ref={searchInputRef}
			/>

			{/* ==================== */}
			{/*   LOADING INDICATOR  */}
			{/* ==================== */}
			{isLoading && (
				<View style={styles.loadingContainer}>
					<CaptionText style={styles.loadingText}>
						🔍 Searching...
					</CaptionText>
				</View>
			)}

			{/* ==================== */}
			{/*   RESULTS DROPDOWN   */}
			{/* ==================== */}
			{showResults && searchResults.length > 0 && (
				<View style={styles.resultsContainer}>
					<FlatList
						data={searchResults}
						keyExtractor={(item) => item.place_id}
						renderItem={({ item }) => (
							<SearchResultItem
								item={item}
								onPress={() => handleResultSelect(item)}
							/>
						)}
						style={styles.resultsList}
						keyboardShouldPersistTaps="handled"
					/>
				</View>
			)}

			{/* ==================== */}
			{/*   NO RESULTS MESSAGE */}
			{/* ==================== */}
			{showResults &&
				searchResults.length === 0 &&
				!isLoading &&
				searchQuery.length > 2 && (
					<View style={styles.noResultsContainer}>
						<CaptionText style={styles.noResultsText}>
							No locations found in Australia
						</CaptionText>
					</View>
				)}

			{/* ==================== */}
			{/*   CLEAR BUTTON       */}
			{/* ==================== */}
			{searchQuery.length > 0 && (
				<TouchableOpacity
					style={styles.clearButton}
					onPress={handleClearSearch}
				>
					<CaptionText style={styles.clearButtonText}>✕</CaptionText>
				</TouchableOpacity>
			)}
		</View>
	);
}

// ==================
// COMPONENT STYLES
// ==================
const styles = StyleSheet.create({
	container: {
		position: 'relative',
		zIndex: 1000,
	},

	searchInput: {
		backgroundColor: ReMapColors.ui.cardBackground,
		borderRadius: 12,
	},

	loadingContainer: {
		position: 'absolute',
		top: 82,
		left: 0,
		right: 0,
		backgroundColor: ReMapColors.ui.cardBackground,
		padding: 12,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: ReMapColors.ui.border,
	},

	loadingText: {
		textAlign: 'center',
		color: ReMapColors.primary.blue,
	},

	resultsContainer: {
		position: 'absolute',
		top: 82,
		left: 0,
		right: 0,
		backgroundColor: ReMapColors.ui.cardBackground,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: ReMapColors.ui.border,
		maxHeight: 200,
		shadowColor: ReMapColors.primary.black,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 5,
	},

	resultsList: {
		maxHeight: 200,
	},

	resultItem: {
		padding: 12,
		borderBottomWidth: 1,
		borderBottomColor: ReMapColors.ui.border,
	},

	resultTitle: {
		fontSize: 14,
		fontWeight: '500',
		color: ReMapColors.ui.text,
		marginBottom: 4,
	},

	resultSubtitle: {
		fontSize: 12,
		color: ReMapColors.ui.textSecondary,
		lineHeight: 16,
	},

	noResultsContainer: {
		position: 'absolute',
		top: 60,
		left: 0,
		right: 0,
		backgroundColor: ReMapColors.ui.cardBackground,
		padding: 16,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: ReMapColors.ui.border,
	},

	noResultsText: {
		textAlign: 'center',
		color: ReMapColors.ui.textSecondary,
		fontStyle: 'italic',
	},

	clearButton: {
		position: 'absolute',
		right: 12,
		top: 48,
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: ReMapColors.ui.textSecondary,
		alignItems: 'center',
		justifyContent: 'center',
	},

	clearButtonText: {
		color: 'white',
		fontSize: 12,
		fontWeight: 'bold',
	},
});

// ================
// DEFAULT EXPORT
// ================
export default NominatimSearch;
