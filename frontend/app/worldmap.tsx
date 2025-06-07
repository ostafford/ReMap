import { useLocalSearchParams } from 'expo-router';
import {
	DUMMY_PINS,
	filterPinsByStarterPacks,
	convertToMapMarker,
	type DummyPin,
} from '@/assets/dummyPinData';

// ================
//   CORE IMPORTS
// ================
import React, { useRef, useMemo, useEffect, useState } from 'react';
import {
	Alert,
	Image,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	Text,
	TouchableWithoutFeedback,
	View,
	Animated,
	Dimensions,
	TouchableOpacity,
} from 'react-native';

// =======================
//   THIRD-PARTY IMPORTS
// =======================
import { router } from 'expo-router';
import { ReMapColors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import BottomSheet from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// ================================
//   INTERNAL 'UI' COMPONENTS
// ================================
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/TextInput';
import { IconButton } from '@/components/ui/IconButton';

// ============================
//   INTERNAL 'LAYOUT' COMPONENTS
// ============================
import { Header } from '@/components/layout/Header';
import { MainContent } from '@/components/layout/MainContent';
import { Footer } from '@/components/layout/Footer';
import { getCurrentUser } from '@/services/auth';
import { signOut } from '@/services/auth';

// ================================
//   INTERNAL 'TYPOGRAPHY' IMPORTS
// ================================
import { HeaderText, BodyText, LabelText } from '@/components/ui/Typography';

// ==================================
//   FOURSQUARE AUTOCOMPLETE IMPORTS
// ==================================
import axios from 'axios';
import { FoursquareSearch } from '@/components/ui/FourSquareSearch';
import type { Suggestion } from '@/components/ui/FourSquareSearch';

const { height } = Dimensions.get('window');

// ========================
//   COMPONENT DEFINITION
// ========================
export default function WorldMapScreen() {
	// ==================
	//   EVENT HANDLERS
	// ==================
	const goBack = () => {
		router.replace('/');
	};
	const navigateToWorldMap = () => {
		router.replace('/worldmap');
	};
	const navigateToCreatePin = () => {
		router.replace('/createPin');
	};

	// ==================
	//   MODAL STATE
	// ==================
	const [isModalVisible, setIsModalVisible] = React.useState(false);
	const [modalMode, setModalMode] = React.useState<'login' | 'signup'>(
		'login'
	);

	const openLoginModal = () => {
		setModalMode('login');
		setIsModalVisible(true);
	};

	// ================
	//   MAP SETTINGS
	// ================
	const INITIAL_REGION = {
		latitude: -37.817979,
		longitude: 144.960408,
		latitudeDelta: 0.01,
		longitudeDelta: 0.01,
	};

	// =========================================
	//   \/\/\/ OKKY DOING SOME TESTING \/\/\/
	// =========================================
	// Auth Checks
	const [currentUser, setCurrentUser] = useState<any>(null);
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);

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

	// Profile Modal
	const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);

	const openProfileModal = () => setIsProfileModalVisible(true);
	const closeProfileModal = () => setIsProfileModalVisible(false);

	const handleSignOut = async () => {
		try {
			await signOut();
			setCurrentUser(null);
			closeProfileModal();
			router.replace('/'); // Navigate back to splash
		} catch (error) {
			console.error('Sign out error:', error);
		}
	};
	const { userPreferences } = useLocalSearchParams();
	const [userStarterPacks, setUserStarterPacks] = useState<any>(null);
	const [filteredPins, setFilteredPins] = useState<DummyPin[]>(DUMMY_PINS);
	const [showPersonalizedPins, setShowPersonalizedPins] = useState(false);

	// ===============================
	//   ADD THIS USEEFFECT
	// ===============================
	// Add this useEffect to parse user preferences and filter pins:

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

	// ===============================
	//   ADD THESE HELPER FUNCTIONS
	// ===============================
	// Add these functions to your component:

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

	const getFilterStatusText = () => {
		if (!userStarterPacks?.selectedIds?.length) {
			return 'Showing all locations';
		}

		if (showPersonalizedPins) {
			return `Showing ${userStarterPacks.selectedIds.length} interest categories (${filteredPins.length} pins)`;
		}

		return `Showing all locations (${filteredPins.length} pins)`;
	};

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

	// ====================================
	//   ^^^ OKKY DOING SOME TESTING ^^^
	// ====================================
	const mapRef = useRef<MapView>(null);

	// ===================================
	//   AUTOCOMPLETE SEARCH SETUP
	// ===================================
	const [searchVisible, setSearchVisible] = useState(false);
	const slideAnim = useRef(new Animated.Value(-100)).current;

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

	// =========================
	//   WORLDMAP PAGE RENDER
	// =========================
	return (
		<>
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
								<MapView
									ref={mapRef}
									style={styles.map}
									provider={PROVIDER_GOOGLE}
									initialRegion={INITIAL_REGION}
									showsUserLocation
									showsMyLocationButton
								>
									{/* Existing Holberton marker */}
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

									{/* Dynamic pins based on user preferences */}
									{filteredPins.map((pin) => {
										const marker = convertToMapMarker(pin);
										return (
											<Marker
												key={marker.id}
												coordinate={marker.coordinate}
												title={marker.title}
												description={marker.description}
												onPress={() => {
													// Optional: Handle pin press to show memory details
													console.log(
														'Pin pressed:',
														pin.name,
														pin.memory?.title
													);
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
													<Text
														style={
															styles.markerIcon
														}
													>
														{marker.icon}
													</Text>
												</View>
											</Marker>
										);
									})}
								</MapView>
								<View style={styles.mapContent}>
									<Text></Text>
								</View>

								{/* Filter Controls Section */}
								{userStarterPacks &&
									userStarterPacks.selectedIds?.length >
										0 && (
										<View style={styles.filterControls}>
											<View style={styles.filterHeader}>
												<CaptionText
													style={styles.filterStatus}
												>
													{getFilterStatusText()}
												</CaptionText>
												<Button
													onPress={
														togglePersonalizedView
													}
													style={styles.filterToggle}
													size="small"
												>
													{showPersonalizedPins
														? 'Show All'
														: 'My Interests'}
												</Button>
											</View>

											{/* Show selected categories */}
											<View
												style={
													styles.selectedCategories
												}
											>
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

							{/* NOTE: Under map content with Typography components */}
							<View style={styles.scrollContent}>
								<TouchableOpacity
									style={styles.fakeInput}
									onPress={
										searchVisible ? closeSearch : openSearch
									}
								>
									<Text
										style={{
											color: ReMapColors.ui.textSecondary,
										}}
									>
										{searchVisible
											? 'Close'
											: 'Search Location'}
									</Text>
								</TouchableOpacity>
							</View>
						</MainContent>

						{/**********************************************/}
						{/****************** FOOTER *******************/}
						{/* *********************************************/}
						<Footer>
							<View style={styles.footerContainer}>
								<IconButton
									icon="reply"
									onPress={goBack}
								></IconButton>
								<IconButton
									icon="map-pin"
									onPress={navigateToCreatePin}
								></IconButton>
								<IconButton
									icon="user"
									onPress={openLoginModal}
								></IconButton>
								<IconButton
									icon="list"
									onPress={navigateToCreatePin}
								></IconButton>

								{/* Login/Signup Modal */}
								<Modal
									isVisible={isModalVisible}
									onBackdropPress={() =>
										setIsModalVisible(false)
									}
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
											<View
												style={
													styles.modalButtonContainer
												}
											>
												<Button
													onPress={() =>
														setModalMode(
															modalMode ===
																'login'
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
														modalMode ===
															'signup' &&
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
							</View>
						</Footer>

						{/* ATTN OKKY: Profile Modal fof signed in users to sign out */}
						<Modal
							isVisible={isProfileModalVisible}
							onBackdropPress={closeProfileModal}
						>
							<Modal.Container>
								<Modal.Header
									title={`Hello, ${
										currentUser?.email?.split('@')[0] ||
										'User'
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
											Full profile page coming soon! For
											now, you can sign out if needed.
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
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	keyboardAvoidingView: {
		flex: 1,
	},
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
	map: {
		width: '100%',
		height: 650,
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
	scrollContent: {
		padding: 20,
	},
	search: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	backButton: {
		backgroundColor: ReMapColors.primary.black,
	},
	modalButton: {
		width: 'auto',
	},
	signUpButton: {
		backgroundColor: '#2900E2',
	},
	cancelButton: {
		backgroundColor: ReMapColors.ui.textSecondary,
	},
	footerContainer: {
		flexDirection: 'row',
	},
	modalButtonContainer: {
		flexDirection: 'column',
		alignItems: 'center',
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

	// Okky's Sign Out Testing Modal
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

	// Custom Markers
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
	closeButtonText: {
		color: 'white',
		fontWeight: 'bold',
	},
});
