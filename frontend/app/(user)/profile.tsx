// =========================================================================
//   						EXTERNAL IMPORTS
// =========================================================================
import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/shared/useAuth';

// =================
//   UI COMPONENTS
// =================
import { ReMapColors } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';

import RemapClient from '../services/remap';

import type { Tables } from '@/types/database';

const Tab = createMaterialTopTabNavigator();

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
					resizeMode="cover"
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

function CirclesTab() {
	return (
		<View style={styles.tabContent}>
			<Text>Your Circles</Text>
			<View style={styles.buttonContainer}>
				<Button
					//onPress={} we'll implement function laterrrr
					style={styles.circleButton}
					size="small"
					textColour="white"
				>
					Create
				</Button>
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

function PinsTab() {
	return (
		<View style={styles.tabContent}>
			<Text>Your Pins</Text>
			<Text>pin display here</Text>
			<Text>maybe we should have the option to delete pins here</Text>
		</View>
	);
}

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
