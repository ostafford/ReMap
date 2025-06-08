// =========================================================================
//   						EXTERNAL IMPORTS
// =========================================================================
import React, { useRef, useMemo, useState, useEffect } from 'react';
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

// ==================================
//   SUPABASE FOR USER AUTH IMPORTS
// ==================================
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

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
// TODO: Add custom hooks here when/if we want to do them

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

// ======================
//   DUMMY DATA IMPORTS
// ======================
import {
	DUMMY_PINS,
	convertToMapMarker,
	filterPinsByStarterPacks,
	type DummyPin,
} from '@/assets/dummyPinData';

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
	const [currentUser, setCurrentUser] = useState<any>(null);
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);
	const [user, setUser] = useState<User | null>(null);
	const [loadingSession, setLoadingSession] = useState<boolean>(true);

	// Authentication useEffect hooks
	useEffect(() => {
		const checkUserAuth = async () => {
			try {
				const userInfo = await getCurrentUser();
				setCurrentUser(userInfo.user);
			} catch (error) {
				console.error('Error checking user auth:', error);
			} finally {
				setIsCheckingAuth(false);
			}
		};

		checkUserAuth();
	}, []);

	useEffect(() => {
		const checkSession = async () => {
			const { data, error } = await supabase.auth.getSession();

			if (error) {
				console.log('Error fetching session:', error.message);
				setUser(null);
			} else if (data?.session?.user) {
				setUser(data.session.user);
			} else {
				setUser(null);
			}
			setLoadingSession(false);
		};
		checkSession();
	}, []);

	// Authentication handlers
	const openLoginModal = () => {
		if (user) {
			console.log('User logged in:', user.email);
		}
		setModalMode('login');
		setIsModalVisible(true);
	};

	const handleSignOut = async () => {
		try {
			await signOut();
			setCurrentUser(null);
			closeProfileModal();
			router.replace('/');
		} catch (error) {
			console.error('Sign out error:', error);
		}
	};

	// =============================
	//   MODAL MANAGEMENT SECTION
	// =============================
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [modalMode, setModalMode] = useState<'login' | 'signup'>('login');
	const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);

	// Modal handlers
	const openProfileModal = () => setIsProfileModalVisible(true);
	const closeProfileModal = () => setIsProfileModalVisible(false);

	// =============================
	//   USER PREFERENCES & FILTERING SECTION
	// =============================
	const [userStarterPacks, setUserStarterPacks] = useState<any>(null);
	const [filteredPins, setFilteredPins] = useState<DummyPin[]>(DUMMY_PINS);
	const [showPersonalizedPins, setShowPersonalizedPins] = useState(false);

	// User preferences useEffect
	useEffect(() => {
		if (userPreferences) {
			try {
				const parsedPreferences = JSON.parse(userPreferences as string);
				setUserStarterPacks(parsedPreferences);

				// Filter pins based on user's starter pack selections
				if (
					parsedPreferences.selectedIds &&
					parsedPreferences.selectedIds.length > 0
				) {
					const filtered = filterPinsByStarterPacks(
						parsedPreferences.selectedIds
					);
					setFilteredPins(filtered);
					setShowPersonalizedPins(true);

					console.log('🎯 Filtered pins based on user preferences:', {
						selectedPacks: parsedPreferences.selectedIds,
						totalPins: filtered.length,
						categories: parsedPreferences.starterPacks.map(
							(p: any) => p.name
						),
					});
				}
			} catch (error) {
				console.error('Error parsing user preferences:', error);
			}
		}
	}, [userPreferences]);

	// Filtering handlers
	const togglePersonalizedView = () => {
		if (showPersonalizedPins && userStarterPacks?.selectedIds?.length > 0) {
			// Switch to all pins
			setFilteredPins(DUMMY_PINS);
			setShowPersonalizedPins(false);
		} else {
			// Switch to personalized pins
			if (userStarterPacks?.selectedIds?.length > 0) {
				const filtered = filterPinsByStarterPacks(
					userStarterPacks.selectedIds
				);
				setFilteredPins(filtered);
				setShowPersonalizedPins(true);
			}
		}
	};

	// Filter helper functions
	const getFilterStatusText = () => {
		if (!userStarterPacks?.selectedIds?.length) {
			return 'Showing all locations';
		}

		if (showPersonalizedPins) {
			return `Showing ${userStarterPacks.selectedIds.length} interest categories (${filteredPins.length} pins)`;
		}

		return `Showing all locations (${filteredPins.length} pins)`;
	};

	// =============================
	//   MAP INTERACTION SECTION
	// =============================
	// Map handlers
	const handleMarkerPress = (coordinate: {
		latitude: number;
		longitude: number;
	}) => {
		mapRef.current?.animateToRegion({
			latitude: coordinate.latitude,
			longitude: coordinate.longitude,
			latitudeDelta: 0.01,
			longitudeDelta: 0.01,
		});
	};

	// Map helper functions
	const getMarkerColor = (category: string): string => {
		const colorMap: { [key: string]: string } = {
			cafes: '#8B4513',
			nightlife: '#4A148C',
			foodie: '#FF5722',
			culture: '#9C27B0',
			nature: '#4CAF50',
			urban: '#2196F3',
		};
		return colorMap[category] || '#666666';
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
	const [showSocials, setShowSocials] = useState(false);
	const socialsSlideAnim = useRef(new Animated.Value(-100)).current;

	// Social circles handlers
	const toggleSocials = () => {
		Animated.spring(socialsSlideAnim, {
			toValue: showSocials ? -100 : 0,
			useNativeDriver: true,
			damping: 15,
			stiffness: 120,
			mass: 1,
		}).start(() => {
			setShowSocials(!showSocials);
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

	// =========================
	//   WORLDMAP PAGE RENDER
	// =========================
	return (
		<GestureHandlerRootView style={styles.container}>
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
					keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
				>
					{/**********************************************/}
					{/**************** MAIN CONTENT ****************/}
					{/* *********************************************/}
					<MainContent>
						<View>
							{/* ************ */}
							{/*   MAP VIEW   */}
							{/* ************ */}
							<MapView
								ref={mapRef}
								style={styles.map}
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
									// onPress={() =>
									// 	handleMarkerPress({
									// 		latitude: -37.817979,
									// 		longitude: 144.960408,
									// 	})
									// }
								>
									<Image
										source={require('../assets/images/holberton_logo.jpg')}
										style={{ width: 60, height: 60 }}
										resizeMode="contain"
									/>
								</Marker>

								{/* Dynamic pins based on user preferences with press handlers */}
								{filteredPins.map((pin) => {
									const marker = convertToMapMarker(pin);
									return (
										<Marker
											key={marker.id}
											coordinate={marker.coordinate}
											title={marker.title}
											description={marker.description}
											onPress={() => {
												// Handle pin press with both marker press animation AND optional memory details
												handleMarkerPress(
													marker.coordinate
												);
												// Optional: Handle pin press to show memory details
												// console.log(
												// 	'Pin pressed:',
												// 	pin.name,
												// 	pin.memory?.title
												// );
											}}
										>
											<View
												style={[
													styles.customMarker,
													{
														backgroundColor:
															getMarkerColor(
																pin.starterPackCategory
															),
													},
												]}
											>
												<Text style={styles.markerIcon}>
													{marker.icon}
												</Text>
											</View>
										</Marker>
									);
								})}
							</MapView>

							{/* ************************ */}
							{/*   OVERLAY UI CONTROLS    */}
							{/* ************************ */}
							<View
								style={[
									styles.circlesContainer,
									{ top: insets.top + 100 },
								]}
							>
								<IconButton
									icon="globe"
									onPress={navigateToCreatePin}
									size={28}
									style={styles.circleSelections}
								/>
								<IconButton
									icon="user"
									onPress={navigateToCreatePin}
									size={28}
									style={styles.circleSelections}
								/>

								{/* Social Circles with Animation (Drop-Down) */}
								<View style={{ alignItems: 'flex-end' }}>
									<IconButton
										icon="users"
										onPress={toggleSocials}
										size={28}
										style={styles.socialSelection}
									/>
									<Animated.View
										style={[
											styles.socialsBacking,
											{
												transform: [
													{
														translateY:
															socialsSlideAnim,
													},
												],
												opacity:
													socialsSlideAnim.interpolate(
														{
															inputRange: [
																-100, 0,
															],
															outputRange: [0, 1],
															extrapolate:
																'clamp',
														}
													),
											},
										]}
									>
										<ScrollView
											contentContainerStyle={
												styles.socialsList
											}
										>
											{mockCircles.map(
												(circle, index) => (
													<TouchableOpacity
														key={index}
														style={
															styles.socialCircleWrapper
														}
													>
														<Image
															source={{
																uri: circle.avatar,
															}}
															style={
																styles.socialCircleImage
															}
														/>
													</TouchableOpacity>
												)
											)}
										</ScrollView>
									</Animated.View>
								</View>
							</View>

							{/**********************************************/}
							{/************ UNDER MAP CONTENT ***************/}
							{/**********************************************/}
							<View style={styles.scrollContent}>
								<Text style={styles.remapTitle}>
									ReMap Your Journey
								</Text>
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
							{userStarterPacks &&
								userStarterPacks.selectedIds?.length > 0 && (
									<View style={styles.filterControls}>
										<View style={styles.filterHeader}>
											<CaptionText
												style={styles.filterStatus}
											>
												{getFilterStatusText()}
											</CaptionText>
											<Button
												onPress={togglePersonalizedView}
												style={styles.filterToggle}
												size="small"
											>
												{showPersonalizedPins
													? 'Show All'
													: 'My Interests'}
											</Button>
										</View>

										{/* Show selected categories */}
										<View style={styles.selectedCategories}>
											{userStarterPacks.starterPacks.map(
												(pack: any) => (
													<View
														key={pack.id}
														style={
															styles.categoryChip
														}
													>
														<CaptionText
															style={
																styles.categoryChipText
															}
														>
															{pack.icon}{' '}
															{pack.name}
														</CaptionText>
													</View>
												)
											)}
										</View>
									</View>
								)}
						</View>
					</MainContent>

					{/**********************************************/}
					{/****************** FOOTER *******************/}
					{/* *********************************************/}
					<Footer>
						<View style={styles.footerContainer}>
							{/* FOOTER OPTION 1: More features, conditional logic */}
							<IconButton
								icon={user ? 'address-card' : 'reply'}
								onPress={goBack}
							/>
							<IconButton
								icon={user ? 'map-pin' : 'user'}
								onPress={
									user ? navigateToCreatePin : openLoginModal
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
					{/* LOGIN/SIGNUP MODAL */}
					{/**********************/}
					<Modal
						isVisible={isModalVisible}
						onBackdropPress={() => setIsModalVisible(false)}
					>
						<Modal.Container>
							<Modal.Header
								title={
									modalMode === 'login'
										? 'Welcome Back!'
										: 'Join ReMap Community'
								}
							/>
							<Modal.Body>
								{modalMode === 'signup' && (
									<Input
										label="Full Name"
										placeholder="Enter your full name"
									/>
								)}
								<Input
									label="Email"
									placeholder="Enter your email"
									keyboardType="email-address"
								/>
								<Input
									label="Password"
									placeholder={
										modalMode === 'login'
											? 'Enter password'
											: 'Create a password'
									}
									secureTextEntry
									secureToggle
								/>
							</Modal.Body>
							<Modal.Footer>
								<View style={styles.modalButtonContainer}>
									<Button
										onPress={() =>
											setModalMode(
												modalMode === 'login'
													? 'signup'
													: 'login'
											)
										}
										style={[
											styles.modalButton,
											styles.cancelButton,
										]}
									>
										{modalMode === 'login'
											? 'New User'
											: 'Back to Login'}
									</Button>
									<Button
										onPress={navigateToWorldMap}
										style={[
											styles.modalButton,
											modalMode === 'signup' &&
												styles.signUpButton,
										]}
									>
										{modalMode === 'login'
											? 'Sign In'
											: 'Create Account'}
									</Button>
								</View>
							</Modal.Footer>
						</Modal.Container>
					</Modal>

					{/********************/}
					{/*   PROFILE MODAL  */}
					{/********************/}
					<Modal
						isVisible={isProfileModalVisible}
						onBackdropPress={closeProfileModal}
					>
						<Modal.Container>
							<Modal.Header
								title={`Hello, ${
									currentUser?.email?.split('@')[0] || 'User'
								}! 👋`}
							/>
							<Modal.Body>
								<View style={styles.profileContent}>
									<BodyText style={styles.profileEmail}>
										📧 {currentUser?.email}
									</BodyText>
									<CaptionText style={styles.profileMeta}>
										Member since{' '}
										{currentUser
											? new Date(
													currentUser.created_at
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
									onPress={closeProfileModal}
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
		</GestureHandlerRootView>
	);
}

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
	remapTitle: {
		fontSize: 34,
		alignSelf: 'center',
		padding: 8,
		fontWeight: 'bold',
	},
	circleName: {
		color: ReMapColors.ui.text,
		fontSize: 14,
	},

	// ===============
	//   MAP STYLES
	// ===============
	map: {
		width: '100%',
		height: 600,
	},
	mapContent: {
		backgroundColor: ReMapColors.primary.accent, // this colour is just for examples sake - not gonna be purple
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
});
