// ================
//   CORE IMPORTS
// ================
import React, { useRef, useMemo, useState, useEffect } from 'react';
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
	ScrollView
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

// ================================
//   INTERNAL 'TYPOGRAPHY' IMPORTS
// ================================
import { HeaderText, BodyText, LabelText } from '@/components/ui/Typography';

// ==================================
//   FOURSQUARE AUTOCOMPLETE IMPORTS
// ==================================
import { FoursquareSearch } from '@/components/ui/FourSquareSearch';
import type { Suggestion } from '@/components/ui/FourSquareSearch';

// ==================================
//   SUPABASE FOR USER AUTH IMPORTS
// ==================================
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js';
import { instancedMesh } from 'three/tsl';


// ==================================
//   DUMMY CIRCLES
// ==================================
const mockCircles = [
  { name: 'Circle 1', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { name: 'Circle 2', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { name: 'Circle 3', avatar: 'https://randomuser.me/api/portraits/men/56.jpg' },
  { name: 'Circle 4', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { name: 'Circle 5', avatar: 'https://randomuser.me/api/portraits/men/72.jpg' },
];


// =========================================================================
//   						COMPONENT DEFINITION
// =========================================================================
export default function WorldMapScreen() {
	const { height } = Dimensions.get('window');
	const insets = useSafeAreaInsets();

	// ==================
	//   EVENT HANDLERS
	// ==================
	const goBack = () => {
		router.navigate('/onboarding/account');
	};
	const navigateToWorldMap = () => {
		router.navigate('/worldmap');
	};
	const navigateToCreatePin = () => {
		router.navigate('/createPin');
	};

	// =============================
	//   MODAL, LOGIN & AUTH STATE
	// =============================
	const [isModalVisible, setIsModalVisible] = React.useState(false);
	const [modalMode, setModalMode] = React.useState<'login' | 'signup'>('login');

	const openLoginModal = () => {
		if (user) {
			console.log('User logged in:', user.email);
		}
		setModalMode('login');
		setIsModalVisible(true);
	};

	// =====================
	//   USER AUTH SETUP
	// =====================
	const [user, setUser] = useState<User | null>(null);
	const [loadingSession, setLoadingSession] = useState<boolean>(true);

	useEffect(() => {
		const checkSession = async () => {
			const { data, error } = await supabase.auth.getSession();

			if (error) {
				console.log("Error fetching session:", error.message);
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

	const handleMarkerPress = (coordinate: {
		latitude: number;
		longitude: number
	}) => {
		mapRef.current?.animateToRegion({
			latitude: coordinate.latitude,
			longitude: coordinate.longitude,
			latitudeDelta: 0.01,
			longitudeDelta: 0.01,
		})
	}

	// =====================================
	//   SOCIALS CIRCLES SLIDING OUT SETUP
	// =====================================
	const [showSocials, setShowSocials] = useState(false);
	const socialsSlideAnim = useRef(new Animated.Value(-100)).current;

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
						<Marker
							title="Holberton School"
							description="Holberton Campus - Collins Street"
							coordinate={{
								latitude: -37.817979,
								longitude: 144.960408,
							}}
							onPress={() => handleMarkerPress({
								latitude: -37.817979,
								longitude: 144.960408
							})}
						>
							<Image
								source={require('../assets/images/holberton_logo.jpg')}
								style={{ width: 60, height: 60 }}
								resizeMode="contain"
							/>
						</Marker>
					</MapView>


					{/* <View style={styles.mapContent}>
						<Text></Text>
					</View> */}

					<View style={[styles.circlesContainer, { top: insets.top + 100 }]}>
						<IconButton
							icon="globe"
							onPress={navigateToCreatePin}
							size={28}
							style={styles.circleSelections}
						>
						</IconButton>
						<IconButton
							icon="user"
							onPress={navigateToCreatePin}
							size={28}
							style={styles.circleSelections}
						>
						</IconButton>
						
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
										transform: [{ translateY: socialsSlideAnim }],
										opacity: socialsSlideAnim.interpolate({
											inputRange: [-100, 0],
											outputRange: [0, 1],
											extrapolate: 'clamp',
										}),
									},
								]}
							>
								<ScrollView contentContainerStyle={styles.socialsList}>
									{mockCircles.map((circle, index) => (
										<TouchableOpacity key={index} style={styles.socialCircleWrapper}>
											<Image
												source={{ uri: circle.avatar }}
												style={styles.socialCircleImage}
											/>
										</TouchableOpacity>
									))}
								</ScrollView>
							</Animated.View>
						</View>
					</View>


				</View>

				{/**********************************************/}
				{/************ UNDER MAP CONTENT ***************/}
				{/* *********************************************/}
				<View style={styles.scrollContent}>
					<TouchableOpacity 
						style={searchVisible ? styles.fakeInputClose : styles.fakeInput} 
						onPress={searchVisible ? closeSearch : openSearch}
					>
						<Text style={{ color: searchVisible? 'white' : ReMapColors.ui.textSecondary }}>
							{searchVisible ? 'Close' : 'Search Location'}
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
						icon={user ? "address-card" : "reply"}
						onPress={goBack}>
					</IconButton>
					<IconButton
						icon={user ? "map-pin" : 'user'}
						onPress={user ? navigateToCreatePin: openLoginModal}
						size={36}
						style={styles.bigCenterButton}
					></IconButton>
					<IconButton
						icon="sliders"
						onPress={navigateToCreatePin}
					></IconButton>

					{/* Login/Signup Modal */}
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
				</View> 
			</Footer>

			

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
		height: 660,
	},
	// mapContent: {
	// 	backgroundColor: ReMapColors.primary.accent, // this colour is just for examples sake - not gonna be purple
	// 	borderRadius: 16,
	// 	height: 35,
	// 	left:'25%',
	// 	position:'absolute',
	// 	top:'8%',
	// 	width:'50%',
	// },
	circlesContainer: {
		paddingRight: 12,
		alignItems:'flex-end',
		height: 'auto',
		position:'absolute',
		width:'100%',
	},
	circleSelections: {
		width: 54,
		height: 54,
		borderRadius: 27,
		zIndex: 5,
	},
	socialSelection: {
		width: 54,
		height: 70,
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
	circleName: {
		color: ReMapColors.ui.text,
		fontSize: 14,
	},
	scrollContent: {
		padding: 10,
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
		justifyContent: 'space-evenly',
		alignItems: 'center',
		width: '55%',
	},
	bigCenterButton: {
		width: 72,
		height: 72,
		borderRadius: 36,
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
});
