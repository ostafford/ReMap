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
		<View style={styles.rootContainer}>
			{/* Sticky Header */}
			<View style={styles.stickyHeader}>
				<View style={styles.headerRow}>
					<TouchableOpacity
						onPress={() => router.back()}
						style={styles.backButton}
					>
						<Text style={styles.backArrow}>{'\u2190'}</Text>
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Create a circle</Text>
				</View>
			</View>
			<ScrollView
				contentContainerStyle={styles.centeredContent}
				keyboardShouldPersistTaps="handled"
			>
				{/* Centered Name Input and Image Picker */}
				<View style={styles.centeredInner}>
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

					{/* Image Picker as Earth Image */}
					<View style={styles.earthContainer}>
						<TouchableOpacity
							onPress={mediaCapture.handleCameraPress}
							activeOpacity={0.8}
						>
							<Image
								source={
									selectedImage
										? { uri: selectedImage }
										: earthSplash
								}
								style={styles.earthImage}
								resizeMode="contain"
							/>
							{!selectedImage && (
								<View style={styles.overlay}>
									<Text style={styles.overlayText}>
										Upload photo
									</Text>
								</View>
							)}
						</TouchableOpacity>
					</View>
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
		</View>
	);
}

const styles = StyleSheet.create({
	rootContainer: {
		flex: 1,
		backgroundColor: 'black',
	},
	stickyHeader: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		zIndex: 10,
		backgroundColor: 'black',
		paddingTop: Platform.OS === 'ios' ? 48 : 24,
		paddingBottom: 8,
	},
	centeredContent: {
		flexGrow: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingTop: 80, // space for sticky header
		paddingBottom: 120, // space for sticky button
		backgroundColor: 'black',
		minHeight: 600,
	},
	centeredInner: {
		alignItems: 'center',
		justifyContent: 'center',
		width: '100%',
	},
	headerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		width: '100%',
		marginBottom: 0,
		marginTop: 0,
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
	input: {
		width: '70%',
		backgroundColor: '#222',
		borderRadius: 18,
		paddingHorizontal: 16,
		paddingVertical: 14,
		fontSize: 18,
		marginBottom: 40,
		color: 'white',
		textAlign: 'center',
	},
	earthContainer: {
		alignItems: 'center',
		marginTop: 32,
		marginBottom: 48,
		width: '100%',
		justifyContent: 'center',
	},
	earthImage: {
		width: 300,
		height: 300,
		borderRadius: 150,
		backgroundColor: '#eee',
	},
	overlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: 300,
		height: 300,
		borderRadius: 150,
		backgroundColor: 'rgba(0,0,0,0.45)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	overlayText: {
		color: 'white',
		fontSize: 22,
		fontWeight: '600',
		textAlign: 'center',
		opacity: 0.5,
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
