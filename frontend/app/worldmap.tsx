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
import { PinBottomSheet } from '@/components/ui/PinBottomSheet';
import { useAuth } from '@/hooks/shared/useAuth';
import { useModal } from '@/hooks/shared/useModal';
import { useSlideAnimation } from '@/hooks/useSlideAnimation';
import { useNotification } from '@/contexts/NotificationContext';

// ======================
//  LAYOUT COMPONENTS
// ======================
import { Header } from '@/components/layout/Header';
import { MainContent } from '@/components/layout/MainContent';
import { Footer } from '@/components/layout/Footer';

// =================
//   UI COMPONENTS
// =================
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
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

// =========================
//   UTILITY FUNCTIONS
// =========================

interface MapPin {
	id: string;
	name: string;
	description: string;
	coordinate: {
		latitude: number;
		longitude: number;
	};
	pinData: {
		id: string;
		name: string;
		description: string;
		location: {
			location_query: string;
			latitude: number;
			longitude: number;
		};
		media: {
			photos: { uri: string }[];
			videos: { uri: string }[];
			audio: { uri: string } | null;
		};
		owner: {
			username: string;
			avatar_url: string | null;
			display_name: string | null;
		};
		visibility: string;
		created_at: string;
		social_circle_ids: string[];
	};
}

