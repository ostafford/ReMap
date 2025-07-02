// =========================================================================
//   						EXTERNAL IMPORTS
// =========================================================================
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ==============================
//   	NAVIGATION IMPORTS
// ==============================
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	SafeAreaView,
	Image,
	Modal,
	FlatList,
	Pressable,
	TextInput
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/shared/useAuth';
import { Audio } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native';

// =================
//   UI COMPONENTS
// =================
import { ReMapColors } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';

import RemapClient from '../services/remap';


const Tab = createMaterialTopTabNavigator();

/*------------------------- Profile ----------------------------*/
function ProfileTab({ onSignOut }: { onSignOut: () => void }) {
	const [data, setData] = useState<Awaited<
		ReturnType<RemapClient['getProfile']>
	> | null>(null);

	useEffect(() => {
		loadData();

		async function loadData() {
			const _data = await new RemapClient().getProfile();

			console.log(_data);
			setData(_data);
		}
	}, []);

	return (
		<View style={styles.tabContent}>
			{/* Profile Picture Display */}
			{data?.avatar_url ? (
				<Image
					source={{ uri: data.avatar_url }}
					style={styles.profileImage}
					resizeMode="contain"
				/>
			) : (
				<View style={styles.profileImagePlaceholder}>
					<Text style={styles.profileImagePlaceholderText}>
						No Profile Picture
					</Text>
				</View>
			)}

			<Text style={styles.username}>Username: {data?.username}</Text>
			<Text>Full name: {data?.full_name}</Text>
			<Text>Total Pins</Text>
			<Text>{data?.pins}</Text>
			<Button
				onPress={onSignOut} // Connect the function here
				style={styles.circleButton}
				size="small"
				textColour="white"
			>
				Sign out
			</Button>
		</View>
	);
}


/*------------------------- Circle ----------------------------*/
function CirclesTab() {
	const [data, setData] = useState<Awaited<ReturnType<RemapClient['listCircles']>> | null>(null);

	const [modalVisible, setModalVisible] = useState(false);
	const [newCircle, setNewCircle] = useState('');

	const router = useRouter();

	const loadData = useCallback(async () => {
		try {
			const _data = await new RemapClient().listCircles();
			
			console.log(_data);
			setData(_data);
	
		} catch (error) {
			console.error('Error fetching circle:', error);
		}
	}, []);

	useEffect(() => {
		loadData();
	}, [loadData]);

	// Delete Circle
	async function deleteCircle(id: string) {
		try {
			await new RemapClient().deleteCircle(id);
			setData(prevData => prevData?.filter(circle => circle.id !== id) || null);

		} catch (error) {
			console.error("Error deleting circle:", error);
		}
	}
	
	return (
		<View style={styles.tabContent}>
			<Text>Your Circles</Text>

			<FlatList
				data={data}
				keyExtractor={(item, index) => {
					if (item && item.id) {
						return item.id.toString();
					}
					return `fallback-key-${index}`;
				}}
				renderItem={( {item} ) => (
					<View>
						<Text style={{fontSize: 20}}>{item ? item.name : 'No Name'}</Text>
						<Pressable
						onPress={() =>
							router.navigate({
								pathname: '/(user)/circle/[circleId]',
								params: { circleId: `${item.id.toString()}`}
							})
						}>
							<Text>View Circle</Text>
						</Pressable>

						<Button onPress={() => {
							deleteCircle(item.id.toString());
						}}>
							Delete Pin
						</Button>

					</View>
				)}
			/>

			<View style={styles.buttonContainer}>
				<Button
					onPress={ () => setModalVisible(true) }
					style={styles.circleButton}
					size="small"
					textColour="white"
				>
					Create
				</Button>
				<Text>Create New Circle</Text>
				<Button
					//onPress={}
					style={styles.circleButton}
					size="small"
					textColour="white"
				>
					Join
				</Button>
			</View>
		</View>
	);
}


