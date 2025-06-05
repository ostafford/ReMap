// ================
//   CORE IMPORTS
// ================
import React, { useRef, useMemo } from 'react';
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
import axios from 'axios';
import { FoursquareSearch } from '@/components/ui/FourSquareSearch';


// ========================
//   COMPONENT DEFINITION
// ========================
export default function WorldMapScreen() {
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
	const mapRef = useRef<MapView>(null);

	return (
		<GestureHandlerRootView style={styles.container}>
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
						>
							<Image
								source={require('../assets/images/holberton_logo.jpg')}
								style={{ width: 60, height: 60 }}
								resizeMode="contain"
							/>
						</Marker>
					</MapView>
					<View style={styles.mapContent}>
						<Text></Text>
					</View>
				</View>

				{/* NOTE: Under map content with Typography components */}
				<View style={styles.scrollContent}>
					<View style={styles.search}>

						{/* ===============================
							//   FOURSQUARE AUTOCOMPLETE 
							// ============================ */}
						<FoursquareSearch
							onSelect={(item) => {
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
							}}
						/>
					</View>
				</View>
			</MainContent>

			{/**********************************************/}
			{/****************** FOOTER *******************/}
			{/* *********************************************/}
			<Footer>
				<View style={styles.footerContainer}>
					<IconButton icon="reply" onPress={goBack}></IconButton>
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
		height: 620,
	},
	mapContent: {
		backgroundColor: ReMapColors.primary.accent, // this colour is just for examples sake - not gonna be purple
		borderRadius: 12,
		height: 30,
		left:'25%',
		position:'absolute',
		top:'8%',
		width:'50%',
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
});
