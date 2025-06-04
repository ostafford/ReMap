import { useLocalSearchParams } from 'expo-router';
import {
	DUMMY_PINS,
	filterPinsByStarterPacks,
	convertToMapMarker,
	type DummyPin,
} from '@/assets/dummyPinData';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Components imports
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/TextInput';
import { IconButton } from '@/components/ui/IconButton';
import { Header } from '@/components/layout/Header';
import { MainContent } from '@/components/layout/MainContent';
import { Footer } from '@/components/layout/Footer';
import { getCurrentUser } from '@/services/auth';
import { signOut } from '@/services/auth';

// Map imports
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';

// Fancy schmancy modal library imports
import BottomSheet from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BodyText, CaptionText } from '@/components/ui/Typography';

import {
	ReMapColors,
	StarterPackColors,
	MemoryThemes,
	AccessibleColors,
} from '@/constants/Colors';

export default function WorldMapScreen() {
	// to make sure page isnt going over status bar region
	const insets = useSafeAreaInsets();

	// Page Navigation
	const goBack = () => {
		router.back();
	};
	const navigateToWorldMap = () => {
		router.replace('/worldmap');
	};
	const navigateToCreatePin = () => {
		router.replace('/createPin');
	};

	// Modals
	const [isModalVisible, setIsModalVisible] = React.useState(false);
	const [modalMode, setModalMode] = React.useState<'login' | 'signup'>(
		'login'
	);

	const openLoginModal = () => {
		setModalMode('login');
		setIsModalVisible(true);
	};

	// BottomSheet
	const bottomSheetRef = useRef<BottomSheet>(null);
	const snapPoints = useMemo(() => ['50%'], []);
	const [bottomSheetIndex, setBottomSheetIndex] = React.useState(-1);

	const openBottomSheet = () => setBottomSheetIndex(0);
	const closeBottomSheet = () => setBottomSheetIndex(-1);

	// Setting up MAP
	const INITIAL_REGION = {
		// Holberton coordinates
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
		return (
			StarterPackColors[category as keyof typeof StarterPackColors] ||
			ReMapColors.ui.textSecondary
		);
	};

	// =====================================
	// ENHANCED MARKER STYLES
	// =====================================

	// Add these new marker style variants
	const getMarkerStyle = (pin: DummyPin, isSelected: boolean = false) => {
		const baseColor = getMarkerColor(pin.starterPackCategory);
		const memoryType = determineMemoryType(pin.memory);

		return {
			backgroundColor: baseColor,
			borderColor: isSelected
				? ReMapColors.adventure.goldenHour
				: '#FFFFFF',
			borderWidth: isSelected ? 3 : 2,
			// Add subtle gradient effect for adventure memories
			shadowColor:
				memoryType === 'adventure'
					? ReMapColors.adventure.sunsetOrange
					: '#000',
			shadowOpacity: memoryType === 'adventure' ? 0.4 : 0.3,
			// Larger size for exciting memories
			transform: [{ scale: memoryType === 'exciting' ? 1.2 : 1.0 }],
		};
	};

	// Helper function to determine memory type from memory data
	const determineMemoryType = (
		memory: any
	): keyof typeof ReMapColors.memory => {
		const title = memory.title.toLowerCase();
		const description = memory.description.toLowerCase();

		// Simple keyword-based categorization
		if (
			title.includes('adventure') ||
			description.includes('exciting') ||
			description.includes('amazing')
		) {
			return 'adventure';
		}
		if (
			title.includes('peaceful') ||
			description.includes('calm') ||
			description.includes('quiet')
		) {
			return 'peaceful';
		}
		if (
			title.includes('friend') ||
			description.includes('together') ||
			description.includes('family')
		) {
			return 'shared';
		}
		if (
			description.includes('amazing') ||
			title.includes('incredible') ||
			description.includes('thrilling')
		) {
			return 'exciting';
		}

		return 'personal'; // default
	};

	// =====================================
	// ENHANCED FILTER CONTROLS STYLING
	// =====================================

	// Update your filter controls section with new colors
	const EnhancedFilterControls = ({
		userStarterPacks,
		showPersonalizedPins,
		togglePersonalizedView,
		filteredPins,
		getFilterStatusText,
	}: any) => (
		<View
			style={[
				styles.filterControls,
				{
					backgroundColor: ReMapColors.ui.surface, // Softer than pure white
					borderLeftColor: ReMapColors.earth.forestGreen, // More natural than violet
					shadowColor: ReMapColors.earth.deepForest,
				},
			]}
		>
			<View style={styles.filterHeader}>
				<CaptionText
					style={[
						styles.filterStatus,
						{
							color: ReMapColors.ui.text,
						},
					]}
				>
					{getFilterStatusText()}
				</CaptionText>
				<Button
					onPress={togglePersonalizedView}
					style={[
						styles.filterToggle,
						{
							backgroundColor: showPersonalizedPins
								? ReMapColors.adventure.sunsetOrange
								: ReMapColors.earth.sageGreen,
						},
					]}
					size="small"
				>
					{showPersonalizedPins ? 'Show All' : 'My Interests'}
				</Button>
			</View>

			{/* Enhanced category chips with memory themes */}
			<View style={styles.selectedCategories}>
				{userStarterPacks.starterPacks.map((pack: any) => (
					<View
						key={pack.id}
						style={[
							styles.categoryChip,
							{
								backgroundColor: ReMapColors.vintage.parchment, // Warmer background
								borderColor:
									StarterPackColors[pack.id] ||
									ReMapColors.earth.warmBrown,
								// Add subtle shadow for depth
								shadowColor:
									StarterPackColors[pack.id] ||
									ReMapColors.earth.deepForest,
								shadowOffset: { width: 0, height: 1 },
								shadowOpacity: 0.2,
								shadowRadius: 2,
								elevation: 2,
							},
						]}
					>
						<CaptionText
							style={[
								styles.categoryChipText,
								{
									color:
										StarterPackColors[pack.id] ||
										ReMapColors.earth.deepForest,
								},
							]}
						>
							{pack.icon} {pack.name}
						</CaptionText>
					</View>
				))}
			</View>
		</View>
	);

	// =====================================
	// THEMED MEMORY PREVIEW
	// =====================================

	// Add this new component for when users tap on pins
	const MemoryPreviewCard = ({
		pin,
		onClose,
	}: {
		pin: DummyPin;
		onClose: () => void;
	}) => {
		const memoryType = determineMemoryType(pin.memory);
		const theme = getMemoryTheme(memoryType);

		return (
			<View
				style={[
					styles.memoryPreview,
					{
						backgroundColor: theme.background,
						borderLeftColor: theme.primary,
					},
				]}
			>
				<View style={styles.memoryHeader}>
					<Text style={[styles.memoryTitle, { color: theme.text }]}>
						{pin.memory.title}
					</Text>
					<TouchableOpacity
						onPress={onClose}
						style={styles.closeButton}
					>
						<Text style={{ color: theme.primary }}>✕</Text>
					</TouchableOpacity>
				</View>

				<Text
					style={[styles.memoryLocation, { color: theme.secondary }]}
				>
					📍 {pin.name}
				</Text>

				<Text style={[styles.memoryDescription, { color: theme.text }]}>
					{pin.memory.description.substring(0, 150)}...
				</Text>

				<View style={styles.memoryMeta}>
					<Text
						style={[
							styles.memoryAuthor,
							{ color: theme.secondary },
						]}
					>
						by {pin.memory.author}
					</Text>
					<View
						style={[
							styles.memoryTypeTag,
							{ backgroundColor: theme.primary },
						]}
					>
						<Text
							style={[
								styles.memoryTypeText,
								{ color: theme.background },
							]}
						>
							{memoryType.charAt(0).toUpperCase() +
								memoryType.slice(1)}
						</Text>
					</View>
				</View>
			</View>
		);
	};

	// Helper function to get theme based on memory type
	const getMemoryTheme = (memoryType: keyof typeof ReMapColors.memory) => {
		switch (memoryType) {
			case 'adventure':
			case 'exciting':
				return MemoryThemes.adventure;
			case 'peaceful':
				return MemoryThemes.peaceful;
			case 'shared':
				return MemoryThemes.nature; // Social memories use nature theme
			default:
				return MemoryThemes.vintage; // Personal memories use vintage theme
		}
	};

	// ====================================
	//   ^^^ OKKY DOING SOME TESTING ^^^
	// ====================================

	return (
		//this bottom sheet honestly isn't working and im miserable
		<GestureHandlerRootView style={{ flex: 1 }}>
			<View style={styles.container}>
				<Header
					title="World Map"
					subtitle="Click on a pin and see what happens"
				></Header>

				{/**********************************************/}
				{/**************** MAIN CONTENT ****************/}
				{/* *********************************************/}
				<MainContent>
					<View>
						<MapView
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
											<Text style={styles.markerIcon}>
												{marker.icon}
											</Text>
										</View>
									</Marker>
								);
							})}
						</MapView>

						{/* Filter Controls Section */}
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
													style={styles.categoryChip}
												>
													<CaptionText
														style={
															styles.categoryChipText
														}
													>
														{pack.icon} {pack.name}
													</CaptionText>
												</View>
											)
										)}
									</View>
								</View>
							)}
					</View>

					{/* =========================================== */}
					{/* ============= UNDER MAP ================== */}
					{/* =========================================== */}
					<View style={styles.scrollContent}>
						<View style={styles.search}>
							<Input
								style={styles.searchInput}
								label="Search Location"
								placeholder="Search Location"
							/>
						</View>
					</View>
				</MainContent>

				<Footer>
					<View style={styles.footerContainer}>
						{!currentUser && (
							<IconButton
								icon="chevron-left"
								onPress={goBack}
							></IconButton>
						)}
						<IconButton
							icon="map-pin"
							onPress={navigateToCreatePin}
						></IconButton>

						<IconButton
							icon="user"
							onPress={
								currentUser ? openProfileModal : openLoginModal
							}
						></IconButton>

						<IconButton
							icon="sliders"
							onPress={navigateToCreatePin}
						></IconButton>

						{/* this is for the login / sign up modal */}
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
											style={[
												styles.modalButton,
												modalMode === 'signup' &&
													styles.signUpButton,
											]}
											onPress={navigateToWorldMap}
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
									Full profile page coming soon! For now, you
									can sign out if needed.
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

				{/* this is for the gorham bottomsheet for location&pin data */}
				<BottomSheet
					ref={bottomSheetRef}
					index={bottomSheetIndex}
					snapPoints={snapPoints}
					onChange={(index) => setBottomSheetIndex(index)}
				>
					<View
						style={{
							flex: 1,
							alignItems: 'center',
							justifyContent: 'center',
							padding: 20,
							backgroundColor: 'white',
						}}
					>
						<Text>Bottom Sheet Content</Text>
						<Button onPress={closeBottomSheet}>Close Sheet</Button>
					</View>
				</BottomSheet>
			</View>
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({
	container: {
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

	scrollContent: {
		padding: 20,
	},

	search: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	searchInput: {
		width: '100%',
	},
	backButton: {
		backgroundColor: ReMapColors.primary.black,
	},

	modalButton: {
		width: 150,
	},
	signUpButton: {
		backgroundColor: '#2900E2',
	},
	cancelButton: {
		backgroundColor: ReMapColors.ui.textSecondary,
	},
	modalButtonContainer: {
		flexDirection: 'column',
		alignItems: 'center',
	},
	footerContainer: {
		flexDirection: 'row',
	},

	map: {
		width: '100%',
		height: 500,
		borderRadius: 12,
	},

	// Okky's Sign Out Testing Modal

	filterControls: {
		backgroundColor: ReMapColors.ui.surface, // Softer than white
		padding: 16,
		borderRadius: 12,
		marginBottom: 10,
		borderLeftWidth: 4,
		borderLeftColor: ReMapColors.earth.forestGreen, // Natural accent
		shadowColor: ReMapColors.earth.deepForest,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
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
		backgroundColor: ReMapColors.earth.sageGreen,
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 16,
		shadowColor: ReMapColors.earth.deepForest,
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.2,
		shadowRadius: 2,
		elevation: 2,
	},

	// Enhanced category chips
	categoryChip: {
		backgroundColor: ReMapColors.vintage.parchment,
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 12,
		borderWidth: 1,
		marginRight: 8,
		marginBottom: 4,
	},

	categoryChipText: {
		fontSize: 11,
		fontWeight: '500',
	},

	// New memory preview styles
	memoryPreview: {
		position: 'absolute',
		bottom: 100,
		left: 20,
		right: 20,
		backgroundColor: ReMapColors.ui.cardBackground,
		borderRadius: 12,
		padding: 16,
		borderLeftWidth: 4,
		shadowColor: ReMapColors.earth.deepForest,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 8,
	},

	memoryHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		marginBottom: 8,
	},

	memoryTitle: {
		fontSize: 16,
		fontWeight: '600',
		flex: 1,
		marginRight: 8,
	},

	closeButton: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: ReMapColors.ui.surface,
		alignItems: 'center',
		justifyContent: 'center',
	},

	memoryLocation: {
		fontSize: 14,
		marginBottom: 8,
		fontWeight: '500',
	},

	memoryDescription: {
		fontSize: 14,
		lineHeight: 20,
		marginBottom: 12,
	},

	memoryMeta: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},

	memoryAuthor: {
		fontSize: 12,
		fontStyle: 'italic',
	},

	memoryTypeTag: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 8,
	},

	memoryTypeText: {
		fontSize: 11,
		fontWeight: '600',
		textTransform: 'uppercase',
	},

	// Enhanced marker styles
	customMarker: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 2,
		borderColor: '#FFFFFF',
		shadowColor: ReMapColors.earth.deepForest,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 3,
		elevation: 5,
	},
});
