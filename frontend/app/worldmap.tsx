// =========================================================================
//   						EXTERNAL IMPORTS
// =========================================================================
import React, {
	useRef,
	useMemo,
	useState,
	useEffect,
	useCallback,
} from 'react';
import {
	Alert,
	Animated,
	Dimensions,
	Image,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from 'react-native';

// ===============================
//   EXPO/NAVIGATION IMPORTS
// ===============================
import { router } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ===============================
//   OTHER THIRD-PARTY IMPORTS
// ===============================
import axios from 'axios';
import BottomSheet from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { Dropdown } from 'react-native-element-dropdown';

// =========================================================================
//   						INTERNAL IMPORTS
// =========================================================================

// ======================
//   CLIENT IMPORTS
// =======================
import RemapClient from '@/app/services/remap';

// =========================
//   NOMINATIM IMPORT
// =========================
import { NominatimSearch } from '@/components/ui/NominatimSearch';

// =========================
//   CUSTOM HOOKS IMPORTS
// =========================
import { AuthModal } from '@/components/ui/AuthModal';
import { ViewPinBottomSheet } from '@/components/createPin/ViewPinBottomSheet';
import { useAuth } from '@/hooks/shared/useAuth';
import { useModal } from '@/hooks/shared/useModal';
import { useSlideAnimation } from '@/hooks/useSlideAnimation';
import { useNotification } from '@/contexts/NotificationContext';
<<<<<<< HEAD
import RemapClient, { type MapPin } from '@/app/services/remap';
=======
>>>>>>> 13d4256c699d9b048d56625de6074c3413f684c7

// ======================
//  LAYOUT COMPONENTSr
// ======================
import { Header } from '@/components/layout/Header';
import { MainContent } from '@/components/layout/MainContent';
import { Footer } from '@/components/layout/Footer';

// =================
//   UI COMPONENTS
// =================
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
<<<<<<< HEAD
import { CustomButton } from '@/components/ui/CustomButton';
=======
>>>>>>> 13d4256c699d9b048d56625de6074c3413f684c7
import { Input } from '@/components/ui/TextInput';
import { Modal } from '@/components/ui/Modal';
import { TopNotificationSheet } from '@/components/ui/TopNotificationSheet';

// ======================
//   TYPOGRAPHY IMPORTS
// ======================
import {
	BodyText,
	CaptionText,
	HeaderText,
	LabelText,
} from '@/components/ui/Typography';

// =====================
//   CONSTANTS IMPORTS
// =====================
import { ReMapColors } from '@/constants/Colors';

// ===================
//   SERVICES IMPORTS
// ===================
import { getCurrentUser, signOut } from '@/app/services/auth';
import { remap } from 'three/tsl';

// =========================
//   DATA IMPORTS
// =========================
import { STARTER_PACKS } from '@/constants/onboardingStaticData';

// =========================================================================
//   						COMPONENT DEFINITION
// =========================================================================
export default function WorldMapScreen() {
	// ===============================
	//   UTILITY CONSTANTS & SETUP
	// ===============================
	const { height } = Dimensions.get('window');
	const insets = useSafeAreaInsets();
	const { userPreferences } = useLocalSearchParams();
	const {
		notification,
		isVisible: isNotificationVisible,
		hideNotification,
		showNotification,
	} = useNotification();

	// ==================
	//   REMAP CLIENT
	// ==================
	const remapClient = new RemapClient();

	// ================
	//   MAP SETTINGS
	// ================
	const INITIAL_REGION = {
		latitude: -37.817979,
		longitude: 144.960408,
		latitudeDelta: 0.05, // Shows Melbourne CBD + nearby suburbs
		longitudeDelta: 0.05, // Shows Melbourne CBD + nearby suburbs
	};

	const mapRef = useRef<MapView>(null);

	// =============================
	//   AUTHENTICATION SECTION
	// =============================
	const {
		user,
		isLoading,
		isAuthenticated,
		signOut,
		userDisplayName,
		refreshAuth,
	} = useAuth();

	const handleSignOut = async () => {
		const success = await signOut();
		if (success) {
			profileModal.close();
			router.replace('/');
		}
	};

	// ==================================
	//   CIRCLE SELECTION DROPDOWN SETUP
	// ==================================
<<<<<<< HEAD
	const circleData = [
		{ label: 'Global', value: '1' },
		{ label: 'Private', value: '2' },
		{ label: 'Team Remap', value: '3' }, // default social circle for all users?
		// ... (if user logged in) - code that fetches  user's social circles
	];

	const [circle, setCircle] = useState(null);
=======

	const [circle, setCircle] = useState(null);
	const [circleData, setCircleData] = useState<
		{ label: string; value: string }[]
	>([]);

	useEffect(() => {
		const fetchCircles = async () => {
			// Only fetch circles if user is authenticated
			if (!isAuthenticated) {
				console.log(
					'🔒 [WORLDMAP] User not authenticated, skipping circles fetch'
				);
				setCircleData([
					{ label: 'Global', value: 'global' },
					{ label: 'Private', value: 'private' },
				]);
				return;
			}

			try {
				const remap = new RemapClient();
				const circles = await remap.getCircles();

				const defaultCircles = [
					{ label: 'Global', value: 'global' },
					{ label: 'Private', value: 'private' },
				];

				const socialCircles = circles.map((circle) => ({
					label: circle.name,
					value: circle.id,
				}));

				setCircleData([...defaultCircles, ...socialCircles]);
			} catch (err) {
				console.error('Error fetching circles:', err);
				// Fallback to default circles on error
				setCircleData([
					{ label: 'Global', value: 'global' },
					{ label: 'Private', value: 'private' },
				]);
			}
		};
		fetchCircles();
	}, [isAuthenticated]);
>>>>>>> 13d4256c699d9b048d56625de6074c3413f684c7

	// ==================================
	//   STARTER PACK SELECT SETUP
	// ==================================
	const starterPacks = [
		{ label: 'sp1', value: 'sp1' },
		{ label: 'sp2', value: 'sp2' },
		{ label: 'sp3', value: 'sp3' },
		{ label: 'sp4', value: 'sp4' },
		{ label: 'sp5', value: 'sp5' },
	];

	const [selectedPack, setSelectedPack] = useState<string | null>(null);

	// const handleStarterPackSelect = (pack) => {
	// ... code to filter pins to starter packs here
	//...
	//...
	//};

	// =============================
	//   MODAL MANAGEMENT SECTION
	// =============================
	const profileModal = useModal();
	const signInModal = useModal();

	// =============================
	//   MAP INTERACTION SECTION
	// =============================

	// Helper function to group pins by location (with tolerance)
	const findPinsAtLocation = useCallback(
		(targetLat: number, targetLng: number, allPins: MapPin[]) => {
			const tolerance = 0.0001; // About 10 meters tolerance
			return allPins.filter(
				(pin) =>
					Math.abs(pin.latitude - targetLat) < tolerance &&
					Math.abs(pin.longitude - targetLng) < tolerance
			);
		},
		[]
	);

	// Map handlers
	const handleMarkerPress = (
		coordinate: {
			latitude: number;
			longitude: number;
		},
		pinData?: any
	) => {
		// Find all pins at this location
		const pinsAtLocation = findPinsAtLocation(
			coordinate.latitude,
			coordinate.longitude,
			realPins
		);

		if (pinsAtLocation.length > 0) {
			setSelectedPins(pinsAtLocation);
			setCurrentPinIndex(0); // Start with first pin
		} else if (pinData) {
			// Fallback to single pin if no grouping found
			setSelectedPins([pinData]);
			setCurrentPinIndex(0);
		}

		setSelectedCoordinate(coordinate);
		setIsBottomSheetVisible(true);
	};

	// Handle pin index change
	const handlePinIndexChange = (newIndex: number) => {
		setCurrentPinIndex(newIndex);
	};

	// Map helper functions (CALLOUT ETC)
	const getMarkerColor = (visibility?: string | string[]): string => {
		if (!visibility) return '#666666'; // Default gray

		// Handle both string and array formats for backward compatibility
		const visArray = Array.isArray(visibility) ? visibility : [visibility];

		if (visArray.includes('private')) {
			return '#FF6B6B'; // Red for private
		} else if (visArray.includes('social')) {
			return '#4ECDC4'; // Teal for social
		} else if (visArray.includes('public')) {
			return '#45B7D1'; // Blue for public
		}

		return '#666666'; // Default gray
	};

	// =============================
	//   BOTTOMSHEET STATE
	// =============================
	const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
	const [selectedPins, setSelectedPins] = useState<MapPin[]>([]);
	const [currentPinIndex, setCurrentPinIndex] = useState(0);
	const [selectedCoordinate, setSelectedCoordinate] = useState<{
		latitude: number;
		longitude: number;
	} | null>(null);

	const handleBottomSheetClose = () => {
		setIsBottomSheetVisible(false);
		setSelectedPins([]);
		setCurrentPinIndex(0);
		setSelectedCoordinate(null);
	};

	// =============================
	//   SEARCH FUNCTIONALITY SECTION
	// =============================
	const [searchVisible, setSearchVisible] = useState(false);
	const slideAnim = useRef(new Animated.Value(-100)).current;

	const [searchResultLocation, setSearchResultLocation] = useState<{
		latitude: number;
		longitude: number;
		address: string;
	} | null>(null);

	// Search handlers
	const openSearch = () => {
		setSearchVisible(true);
		Animated.timing(slideAnim, {
			toValue: 0,
			duration: 300,
			useNativeDriver: true,
		}).start(() => {
			// Focus the search input after animation completes
			// The NominatimSearch component will auto-focus via useEffect
		});
	};

	const closeSearch = () => {
		Animated.timing(slideAnim, {
			toValue: -100,
			duration: 100,
			useNativeDriver: true,
		}).start(() => {
			setSearchVisible(false);
		});
	};

	const onLocationSelect = (result: {
		latitude: number;
		longitude: number;
		address: string;
	}) => {
		closeSearch();

		setSearchResultLocation(result);

		// Animate to location
		mapRef.current?.animateToRegion({
			latitude: result.latitude,
			longitude: result.longitude,
			latitudeDelta: 0.01,
			longitudeDelta: 0.01,
		});
	};

	// =============================
	//   NAVIGATION SECTION
	// =============================
	// Navigation handlers
	const goBack = () => {
		router.replace('/');
	};

	const navigateToWorldMap = () => {
		router.replace('/worldmap');
	};

	const navigateToCreatePin = () => {
		router.replace('/createPin');
	};

	const navigateToProfile = () => {
		router.push('/profile');
	};

	// =============================
	//   PIN MARKER DISPLAY SECTION
	// =============================
	const [realPins, setRealPins] = useState<any[]>([]);
	const [isLoadingPins, setIsLoadingPins] = useState(false);
	const [pinError, setPinError] = useState<string | null>(null);

<<<<<<< HEAD
	// Cache for pins to avoid redundant API calls
	const [pinCache, setPinCache] = useState<Map<string, MapPin[]>>(new Map());
	const [lastViewport, setLastViewport] = useState<string | null>(null);

	// Load pins when component mounts
	useEffect(() => {
		// Only fetch pins once on mount, not on every remapClient change
		const initialFetch = async () => {
			console.log('🔄 [WORLDMAP] Initial pin fetch on mount');
			setIsLoadingPins(true);
			setPinError(null);

			try {
				// Use a smaller initial viewport to reduce data transfer
				const initialRegion = {
					latitude: -37.817979,
					longitude: 144.960408,
					latitudeDelta: 0.1, // Smaller initial area
					longitudeDelta: 0.1,
				};

				const viewport =
					remapClient.createViewportFromMapRegion(initialRegion);
				const result = await remapClient.fetchAllVisiblePins(viewport);

				if (result.success && result.data) {
					setRealPins(result.data);
					// Cache the initial results
					const cacheKey = `${viewport.northEast.latitude.toFixed(
						3
					)},${viewport.northEast.longitude.toFixed(
						3
					)},${viewport.southWest.latitude.toFixed(
						3
					)},${viewport.southWest.longitude.toFixed(3)}`;
					setPinCache(
						(prev) => new Map(prev.set(cacheKey, result.data!))
					);
					setLastViewport(cacheKey);
				} else {
					setPinError(result.error || 'Failed to load pins');
					setRealPins([]);
				}
			} catch (error) {
				setPinError('Unexpected error loading pins');
				setRealPins([]);
			} finally {
				setIsLoadingPins(false);
			}
		};

		initialFetch();
	}, []); // Empty dependency array - only run once on mount
=======
	// =============================
	//   SHARED PIN PROCESSING
	// =============================
	const processPinsResponse = useCallback(
		(result: any) => {
			console.log('📡 [WORLDMAP] Processing backend response:', result);

			// Handle the actual backend response format: { "List pins": pins }
			const pins = result['List pins'] || result.data || [];

			console.log('📊 [WORLDMAP] Raw pins array:', pins);

			// Debug: Log visibility of each pin
			pins.forEach((pin: any, index: number) => {
				console.log(
					`🔍 [WORLDMAP] Pin ${index}: "${pin.name}" - visibility: "${pin.visibility}", private_pin: ${pin.private_pin}, owner: ${pin.owner_id}`
				);
			});

			if (Array.isArray(pins)) {
				// Filter out pins with invalid coordinates AND apply visibility rules
				const validPins = pins.filter((pin: any) => {
					const lat = pin.latitude;
					const lng = pin.longitude;

					// Basic range validation
					const validLat = lat >= -90 && lat <= 90;
					const validLng = lng >= -180 && lng <= 180;

					// Additional validation for obviously wrong coordinates
					// Filter out coordinates that are clearly invalid (like 0,0 for most cases)
					const notZeroZero = !(lat === 0 && lng === 0);

					// Filter out coordinates that are too extreme (like 90, -120)
					const notExtreme =
						Math.abs(lat) < 85 && Math.abs(lng) < 175;

					// Visibility filtering logic
					let isVisible = true;

					// Check private_pin field first (this is the primary indicator of private pins)
					if (pin.private_pin === true) {
						// Private pins: Only show to the owner
						isVisible = Boolean(
							isAuthenticated && user && pin.owner_id === user.id
						);
						if (!isVisible) {
							console.log(
								`🚫 [WORLDMAP] Filtered out private pin "${pin.name}" - not owner`
							);
						}
					} else if (pin.visibility === 'social') {
						// Social pins: Only show to authenticated users who are members of the social circle
						// TODO: Implement social circle membership check when backend supports it
						isVisible = Boolean(isAuthenticated);
						if (!isVisible) {
							console.log(
								`🚫 [WORLDMAP] Filtered out social pin "${pin.name}" - not authenticated`
							);
						}
					}
					// Public pins: Show to everyone (no filtering needed)

					const isValid =
						validLat &&
						validLng &&
						notZeroZero &&
						notExtreme &&
						isVisible;

					if (!isValid) {
						if (!isVisible) {
							console.log(
								`🚫 [WORLDMAP] Filtered out pin "${pin.name}" due to visibility rules`
							);
						} else {
							console.log(
								`🚫 [WORLDMAP] Filtered out invalid pin "${pin.name}" with coordinates (${lat}, ${lng})`
							);
						}
					}

					return isValid;
				});

				console.log(
					`📊 [WORLDMAP] Total pins: ${pins.length}, Valid pins: ${validPins.length}`
				);

				// Transform backend data to MapPin format with new user data structure
				const transformedPins: any[] = validPins.map((pin: any) => ({
					id: pin.id,
					name: pin.name,
					description: pin.description,
					coordinate: {
						latitude: pin.latitude,
						longitude: pin.longitude,
					},
					pinData: {
						memory: {
							name: pin.name,
							description: pin.description,
							owner_id: pin.owner_id,
							created_at: pin.created_at,
							visibility: [pin.visibility || 'public'],
							media: {
								photos: (pin.image_urls || [])
									.filter(
										(url: string) => url && url !== null
									)
									.map((url: string, index: number) => ({
										name: `photo_${index + 1}`,
										uri: url,
									})),
								videos: [],
								audio: pin.audio_url
									? { recorded: pin.audio_url }
									: null,
							},
						},
						name: pin.name,
						location: {
							location_query:
								pin.location_query || 'Unknown location',
							latitude: pin.latitude,
							longitude: pin.longitude,
						},
						// Add owner data for BottomSheet
						owner: pin.owner || {
							id: pin.owner_id,
							username: null,
							full_name: null,
							avatar_url: null,
						},
					},
				}));

				setRealPins(transformedPins);
				console.log(
					`✅ [WORLDMAP] Loaded ${transformedPins.length} valid pins via remap.ts`
				);
				return true;
			} else {
				console.error('❌ [WORLDMAP] Invalid response format:', result);
				setPinError('Invalid response format from backend');
				setRealPins([]);
				return false;
			}
		},
		[isAuthenticated, user]
	);

	// =============================
	//   PIN MARKER DISPLAY SECTION
	// =============================
	const fetchPins = useCallback(async () => {
		console.log('🔄 [WORLDMAP] Fetching pins from backend via remap.ts');
		console.log('🔐 [WORLDMAP] User authenticated:', isAuthenticated);
		console.log('👤 [WORLDMAP] Current user:', user?.id);

		setIsLoadingPins(true);
		setPinError(null);

		try {
			console.log('🔧 [WORLDMAP] Creating RemapClient...');
			const remapClient = new RemapClient();

			let result;

			if (isAuthenticated && user) {
				// Authenticated user: Get all pins they should see
				console.log(
					'📡 [WORLDMAP] Fetching user pins (includes private + social)'
				);
				result = await remapClient.getUserPins();
			} else {
				// Non-authenticated user: Only public pins
				console.log('📡 [WORLDMAP] Fetching public pins only');
				result = await remapClient.getPublicPins();
			}

			console.log('📡 [WORLDMAP] Backend response:', result);

			const success = processPinsResponse(result);

			if (!success) {
				console.log(
					'❌ [WORLDMAP] Failed to process pins, not retrying automatically'
				);
			}
		} catch (error) {
			console.error(
				'💥 [WORLDMAP] Error fetching pins via remap.ts:',
				error
			);
			setPinError(
				`Failed to load pins: ${
					error instanceof Error ? error.message : 'Unknown error'
				}`
			);
			setRealPins([]);
		} finally {
			setIsLoadingPins(false);
		}
	}, [processPinsResponse, isAuthenticated, user]);
>>>>>>> 13d4256c699d9b048d56625de6074c3413f684c7

	function debounce(func: Function, wait: number) {
		let timeout: ReturnType<typeof setTimeout>;
		return function executedFunction(...args: any[]) {
			const later = () => {
				clearTimeout(timeout);
				func(...args);
			};
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
		};
	}

	const onMapRegionChange = useCallback(
		async (region: any) => {
			console.log('🗺️ [WORLDMAP] Map region changed (debounced)');

			// Don't reload if already loading
			if (isLoadingPins) {
				console.log('⏳ [WORLDMAP] Already loading pins, skipping');
				return;
			}

			// Create viewport from region
			const viewport = remapClient.createViewportFromMapRegion(region);

			// Create cache key for this viewport
			const cacheKey = `${viewport.northEast.latitude.toFixed(
				3
			)},${viewport.northEast.longitude.toFixed(
				3
			)},${viewport.southWest.latitude.toFixed(
				3
			)},${viewport.southWest.longitude.toFixed(3)}`;

			// Check if we already have this data cached
			if (pinCache.has(cacheKey) && lastViewport === cacheKey) {
				console.log('📦 [WORLDMAP] Using cached pins for viewport');
				setRealPins(pinCache.get(cacheKey)!);
				return;
			}

			setIsLoadingPins(true);
			setPinError(null);

			try {
<<<<<<< HEAD
				const result = await remapClient.fetchAllVisiblePins(viewport);

				if (result.success && result.data) {
					console.log(
						`✅ [WORLDMAP] Loaded ${result.data.length} pins for new region`
					);

					// Cache the results
					setPinCache(
						(prev) => new Map(prev.set(cacheKey, result.data!))
					);
					setLastViewport(cacheKey);
					setRealPins(result.data);
=======
				const remapClient = new RemapClient();

				let result;

				if (isAuthenticated && user) {
					// Authenticated user: Get all pins they should see
					result = await remapClient.getUserPins();
>>>>>>> 13d4256c699d9b048d56625de6074c3413f684c7
				} else {
					// Non-authenticated user: Only public pins
					result = await remapClient.getPublicPins();
				}

				const success = processPinsResponse(result);

				if (!success) {
					onMapRegionChange(region);
				}
			} catch (error) {
				console.error(
					'💥 [WORLDMAP] Error fetching pins for new region via remap.ts:',
					error
				);
				setPinError('Unexpected error loading pins');
			} finally {
				setIsLoadingPins(false);
			}
		},
<<<<<<< HEAD
		[isLoadingPins, remapClient, pinCache, lastViewport]
=======
		[isLoadingPins, processPinsResponse, isAuthenticated, user]
>>>>>>> 13d4256c699d9b048d56625de6074c3413f684c7
	);

	// Add debounced version with longer delay
	const debouncedOnMapRegionChange = useCallback(
		debounce(onMapRegionChange, 1000), // Increased to 1 second
		[onMapRegionChange]
	);

	// =========================
	//   WORLDMAP PAGE RENDER
	// =========================
	console.log('🎯 [WORLDMAP] About to render', realPins.length, 'pins');
	console.log(
		'🎯 [WORLDMAP] Pin coordinates:',
<<<<<<< HEAD
		realPins.map((p) => `${p.name}: ${p.latitude}, ${p.longitude}`)
=======
		realPins.map(
			(p) =>
				`${p.name}: ${p.coordinate.latitude}, ${p.coordinate.longitude}`
		)
>>>>>>> 13d4256c699d9b048d56625de6074c3413f684c7
	);
	return (
		<GestureHandlerRootView style={styles.container}>
			{/* ==================== */}
			{/*   TOP NOTIFICATION    */}
			{/* ==================== */}
			<TopNotificationSheet
				isVisible={isNotificationVisible}
				title={notification?.title || ''}
				message={notification?.message || ''}
				onClose={hideNotification}
				autoCloseDelay={notification?.autoCloseDelay || 3000}
				onPress={notification?.onPress}
			/>

			{/**********************************************/}
			{/******** AUTOCOMPLETE SLIDE FROM TOP *********/}
			{/* *********************************************/}
			{searchVisible && (
				<Animated.View
					style={[
						styles.animatedSearchContainer,
						{ transform: [{ translateY: slideAnim }] },
					]}
				>
					<NominatimSearch
						onSelect={onLocationSelect}
						placeholder="Search location..."
					/>
				</Animated.View>
			)}

			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<KeyboardAvoidingView
					style={styles.keyboardAvoidingView}
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				>
					{/**********************************************/}
					{/**************** MAIN CONTENT ****************/}
					{/* *********************************************/}
					<MainContent>
						{/* ************ */}
						{/*   MAP VIEW   */}
						{/* ************ */}
						<MapView
							ref={mapRef}
							style={styles.mapFlex}
							provider={PROVIDER_GOOGLE}
							initialRegion={INITIAL_REGION}
							showsUserLocation
							showsMyLocationButton
							onRegionChangeComplete={debouncedOnMapRegionChange}
						>
							<Marker
								title="Holberton School"
								description="Holberton Campus - Collins Street"
								coordinate={{
									latitude: -37.817979,
									longitude: 144.960408,
								}}
							>
								<Image
									source={require('../assets/images/holberton_logo.jpg')}
									style={{ width: 60, height: 60 }}
									resizeMode="contain"
								/>
							</Marker>

							{/* **************************************** */}
							{/*   REAL PINS FROM BACKEND               */}
							{/* **************************************** */}
							{realPins.map((pin) => (
								<Marker
									key={pin.id}
									coordinate={{
										latitude: pin.latitude,
										longitude: pin.longitude,
									}}
									onPress={() => {
										handleMarkerPress(
											{
												latitude: pin.latitude,
												longitude: pin.longitude,
											},
											pin
										);
									}}
									title={pin.name}
									description={pin.description}
								>
									<View
										style={[
											styles.customMarker,
											{
												backgroundColor: getMarkerColor(
													pin.visibility
												),
											},
										]}
									>
										<Text style={styles.markerIcon}>
											📍
										</Text>
									</View>
								</Marker>
							))}

							{/* **************************************** */}
							{/*   SEARCH MARKER + TOPSHEET NOTIFICATION  */}
							{/* **************************************** */}
							{searchResultLocation && (
								<Marker
									coordinate={{
										latitude: searchResultLocation.latitude,
										longitude:
											searchResultLocation.longitude,
									}}
									title="Search Result"
									description={searchResultLocation.address}
									pinColor="blue"
									onPress={() => {
										// AUTHENTICATION CHECK
										if (!isAuthenticated) {
											showNotification(
												'Sign In Required',
												'Please sign in to create memory pins',
												'info',
												4000,
												() => {
													signInModal.open(); // Open sign-in modal instead
												}
											);
											return;
										}

										// AUTHENTICATED USER - Show create pin option
										showNotification(
											'Create Memory Pin?',
											'Tap here to create a memory at this location',
											'info',
											5000,
											() => {
												router.navigate({
													pathname: '/createPin',
													params: {
														prefilledLocation:
															JSON.stringify({
																latitude:
																	searchResultLocation.latitude,
																longitude:
																	searchResultLocation.longitude,
																address:
																	searchResultLocation.address,
															}),
													},
												});
											}
										);
									}}
								/>
							)}

							{/* ************************ */}
							{/*   LOADING PIN INDICATOR  */}
							{/* ************************ */}
							{isLoadingPins && (
								<View style={styles.loadingOverlay}>
									<Text style={styles.loadingText}>
										Loading pins...
									</Text>
								</View>
							)}
						</MapView>

						{/* ATTRIBUTION - Policy requirement */}
						<View style={styles.attributionContainer}>
							<Text style={styles.attributionText}>
								© OpenStreetMap contributors
							</Text>
						</View>

						{/* PIN ERROR */}
						{pinError && (
							<View style={styles.errorContainer}>
								<Text style={styles.errorText}>
									⚠️ {pinError}
								</Text>
								<TouchableOpacity
									onPress={() => {
<<<<<<< HEAD
										setPinError(null);
										// Trigger a fresh fetch with current map region
										if (mapRef.current) {
											mapRef.current
												.getMapBoundaries()
												.then((bounds) => {
													if (bounds) {
														const region = {
															latitude:
																(bounds
																	.northEast
																	.latitude +
																	bounds
																		.southWest
																		.latitude) /
																2,
															longitude:
																(bounds
																	.northEast
																	.longitude +
																	bounds
																		.southWest
																		.longitude) /
																2,
															latitudeDelta:
																bounds.northEast
																	.latitude -
																bounds.southWest
																	.latitude,
															longitudeDelta:
																bounds.northEast
																	.longitude -
																bounds.southWest
																	.longitude,
														};
														onMapRegionChange(
															region
														);
													}
												});
										}
=======
										console.log(
											'🔄 [WORLDMAP] Retry button tapped'
										);
										fetchPins();
>>>>>>> 13d4256c699d9b048d56625de6074c3413f684c7
									}}
									style={styles.retryButton}
								>
									<Text style={styles.retryText}>Retry</Text>
								</TouchableOpacity>
							</View>
						)}
						{/* ************************ */}
						{/*   OVERLAY UI CONTROLS    */}
						{/* ************************ */}
						<View
							style={[
								styles.topOverlayContainer,
								{ top: insets.top },
							]}
						>
							<View style={styles.circleDropdownContainer}>
								<Dropdown
									style={styles.circleDropdown}
									selectedTextStyle={styles.dropdownText}
									placeholderStyle={styles.dropdownText}
									itemTextStyle={styles.dropdownItemText}
									containerStyle={
										styles.dropdownListContainer
									}
									data={circleData}
									labelField="label"
									valueField="value"
									placeholder="Select circle"
									value={circle}
									onChange={(item) => {
										setCircle(item.value);
										console.log('selected', item);
									}}
								/>
							</View>

							<IconButton
								icon="user"
								onPress={
									user
										? navigateToProfile
										: isAuthenticated
										? profileModal.open
										: goBack
								}
								style={styles.profileIcon}
							/>
						</View>

						<View style={styles.starterPackOverlay}>
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								contentContainerStyle={
									styles.starterPackScrollContainer
								}
							>
<<<<<<< HEAD
								{starterPacks.map((pack, index) => {
									const isSelected =
										selectedPack === pack.value;
=======
								{STARTER_PACKS.map((pack) => {
									const isSelected = selectedPack === pack.id;
>>>>>>> 13d4256c699d9b048d56625de6074c3413f684c7

									return (
										<TouchableOpacity
											key={pack.id}
											style={[
												styles.starterPackButton,
												isSelected &&
													styles.selectedStarterPackButton,
											]}
											onPress={() => {
<<<<<<< HEAD
												if (
													selectedPack === pack.value
												) {
													setSelectedPack(null);
												} else {
													setSelectedPack(pack.value);
=======
												if (selectedPack === pack.id) {
													setSelectedPack(null);
												} else {
													setSelectedPack(pack.id);
>>>>>>> 13d4256c699d9b048d56625de6074c3413f684c7
												}
											}}
										>
											<Text
												style={styles.starterPackText}
											>
												{pack.icon} {pack.name}
											</Text>
										</TouchableOpacity>
									);
								})}
							</ScrollView>
						</View>

						{/**********************************************/}
						{/************ UNDER MAP CONTENT ***************/}
						{/**********************************************/}
						<View style={styles.scrollContent}>
							<TouchableOpacity
								style={
									searchVisible
										? styles.fakeInputClose
										: styles.fakeInput
								}
								onPress={
									searchVisible ? closeSearch : openSearch
								}
							>
								<Text
									style={{
										color: searchVisible
											? 'white'
											: ReMapColors.ui.textSecondary,
									}}
								>
									{searchVisible
										? 'Close'
										: 'Search Location'}
								</Text>
							</TouchableOpacity>
						</View>
						{/* ******************************** */}
						{/*  FILTER CONTROLS (STARTER PACK)  */}
						{/* ******************************** */}
					</MainContent>

					{/**********************************************/}
					{/****************** FOOTER *******************/}
					{/* *********************************************/}
					<Footer>
						<View style={styles.footerContainer}>
							<Button
								variant="simple"
								onPress={
									isAuthenticated
										? navigateToCreatePin
										: signInModal.open //fix this to the proper create user/login prompt
								}
								style={styles.addPinButton}
<<<<<<< HEAD
								textStyle={{
									fontSize: 17,
									fontWeight: '500',
								}}
=======
>>>>>>> 13d4256c699d9b048d56625de6074c3413f684c7
							>
								Add Pin
							</Button>
						</View>
					</Footer>

					{/**********************/}
					{/* LOGIN/SIGNUP MODAL UI */}
					{/**********************/}
					<AuthModal
						isVisible={signInModal.isVisible}
						onToggle={signInModal.close}
						onSignInSuccess={() => {
							refreshAuth();
							signInModal.close();
						}}
						styles={styles}
					/>
					{/********************/}
					{/*   PROFILE MODAL  */}
					{/********************/}
					<Modal
						isVisible={profileModal.isVisible}
						onBackdropPress={profileModal.close}
					>
						<Modal.Container>
							<Modal.Header
								title={`Hello, ${userDisplayName}! 👋`}
							/>
							<Modal.Body>
								<View style={styles.profileContent}>
									<BodyText style={styles.profileEmail}>
										📧 {user?.email}
									</BodyText>
									<CaptionText style={styles.profileMeta}>
										Member since{' '}
										{user
											? new Date(
													user.created_at
											  ).toLocaleDateString()
											: ''}
									</CaptionText>
									<BodyText style={styles.profileMessage}>
										Full profile page coming soon! For now,
										you can sign out if needed.
									</BodyText>
								</View>
							</Modal.Body>
							<Modal.Footer>
								<Button
									onPress={handleSignOut}
									style={[
										styles.modalButton,
										styles.signOutButton,
									]}
								>
									🚪 Sign Out
								</Button>
								<Button
									onPress={profileModal.close}
									style={[
										styles.modalButton,
										styles.cancelButton,
									]}
								>
									Stay Signed In
								</Button>
							</Modal.Footer>
						</Modal.Container>
					</Modal>
				</KeyboardAvoidingView>
			</TouchableWithoutFeedback>

			{/* ==================== */}
			{/*   PIN BOTTOMSHEET    */}
			{/* ==================== */}
			<ViewPinBottomSheet
				isVisible={isBottomSheetVisible}
				onClose={handleBottomSheetClose}
				pins={selectedPins}
				currentIndex={currentPinIndex}
				onChangeIndex={handlePinIndexChange}
			/>
		</GestureHandlerRootView>
	);
}

// =========================================================================
//   							STYLE SHEET
// =========================================================================
const styles = StyleSheet.create({
	// ==================
	//   CONTAINER STYLES
	// ==================
	container: {
		flex: 1,
	},
	keyboardAvoidingView: {
		flex: 1,
	},
	scrollContent: {
		backgroundColor: ReMapColors.ui.cardBackground,
		borderRadius: 35,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		marginTop: -5,
		padding: 20,
		shadowColor: ReMapColors.primary.black,
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},

	// =====================
	//   TYPOGRAPHY STYLES
	// =====================
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		color: ReMapColors.ui.text,
		marginBottom: 8,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 16,
		color: ReMapColors.ui.textSecondary,
		textAlign: 'center',
		marginBottom: 30,
	},
	circleName: {
		color: ReMapColors.ui.text,
		fontSize: 14,
	},

	// ===============
	//   MAP STYLES
	// ===============
	// map: {
	// 	width: '100%',
	// 	height: '81%',
	// },
	mapFlex: {
		flex: 1,
		width: '100%',
		height: 645,
	},
	mapContent: {
		backgroundColor: ReMapColors.primary.accent,
		borderRadius: 16,
		height: 35,
		left: '25%',
		position: 'absolute',
		top: '8%',
		width: '50%',
	},

	// ==================
	//   CUSTOM MARKERS
	// ==================
	customMarker: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 2,
		borderColor: '#FFFFFF',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 3,
		elevation: 5,
	},
	markerIcon: {
		fontSize: 16,
		color: '#FFFFFF',
	},

	// ==========================
	//   OVERLAY UI CONTROLS
	// ==========================
	topOverlayContainer: {
		position: 'absolute',
		width: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-end',
		paddingRight: 12,
		height: 'auto',
		top: 0,
	},
	circleDropdownContainer: {
		position: 'absolute',
		left: 0,
		right: 0,
		alignItems: 'center',
		zIndex: 1,
	},
	circleDropdown: {
		height: 35,
		borderWidth: 1,
		borderRadius: 20,
		paddingHorizontal: 8,
		minWidth: 160,
		backgroundColor: ReMapColors.primary.black,
		opacity: 0.5,
	},
	dropdownText: {
		color: 'white',
		fontSize: 14,
		textAlign: 'center',
		paddingLeft: 16,
		fontWeight: '500',
	},
	dropdownItemText: {
		color: ReMapColors.primary.black,
		fontSize: 14,
		paddingVertical: 2,
		paddingHorizontal: 5,
		textAlign: 'center',
	},
	dropdownListContainer: {
		backgroundColor: ReMapColors.ui.cardBackground,
		borderRadius: 30,
	},

	starterPackOverlay: {
		position: 'absolute',
		bottom: 105,
		marginRight: 75,
		zIndex: 3,
	},
	starterPackScrollContainer: {
		paddingHorizontal: 10,
	},
	starterPackButton: {
		backgroundColor: ReMapColors.primary.black,
		opacity: 0.4,
		borderRadius: 16,
		marginRight: 10,
		paddingVertical: 10,
		paddingHorizontal: 16,
	},
	selectedStarterPackButton: {
		backgroundColor: ReMapColors.primary.black,
		opacity: 1,
	},
	starterPackText: {
		fontSize: 14,
		fontWeight: '400',
		color: ReMapColors.ui.cardBackground,
	},

	profileIcon: {
		zIndex: 2,
	},

	// =================
	//   SEARCH STYLES
	// =================
	searchContent: {
		backgroundColor: ReMapColors.ui.cardBackground,
		borderRadius: 35,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		shadowColor: ReMapColors.primary.black,
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		height: 130,
	},
	search: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	fakeInput: {
		backgroundColor: ReMapColors.ui.grey,
		borderColor: ReMapColors.ui.grey,
		borderRadius: 20,
		borderWidth: 1,
		marginHorizontal: 20,
		marginTop: 10,
		padding: 12,
	},
	fakeInputClose: {
		backgroundColor: ReMapColors.primary.black,
		borderRadius: 20,
		marginHorizontal: 20,
		marginTop: 10,
		padding: 12,
		width: 120,
		alignItems: 'center',
		alignSelf: 'center',
	},
	animatedSearchContainer: {
		backgroundColor: 'white',
		borderRadius: 30,
		elevation: 10,
		height: '15%',
		left: 0,
		paddingHorizontal: 20,
		paddingTop: 50,
		position: 'absolute',
		right: 0,
		shadowColor: ReMapColors.ui.textSecondary,
		shadowOpacity: 0.5,
		shadowRadius: 10,
		top: 0,
		zIndex: 1000,
	},
	closeButton: {
		alignSelf: 'flex-end',
		backgroundColor: '#2900E2',
		borderRadius: 8,
		marginTop: 10,
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
	closeButtonText: {
		color: 'white',
		fontWeight: 'bold',
	},

	// ==================
	//  FILTER CONTROLS
	// ==================
	filterControls: {
		backgroundColor: ReMapColors.ui.cardBackground,
		padding: 16,
		borderRadius: 12,
		marginBottom: 10,
		borderLeftWidth: 4,
		borderLeftColor: ReMapColors.primary.violet,
	},
	filterHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	filterStatus: {
		flex: 1,
		color: ReMapColors.ui.text,
	},
	filterToggle: {
		backgroundColor: ReMapColors.primary.violet,
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 16,
	},
	selectedCategories: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	categoryChip: {
		backgroundColor: ReMapColors.ui.background,
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: ReMapColors.primary.violet,
	},
	categoryChipText: {
		color: ReMapColors.primary.violet,
		fontSize: 11,
	},

	// ==================
	//   FOOTER STYLES
	// ==================
	footerContainer: {
		flexDirection: 'row',
		justifyContent: 'space-evenly',
		alignItems: 'center',
		width: '100%',
	},
	addPinButton: {
		backgroundColor: ReMapColors.primary.black,
		width: '85%',
		borderRadius: 24,
		height: 64,
	},

	// ================
	//   MODAL STYLES
	// ================
	modalButton: {
		width: 'auto',
	},
	modalButtonContainer: {
		flexDirection: 'column',
		alignItems: 'center',
	},
	signUpButton: {
		backgroundColor: '#2900E2',
	},
	cancelButton: {
		backgroundColor: ReMapColors.ui.textSecondary,
	},

	// =======================
	// 	PROFILE MODAL STYLES
	// =======================
	profileContent: {
		alignItems: 'center',
		padding: 10,
	},
	profileEmail: {
		marginBottom: 4,
		fontSize: 16,
	},
	profileMeta: {
		marginBottom: 20,
		color: ReMapColors.ui.textSecondary,
	},
	profileMessage: {
		textAlign: 'center',
		color: ReMapColors.ui.textSecondary,
		lineHeight: 22,
	},
	signOutButton: {
		backgroundColor: ReMapColors.semantic.error,
	},

	// =======================
	// 	REAL PINS STYLES
	// =======================
	loadingOverlay: {
		position: 'absolute',
		top: 50,
		left: 20,
		backgroundColor: 'rgba(0,0,0,0.7)',
		padding: 8,
		borderRadius: 8,
	},
	loadingText: {
		color: 'white',
		fontSize: 12,
	},
	errorContainer: {
		position: 'absolute',
		top: 100,
		left: 20,
		right: 20,
		backgroundColor: '#FEF2F2',
		padding: 16,
		borderRadius: 8,
		borderLeftWidth: 4,
		borderLeftColor: '#EF4444',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	errorText: {
		color: '#991B1B',
		flex: 1,
		fontSize: 14,
	},
	retryButton: {
		backgroundColor: '#EF4444',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 4,
	},
	retryText: {
		color: 'white',
		fontSize: 12,
		fontWeight: '600',
	},

	// Nomminatim Policy
	attributionContainer: {
		position: 'absolute',
		bottom: 80,
		left: 10,
		backgroundColor: 'rgba(255,255,255,0.8)',
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 4,
	},
	attributionText: {
		fontSize: 10,
		color: ReMapColors.ui.textSecondary,
	},
});