/*------------------------- Pins ----------------------------*/
function PinsTab() {
	const router = useRouter();

	// Fetch Pins
	const [data, setData] = useState<Awaited<ReturnType<RemapClient['getUserPins']>> | null>(null);

	const loadData = useCallback(async () => {
		try {
			const _data = await new RemapClient().getUserPins();
			
			console.log(_data);
			setData(_data);
	
		} catch (error) {
			console.error('Error fetching pins:', error);
		}
	}, []);

	useEffect(() => {
		loadData();
	}, [loadData]);


	// Handle Audio
	const soundRef = useRef<Audio.Sound | null>(null);
	const [lastAudio, setLastAudio] = useState<string | null>(null);
	const [isPaused, setIsPaused] = useState(false);

	// Play Audio
	async function PlaySound(audio_url: string | undefined | null) {
		if (!audio_url) {
			console.warn("No audio url.");
			return;
		}

		// Check Pause Audio at a specific time.
		if (soundRef.current && isPaused && lastAudio === audio_url) {
			try {
				await soundRef.current.playAsync();
				setIsPaused(false);
				return;
			} catch (error) {
				console.error("Error resuming audio", error);
			}
		}

		// Stop Audio and press again = reset.
		try {
			if (soundRef.current) {
				await soundRef.current.unloadAsync();
				soundRef.current = null;
			}

			const { sound } = await Audio.Sound.createAsync(
				{ uri: audio_url },
				{ shouldPlay: true }
			);
			soundRef.current = sound;
			setLastAudio(audio_url);
			setIsPaused(false);

			// Track Audio
			sound.setOnPlaybackStatusUpdate((status) => {
				if (status.isLoaded && status.didJustFinish && !status.isLooping) {
					console.log("Audio Finished.");
					setLastAudio(null);
					setIsPaused(false);
				}
			})

		} catch (error) {
			console.error("Error playing audio", error);
		}
	}

	// Pause Audio
	const pauseSound = async () => {
		try {
			if (soundRef.current) {
				await soundRef.current.pauseAsync();
				setIsPaused(true);
			}
		} catch (error) {
			console.error("Error pausing audio", error);
		}
	};

	// Stop Audio
	const stopSound = async () => {
		try {
			if (soundRef.current) {
				await soundRef.current.stopAsync();
				setLastAudio(null);
			}
		} catch (error) {
			console.error("Error stopping audio", error);
		}
	};

	// Prevent memory leaks by unloading the audio when the component unmounts.
	useEffect(() => {
		return () => {
			if (soundRef.current) {
				soundRef.current?.unloadAsync();
				soundRef.current.setOnPlaybackStatusUpdate(null);
				soundRef.current = null;
				setLastAudio(null);
				setIsPaused(false);
			}
		};
	}, []);

	// Stop Audio from playing if not on page
	useFocusEffect(
		useCallback(() => {
			return () => {
				if (soundRef.current) {
					soundRef.current.unloadAsync();
					soundRef.current = null;
					setLastAudio(null); // reset audio state
					setIsPaused(false); // reset pause state
				}
			};
		}, [])
	);

	// Delete Pin
	async function deletePin(id: string) {
		try {
			await new RemapClient().deletePin(id);
			setData(prevData => prevData?.filter(pin => pin.id !== id) || null);

		} catch (error) {
			console.error("Error deleting pin:", error);
		}
	}

	return (
		<View style={styles.tabContent}>
			<Text>Your Pins</Text>
			<Text>pin display here</Text>
			<FlatList
				data={data}
				keyExtractor={(item, index) => {
					if (item && item.id) {
						return item.id.toString();
					}
					return `fallback-key-${index}`;
				}}
				renderItem={( {item} ) => (
					<View style={styles.tabContent}>
						<Text style={{fontSize: 20}}>{item ? item.name : 'No Name'}</Text>
						<Text style={{fontSize: 20}}>{item ? item.description : 'No Description'}</Text>
						
						{Array.isArray(item?.image_urls) && item.image_urls.length > 0 && (
							<Image
								source={{ uri: item.image_urls[0] }}
								style={{ width: 100, height: 100, resizeMode: 'cover' }}
							/>
						)}
						
						{item?.audio_url && (
						<>
						<Button onPress={() => PlaySound(item?.audio_url)}>
							Play
						</Button>
						<Button onPress={pauseSound}>
							Pause
						</Button>
						<Button onPress={stopSound}>
							Stop
						</Button>
						</>
						)}

						<Pressable
							onPress={() =>
								router.navigate({
									pathname: '/(user)/pin/[pinId]',
									params: { pinId: `${item.id.toString()}`}
								})
							}>
							<Text>View Pin</Text>
						</Pressable>

						<Button onPress={() => {
							deletePin(item.id.toString());
						}}>
							Delete Pin
						</Button>
					</View>
				)}
			/>

		</View>
	);
}

// Profile Screen
export default function ProfileScreen() {
	const insets = useSafeAreaInsets();
	const router = useRouter();

	const goBack = () => {
		router.back();
	};

	const { signOut, user } = useAuth();
	const handleSignOut = async () => {
		const success = await signOut();
		if (success) {
			router.replace('/');
		}
	};

	return (
		<SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
			<View style={styles.header}>
				<TouchableOpacity onPress={goBack} style={styles.backButton}>
					<Text style={styles.backButtonText}>← Back</Text>
				</TouchableOpacity>
			</View>

			<Tab.Navigator
				screenOptions={{
					tabBarStyle: {
						backgroundColor: 'transparent',
						elevation: 0,
						shadowOpacity: 0,
					},
					tabBarIndicatorStyle: {
						backgroundColor: 'black',
					},
					tabBarLabelStyle: {
						fontWeight: 'bold',
						color: 'black',
					},
				}}
			>
				<Tab.Screen
					name="Profile"
					children={() => <ProfileTab onSignOut={handleSignOut} />}
				/>
				<Tab.Screen name="Pins" component={PinsTab} />
				<Tab.Screen name="Circles" component={CirclesTab} />
			</Tab.Navigator>
		</SafeAreaView>
	);
}

// =========================================================================
//                            STYLE SHEET
// =========================================================================
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
	},

	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingBottom: 8,
	},

	backButton: {
		padding: 8,
		borderRadius: 8,
	},

	backButtonText: {
		fontSize: 16,
		color: ReMapColors.primary.black,
	},

	tabContent: {
		flex: 1,
		padding: 24,
		justifyContent: 'space-between',
		alignItems: 'center',
	},

	username: {
		fontSize: 20,
	},

	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-evenly',
		marginTop: 32,
		paddingBottom: 24,
	},

	circleButton: {
		backgroundColor: ReMapColors.primary.black,
		paddingVertical: 12,
		paddingHorizontal: 32,
		borderRadius: 18,
	},

	buttonText: {
		fontWeight: '600',
		fontSize: 10,
		color: 'black',
	},

	profileImage: {
		width: 100,
		height: 100,
		borderRadius: 50,
		marginBottom: 20,
	},

	profileImagePlaceholder: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: '#ccc',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 20,
	},

	profileImagePlaceholderText: {
		fontSize: 12,
		fontWeight: 'bold',
		color: '#666',
		textAlign: 'center',
	},
});
