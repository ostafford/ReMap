import React, { useState, useCallback } from 'react';
import {
	View,
	Text,
	TextInput,
	Image,
	TouchableOpacity,
	StyleSheet,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { useMediaCapture } from '@/hooks/createPin/useMediaCapture';
import RemapClient from '../../services/remap';

const earthSplash = require('@/assets/images/earth-splash.jpg');

export default function CreateCircle() {
	const router = useRouter();
	const [circleName, setCircleName] = useState('');
	const [isCreating, setIsCreating] = useState(false);
	const [error, setError] = useState('');

	// Use single-photo mode for avatar
	const mediaCapture = useMediaCapture({
		showModal: (type, title, message) => {},
		mode: 'single-photo',
		allowAudio: false,
		allowMultiple: false,
	});

	const selectedImage = mediaCapture.selectedMedia[0]?.uri;

	const handleCreate = useCallback(async () => {
		setError('');
		if (!circleName.trim()) {
			setError('Circle name is required.');
			return;
		}
		setIsCreating(true);
		try {
			const client = new RemapClient();
			// Prepare form data if image is selected
			let response;
			if (selectedImage) {
				const formData = new FormData();
				formData.append('name', circleName.trim());
				formData.append('avatar', {
					uri: selectedImage,
					type: 'image/jpeg',
					name: 'circle-avatar.jpg',
				} as any);
				response = await client.makeAuthRequest(
					'circles',
					'POST',
					formData,
					true
				);
			} else {
				response = await client.makeAuthRequest(
					'circles',
					'POST',
					JSON.stringify({ name: circleName.trim() }),
					false
				);
			}
			// Redirect to placeholder (to be defined later)
			router.replace('/(user)/profile');
		} catch (e) {
			setError('Failed to create circle.');
		} finally {
			setIsCreating(false);
		}
	}, [circleName, selectedImage, router]);

	return (
		<KeyboardAvoidingView
			style={{ flex: 1, backgroundColor: 'black' }}
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
		>
			<ScrollView
				contentContainerStyle={styles.container}
				keyboardShouldPersistTaps="handled"
			>
				{/* Header */}
				<View style={styles.headerRow}>
					<TouchableOpacity
						onPress={() => router.back()}
						style={styles.backButton}
					>
						<Text style={styles.backArrow}>{'\u2190'}</Text>
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Create a circle</Text>
				</View>

				{/* Image Picker Section */}
				<View style={styles.photoSection}>
					<TouchableOpacity
						style={styles.imagePicker}
						onPress={mediaCapture.handleCameraPress}
						activeOpacity={0.7}
					>
						<View style={styles.plusCircle}>
							<Text style={styles.plusIcon}>+</Text>
						</View>
					</TouchableOpacity>
					<Text style={styles.photoPlaceholder}>Circle photo</Text>
				</View>

				{/* Name Input */}
				<TextInput
					style={styles.input}
					placeholder="Name the circle"
					placeholderTextColor="#bbb"
					value={circleName}
					onChangeText={setCircleName}
					autoCapitalize="words"
					maxLength={40}
				/>

				{/* Earth Splash or Selected Image */}
				<View style={styles.earthContainer}>
					<Image
						source={
							selectedImage ? { uri: selectedImage } : earthSplash
						}
						style={styles.earthImage}
						resizeMode="contain"
					/>
				</View>

				{error ? <Text style={styles.errorText}>{error}</Text> : null}
			</ScrollView>
			{/* Sticky Create Button */}
			<View style={styles.stickyButtonContainer}>
				<Button
					onPress={handleCreate}
					disabled={isCreating || !circleName.trim()}
					style={styles.createButton}
					textColour="white"
				>
					{isCreating ? 'Creating...' : 'Create'}
				</Button>
			</View>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		padding: 24,
		alignItems: 'center',
		backgroundColor: 'black',
	},
	headerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		width: '100%',
		marginBottom: 32,
		marginTop: 8,
	},
	backButton: {
		padding: 8,
		marginRight: 8,
	},
	backArrow: {
		fontSize: 28,
		color: 'white',
	},
	headerTitle: {
		fontSize: 28,
		fontWeight: 'bold',
		color: 'white',
		flex: 1,
		textAlign: 'center',
		marginRight: 36, // to balance the back arrow
	},
	photoSection: {
		alignItems: 'center',
		marginBottom: 32,
		marginTop: 16,
		width: '100%',
	},
	imagePicker: {
		alignItems: 'center',
		marginBottom: 8,
	},
	plusCircle: {
		width: 80,
		height: 80,
		borderRadius: 40,
		borderWidth: 2,
		borderColor: 'white',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 0,
		backgroundColor: '#222',
		display: 'flex',
	},
	plusIcon: {
		fontSize: 40,
		color: 'white',
		fontWeight: 'bold',
		textAlign: 'center',
		textAlignVertical: 'center',
		lineHeight: 44,
	},
	photoPlaceholder: {
		fontSize: 16,
		color: '#bbb',
		marginTop: 8,
		marginBottom: 0,
	},
	input: {
		width: '100%',
		backgroundColor: '#222',
		borderRadius: 18,
		paddingHorizontal: 16,
		paddingVertical: 14,
		fontSize: 18,
		marginBottom: 40,
		color: 'white',
	},
	earthContainer: {
		alignItems: 'center',
		marginTop: 32,
		marginBottom: 48,
		width: '100%',
	},
	earthImage: {
		width: 300,
		height: 300,
		borderRadius: 150,
		backgroundColor: '#eee',
	},
	errorText: {
		color: 'red',
		marginTop: 8,
		fontSize: 16,
		textAlign: 'center',
	},
	stickyButtonContainer: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 24,
		alignItems: 'center',
		backgroundColor: 'transparent',
	},
	createButton: {
		backgroundColor: '#2200ff',
		borderRadius: 32,
		paddingHorizontal: 48,
		paddingVertical: 18,
		minWidth: 200,
	},
});
