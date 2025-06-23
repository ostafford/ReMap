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
import { instancedMesh } from 'three/tsl';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';

// ===========================
//   FOURSQUARE API IMPORTS
// ===========================
import { FoursquareSearch } from '@/components/ui/FourSquareSearch';
import type { Suggestion } from '@/components/ui/FourSquareSearch';

// =========================================================================
//   						INTERNAL IMPORTS
// =========================================================================

// =========================
//   CUSTOM HOOKS IMPORTS
// =========================
import { AuthModal } from '@/components/ui/AuthModal';
import { PinBottomSheet } from '@/components/ui/PinBottomSheet';
import { useAuth } from '@/hooks/shared/useAuth';
import { useModal } from '@/hooks/shared/useModal';
import { useSlideAnimation } from '@/hooks/useSlideAnimation';
import { useNotificationSheet } from '@/hooks/shared/useNotificationSheet';
import { useNotification } from '@/contexts/NotificationContext';
import {
	fetchAllVisiblePins,
	createViewportFromMapRegion,
	type MapPin,
} from '@/services/pinsService';

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
import { getCurrentUser, signOut } from '@/services/auth';

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
	} = useNotification();

	// ================
	//   MAP SETTINGS
	// ================
	const INITIAL_REGION = {
		latitude: -37.817979,
		longitude: 144.960408,
		latitudeDelta: 0.01,
		longitudeDelta: 0.01,
	};

	const mapRef = useRef<MapView>(null);

	// ==================
	//   MOCK CIRCLE DATA
	// ==================
	const mockCircles = [
		{
			name: 'Circle 1',
			avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
		},
		{
			name: 'Circle 2',
			avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
		},
		{
			name: 'Circle 3',
			avatar: 'https://randomuser.me/api/portraits/men/56.jpg',
		},
		{
			name: 'Circle 4',
			avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
		},
		{
			name: 'Circle 5',
			avatar: 'https://randomuser.me/api/portraits/men/72.jpg',
		},
	];

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
		pinData?: any // Updated to accept the transformed pin data
	) => {
		if (pinData) {
			setSelectedPinData(pinData);
			setIsBottomSheetVisible(true);
			console.log(
				'📍 Opening BottomSheet for pin:',
				pinData.memory?.title || pinData.name
			);
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
		};

		return colorMap[visibilityValue || 'public'] || '#666666';
	};

	// =============================
	//   BOTTOMSHEET STATE
	// =============================
	const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
	const [selectedPinData, setSelectedPinData] = useState<any>(null);

	const handleBottomSheetClose = () => {
		setIsBottomSheetVisible(false);
		setSelectedPinData(null);
		console.log('📍 BottomSheet closed');
	};

	// =============================
	//   SEARCH FUNCTIONALITY SECTION
	// =============================
	const [searchVisible, setSearchVisible] = useState(false);
	const slideAnim = useRef(new Animated.Value(-100)).current;

	// Search handlers
	const openSearch = () => {
		setSearchVisible(true);
		Animated.timing(slideAnim, {
			toValue: 0,
			duration: 300,
			useNativeDriver: true,
		}).start();
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

	const onSelectSuggestion = (item: Suggestion) => {
		closeSearch();
		if (
			'geocodes' in item &&
			item.geocodes?.main?.latitude !== undefined &&
			item.geocodes?.main?.longitude !== undefined
		) {
			const { latitude, longitude } = item.geocodes.main;
			mapRef.current?.animateToRegion({
				latitude,
				longitude,
				latitudeDelta: 0.01,
				longitudeDelta: 0.01,
			});
		} else {
			Alert.alert('Location data is not available');
		}
	};

	// =============================
	//   SOCIAL CIRCLES SECTION
	// =============================
	const socialsAnimation = useSlideAnimation({
		animationType: 'spring',
		springConfig: {
			damping: 15,
			stiffness: 120,
			mass: 1,
		},
	});

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
	const [realPins, setRealPins] = useState<MapPin[]>([]);
	const [isLoadingPins, setIsLoadingPins] = useState(false);
	const [pinError, setPinError] = useState<string | null>(null);

	const fetchPins = useCallback(async () => {
		console.log('🔄 [WORLDMAP] Fetching pins from backend (static)');
		setIsLoadingPins(true);
		setPinError(null);

		try {
			// Use a large viewport to get all nearby pins
			const wideRegion = {
				latitude: -37.817979,
				longitude: 144.960408,
				latitudeDelta: 1.0, // Much wider area
				longitudeDelta: 1.0,
			};

			const viewport = createViewportFromMapRegion(wideRegion);
			const result = await fetchAllVisiblePins(viewport);

			if (result.success) {
				console.log(
					`✅ [WORLDMAP] Loaded ${result.data.length} pins (static)`
				);
				setRealPins(result.data);
			} else {
				console.error(
					'❌ [WORLDMAP] Failed to load pins:',
					result.error
				);
				setPinError(result.error || 'Failed to load pins');
				setRealPins([]);
			}
		} catch (error) {
			console.error('💥 [WORLDMAP] Error fetching pins:', error);
			setPinError('Unexpected error loading pins');
			setRealPins([]);
		} finally {
			console.log('🏁 [WORLDMAP] Setting isLoadingPins to false');
			setIsLoadingPins(false); // This should clear "Loading pins..."
		}
	}, []);

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

			setIsLoadingPins(true);
			setPinError(null);

			try {
				const viewport = createViewportFromMapRegion(region);
				const result = await fetchAllVisiblePins(viewport);

				if (result.success) {
					console.log(
						`✅ [WORLDMAP] Loaded ${result.data.length} pins for new region`
					);
					setRealPins(result.data);
				} else {
					console.error(
						'❌ [WORLDMAP] Failed to load pins for new region:',
						result.error
					);
					setPinError(result.error || 'Failed to load pins');
				}
			} catch (error) {
				console.error(
					'💥 [WORLDMAP] Error fetching pins for new region:',
					error
				);
				setPinError('Unexpected error loading pins');
			} finally {
				setIsLoadingPins(false);
			}
		},
		[isLoadingPins]
	);

	// Add debounced version
	const debouncedOnMapRegionChange = useCallback(
		debounce(onMapRegionChange, 500), // Wait 500ms after user stops panning
		[onMapRegionChange]
	);

	// Load pins when component mounts
	useEffect(() => {
		fetchPins();
	}, [fetchPins]);

	// =========================
	//   WORLDMAP PAGE RENDER
	// =========================
	console.log('🎯 [WORLDMAP] About to render', realPins.length, 'pins');
	console.log(
		'🎯 [WORLDMAP] Pin coordinates:',
		realPins.map(
			(p) =>
				`${p.title}: ${p.coordinate.latitude}, ${p.coordinate.longitude}`
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
					<FoursquareSearch
						onSelect={onSelectSuggestion}
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
							// onRegionChangeComplete={debouncedOnMapRegionChange}
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

							{/* Real pins from backend */}
							{realPins.map((pin) => (
								<Marker
									key={pin.id}
									coordinate={pin.coordinate}
									onPress={() => {
										handleMarkerPress(
											pin.coordinate,
											pin.pinData
										);
									}}
									title={pin.title}
									description={pin.description}
								>
									<View
										style={[
											styles.customMarker,
											{
												backgroundColor: getMarkerColor(
													pin.pinData.memory
														.visibility
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

							{/* Loading indicator for pins */}
							{isLoadingPins && (
								<View style={styles.loadingOverlay}>
									<Text style={styles.loadingText}>
										Loading pins...
									</Text>
								</View>
							)}
						</MapView>
						{/* PIN ERROR */}
						{pinError && (
							<View style={styles.errorContainer}>
								<Text style={styles.errorText}>
									⚠️ {pinError}
								</Text>
								<TouchableOpacity
									onPress={fetchPins}
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
								styles.circlesContainer,
								{ top: insets.top + 100 },
							]}
						>
							{/* Social Circles with Animation (Drop-Down) */}
							<View style={{ alignItems: 'flex-end' }}>
								<ScrollView
									contentContainerStyle={styles.socialsList}
								>
									{mockCircles.map((circle, index) => (
										<TouchableOpacity
											key={index}
											style={styles.socialCircleWrapper}
										>
											<Image
												source={{
													uri: circle.avatar,
												}}
												style={styles.socialCircleImage}
											/>
										</TouchableOpacity>
									))}
								</ScrollView>
							</View>
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
							<IconButton
								icon={
									isAuthenticated ? 'address-card' : 'reply'
								}
								onPress={
									user
										? navigateToProfile
										: isAuthenticated
										? profileModal.open
										: goBack
								}
							/>
							<IconButton
								icon={isAuthenticated ? 'map-pin' : 'user'}
								onPress={
									isAuthenticated
										? navigateToCreatePin
										: signInModal.open
								}
								size={36}
								style={styles.bigCenterButton}
							/>
							<IconButton
								icon="sliders"
								onPress={navigateToCreatePin}
							/>
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
			<PinBottomSheet
				isVisible={isBottomSheetVisible}
				onClose={handleBottomSheetClose}
				pinData={selectedPinData}
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
	circlesContainer: {
		paddingRight: 12,
		alignItems: 'flex-end',
		justifyContent: 'center',
		height: 'auto',
		position: 'absolute',
		width: '100%',
		top: 50,
	},
	circleSelections: {
		width: 54,
		height: 54,
		borderRadius: 27,
		zIndex: 5,
	},

	// ==========================
	//   SOCIAL CIRCLES STYLES
	// ==========================
	socialSelection: {
		width: 54,
		height: 54,
		borderRadius: 35,
		zIndex: 5,
	},
	socialsBacking: {
		marginTop: 8,
		backgroundColor: ReMapColors.ui.grey,
		opacity: 0.1,
		borderRadius: 20,
		maxHeight: 200,
		width: 54,
		overflow: 'hidden',
	},
	socialsList: {
		alignItems: 'center',
	},
	socialCircleWrapper: {
		marginBottom: 12,
	},
	socialCircleImage: {
		width: 44,
		height: 44,
		borderRadius: 22,
		borderWidth: 2,
		borderColor: ReMapColors.primary.accent,
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
		width: '55%',
	},
	backButton: {
		backgroundColor: ReMapColors.primary.black,
	},
	bigCenterButton: {
		width: 72,
		height: 72,
		borderRadius: 36,
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

	// NEW STYLES FOR REAL PINS
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
});