function formatPins(pins: Awaited<ReturnType<RemapClient['getPublicPins']>>) {
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


			// Public pins: Show to everyone (no filtering needed)

			const isValid =
				validLat &&
				validLng &&
				notZeroZero &&
				notExtreme;

			return isValid;
		});

		// Transform backend data to MapPin format with new user data structure
		const formattedPins: MapPin[] = [];
		const seenIds = new Set<string>();

		for (const pin of validPins) {
			// Skip if we've already seen this pin ID
			if (seenIds.has(pin.id)) {
				console.log(`🚫 [WORLDMAP] Skipping duplicate pin with ID: ${pin.id}`);
				continue;
			}

			seenIds.add(pin.id);

			formattedPins.push({
				id: pin.id,
				name: pin.name,
				description: pin.description,
				coordinate: {
					latitude: pin.latitude,
					longitude: pin.longitude,
				},
				// PinData for BottomSheet - flattened structure
				pinData: {
					id: pin.id,
					name: pin.name,
					description: pin.description,
					location: {
						location_query:
							pin.location_query || "Unknown location",
						latitude: pin.latitude,
						longitude: pin.longitude,
					},
					media: {
						photos: pin.image_urls
							? pin.image_urls.map((url: string) => ({
									uri: url,
								}))
							: [],
						videos: [], // TODO: Add video support when backend provides it
						audio: pin.audio_url
							? { uri: pin.audio_url }
							: null,
					},
					owner: {
						username: pin.owner?.username || "Unknown User",
						avatar_url: pin.owner?.avatar_url || null,
						display_name: pin.owner?.full_name || null,
					},
					visibility: pin.private_pin
						? "private"
						: pin.visibility || "public",
					social_circle_ids: pin.social_circle_ids || [],
					created_at: pin.created_at,
				},
			});
		}

		return formattedPins;
	}

	return [];
}

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

	const [selectedCircle, setSelectedCircle] = useState<string>('global');
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
	// Map handlers
	const handleMarkerPress = (
		coordinate: {
			latitude: number;
			longitude: number;
		},
		pinData?: any
	) => {
		if (pinData) {
			// Find all pins at the same location
			const pinsAtLocation = visiblePins.filter((pin) => {
				const latDiff = Math.abs(
					pin.coordinate.latitude - coordinate.latitude
				);
				const lngDiff = Math.abs(
					pin.coordinate.longitude - coordinate.longitude
				);
				// Use a small threshold to consider pins at the "same" location
				return latDiff < 0.0001 && lngDiff < 0.0001;
			});

			if (pinsAtLocation.length > 1) {
				// Multiple pins at this location
				const allPinData = pinsAtLocation.map((pin) => pin.pinData);
				const currentIndex = allPinData.findIndex(
					(pin) => pin.id === pinData.id
				);

				setAllPinsAtLocation(allPinData);
				setCurrentPinIndex(currentIndex >= 0 ? currentIndex : 0);
				setSelectedPinData(pinData);
			} else {
				// Single pin at this location
				setAllPinsAtLocation([]);
				setCurrentPinIndex(0);
				setSelectedPinData(pinData);
			}
		}
	};

	// Map helper functions (CALLOUT ETC)
	const getMarkerColor = (visibility?: string | string[]): string => {
		// Handle both single string and array formats
		const visibilityValue = Array.isArray(visibility)
			? visibility[0]
			: visibility;

		const colorMap: { [key: string]: string } = {
			public: '#4CAF50', // Green for public
			private: '#2196F3', // Blue for private
			social: '#9C27B0', // Purple for social circles
			// We can change these colours later as well ^^^^^^^^^
		};

		return colorMap[visibilityValue || 'public'] || '#666666';
	};

	// =============================
	//   BOTTOMSHEET STATE
	// =============================
	const [selectedPinData, setSelectedPinData] = useState<any>(null);
	const [allPinsAtLocation, setAllPinsAtLocation] = useState<any[]>([]);
	const [currentPinIndex, setCurrentPinIndex] = useState<number>(0);

	const handleBottomSheetClose = () => {
		setSelectedPinData(null);
		setAllPinsAtLocation([]);
		setCurrentPinIndex(0);
	};

	const handleNextPin = () => {
		if (allPinsAtLocation.length > 1) {
			const nextIndex = (currentPinIndex + 1) % allPinsAtLocation.length;
			setCurrentPinIndex(nextIndex);
			setSelectedPinData(allPinsAtLocation[nextIndex]);
		}
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
	// TO DO: remove "any" type and replace with proper types
	const [allPins, setAllPins] = useState<MapPin[]>([]); // All pins from backend
	const [isLoadingPins, setIsLoadingPins] = useState(false);
	const [pinError, setPinError] = useState<string | null>(null);

	const visiblePins = useMemo(() => {
		if (selectedCircle === 'global') {
			return allPins;
		}

		if (selectedCircle === 'private') {
			return allPins.filter((pin) => pin.pinData.visibility === 'private');
		}

		return allPins.filter((pin) => pin.pinData.social_circle_ids.includes(selectedCircle));
	}, [selectedCircle, allPins]);

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

			const [publicPins, userPins] = await Promise.all([
				remapClient.getPublicPins(),
				remapClient.getUserPins(),
			]);

			const formattedPins = formatPins([
				...publicPins,
				...userPins
			]);

			setAllPins(formattedPins);
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
		} finally {
			setIsLoadingPins(false);
		}
	}, [setAllPins, setIsLoadingPins, setPinError]);

	// Load pins when component mounts
	useEffect(() => {
		fetchPins();
	}, [fetchPins]);

	// =========================
	//   WORLDMAP PAGE RENDER
	// =========================
	console.log('🎯 [WORLDMAP] About to render', visiblePins.length, 'pins');
	console.log(
		'🎯 [WORLDMAP] Pin coordinates:',
		visiblePins.map(
			(p) =>
				`${p.name}: ${p.coordinate.latitude}, ${p.coordinate.longitude}`
		)
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
					<MainContent scrollable={false}>
						{/* ************ */}
						{/*   MAP VIEW   */}
						{/* ************ */}
						<MapView
							// Issue with map not updating when selectedCircle changes
							// see https://www.reddit.com/r/reactnative/comments/1hx1xed/react_native_map_marker_not_rendering_on_mount/
							key={`map-${selectedCircle}-${visiblePins.length}`}
							ref={mapRef}
							style={styles.mapFlex}
							provider={PROVIDER_GOOGLE}
							initialRegion={INITIAL_REGION}
							showsUserLocation
							showsMyLocationButton
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

							{/* ************************ */}
							{/*      PIN FROM BACKEND    */}
							{/* ************************ */}
							{visiblePins.map((pin) => {
								// Helper function to detect pins at the same location
								const getPinsAtLocation = (coordinate: {
									latitude: number;
									longitude: number;
								}) => {
									return visiblePins.filter((pin) => {
										const latDiff = Math.abs(
											pin.coordinate.latitude - coordinate.latitude
										);
										const lngDiff = Math.abs(
											pin.coordinate.longitude - coordinate.longitude
										);
										// Use a small threshold to consider pins at the "same" location
										return latDiff < 0.0001 && lngDiff < 0.0001;
									});
								};

								const pinsAtLocation = getPinsAtLocation(
									pin.coordinate
								);

								const hasMultiplePins =
									pinsAtLocation.length > 1;

								return (
									<Marker
										key={pin.id}
										coordinate={pin.coordinate}
										onPress={() => {
											handleMarkerPress(
												pin.coordinate,
												pin.pinData
											);
										}}
										title={pin.name}
										description={pin.description}
									>
										<View
											style={[
												styles.customMarker,
												{
													backgroundColor:
														getMarkerColor(
															pin.pinData
																.visibility
														),
												},
											]}
										>
											<Text style={styles.markerIcon}>
												📍
											</Text>

											{/* Badge for multiple pins */}
											{hasMultiplePins && (
												<View style={styles.pinBadge}>
													<Text
														style={styles.badgeText}
													>
														{pinsAtLocation.length}
													</Text>
												</View>
											)}
										</View>
									</Marker>
								);
							})}

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
										console.log(
											'🔄 [WORLDMAP] Retry button tapped'
										);
										fetchPins();
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
									containerStyle={styles.dropdownListContainer}
									data={circleData}
									labelField="label"
									valueField="value"
									placeholder="Select circle"
									value={selectedCircle}
									onChange={(item) => {
										setSelectedCircle(item.value);
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
								{STARTER_PACKS.map((pack) => {
									const isSelected = selectedPack === pack.id;

									return (
										<TouchableOpacity
											key={pack.id}
											style={[
												styles.starterPackButton,
												isSelected &&
													styles.selectedStarterPackButton,
											]}
											onPress={() => {
												if (selectedPack === pack.id) {
													setSelectedPack(null);
												} else {
													setSelectedPack(pack.id);
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
			{selectedPinData && (
				<PinBottomSheet
					pinData={selectedPinData}
					allPinsAtLocation={allPinsAtLocation}
					currentPinIndex={currentPinIndex}
					onClose={handleBottomSheetClose}
					onNextPin={handleNextPin}
				/>
			)}
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
		elevation: 5,
	},
	markerIcon: {
		fontSize: 16,
		color: '#FFFFFF',
	},
	pinBadge: {
		position: 'absolute',
		top: -5,
		right: -5,
		backgroundColor: '#FF6B35', // Orange badge
		borderRadius: 10,
		minWidth: 20,
		height: 20,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 2,
		borderColor: '#FFFFFF',
		elevation: 3,
	},
	badgeText: {
		color: '#FFFFFF',
		fontSize: 12,
		fontWeight: 'bold',
		textAlign: 'center',
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
