import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';

// Import your layout components
import { Header } from '@/components/layout/Header';
import { MainContent } from '@/components/layout/MainContent';
import { Footer } from '@/components/layout/Footer';

// Import components
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/TextInput';

// Import colors
import { ReMapColors } from '@/constants/Colors';

// Import expo Media upload
import * as ImagePicker from 'expo-image-picker';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av';
import { setAudioModeAsync } from 'expo-av/build/Audio';



export default function createPin() {


// ==============================================
// =========== MEDIA UPLOAD METHODS =============
// ==============================================

  const uploadImageAsync = async () => {
	let result = await ImagePicker.launchImageLibraryAsync({
		allowsEditing: true,
		quality: 0.75
	});
  }

  const useCameraAsync = async () => {
	await ImagePicker.requestCameraPermissionsAsync();
	let result = await ImagePicker.launchCameraAsync({
		allowsEditing: true,
		quality: 0.75
	})
  }

  
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [uri, setUri] = useState<string | null>(null);

  const handleMicPress = () => {
	if (recording) {
		stopRecording();
	} else {
		startRecording();
	}
  };

  const startRecording = async () => {
	try {
		const permission = await Audio.requestPermissionsAsync();
		if (permission.status !== 'granted') {
			alert('Micrphone permission required');
			return;
		}

		await Audio.setAudioModeAsync({
			allowsRecordingIOS: true,
			playsInSilentModeIOS: true,
		});

		const { recording } = await Audio.Recording.createAsync (
			Audio.RecordingOptionsPresets.LOW_QUALITY
		);
		setRecording(recording);
	} 
	catch (error) {
		console.error('Error starting recording:', error);
		}
	};

	const stopRecording = async () => {
		if (recording != null) {
			try {
				await recording.stopAndUnloadAsync();
				const uri = recording.getURI();
				setUri(uri);
				setRecording(null);
				console.log('Recording saved at:', uri);
			} 
			catch (error) {
				console.error('Error stopping recording:', error);
			}
		};
	}
		
	const playRecording = async () => {
		if (!uri) return;
		const { sound } = await Audio.Sound.createAsync({ uri });
		await sound.playAsync();
	};


  // ==============================================
  // =============== PAGE ROUTING  ================
  // ==============================================

  const goBack = () => {
	router.back();
  };

  return (
	<View style={styles.container}>
	  <Header 
		title="What's new?" 
		subtitle="Create a memory" 
	  />
	  
	  <MainContent>
		<View style={styles.content}>
			
			<Input
			label="Search it"
			placeholder="Search Location"
			style={styles.fullWidth}
			/>

			<View style={styles.displayLocationContainer}>
				<Image
					style={styles.pin}
					source={require('../../assets/images/pin.png')}
				></Image>
				<Text>* display location here *</Text>
			</View>


			<Text>Select visibility</Text>
			<View style={styles.row}>
				<Button>Public</Button>
				<Button>Social</Button>
				<Button>Public</Button>
			</View>

			<Text>* displays option chosen visually *</Text>

			<Input
				label="Relive it"
				placeholder="Shtanky bathroom"
				style={styles.fullWidth}
			/>

			<View style={styles.row}>
				<View style={styles.imageUpload}>
					<Button 
						onPress={(uploadImageAsync)}
						style={styles.selectImage}
					>
						<Text 
							style={styles.imageUploadText}>
							Picture it
						</Text>
					</Button>
				</View>

				<View style={styles.cameraMicrophone}>
					<View>
						<IconButton
						icon="camera"
						onPress={useCameraAsync}
						>	
						</IconButton>r
					</View>
					<View>
						<IconButton
						icon={recording ? "stop": "microphone"}
						onPress={handleMicPress}
						>	
						</IconButton>
					</View>
				</View>
			</View>

			<IconButton
				icon='play'
				onPress={playRecording}
			></IconButton>

		</View>
	  </MainContent>
	  
	  <Footer>
		<View style={styles.buttonContainer}>
		  <Button 
			onPress={goBack}
		  >
			← Back to Home
		  </Button>
		</View>
	  </Footer>

	</View>
  );
}

const styles = StyleSheet.create({
  container: {
	flex: 1,
	backgroundColor: ReMapColors.ui.background,
  },
  content: {
	alignItems: 'center',
	paddingHorizontal: 20,
	gap: 12,
  },
  description: {
	fontSize: 16,
	color: ReMapColors.ui.text,
	textAlign: 'center',
	lineHeight: 24,
	marginBottom: 30,
  },

  displayLocationContainer: {
	width: '100%',
	alignItems:'center',
  },
  pin: {
	width: 60,
	height: 80,
  },

  imageUpload: {
	width: '65%',
	justifyContent: 'flex-start',
},
  cameraMicrophone: {
	flexDirection: 'row',
	alignItems:'center',
  },

  selectImage: {
	borderRadius: 15,
	backgroundColor: "#D9D9D9",
	height: 'auto',
	alignItems: 'flex-start',
  },
  imageUploadText: {
	color: ReMapColors.primary.black,
	fontSize: 14,
  },

  orText: {
	fontSize: 14,
	color: ReMapColors.ui.textSecondary,
	textAlign: 'center',
	marginBottom: 20,
  },
  buttonContainer: {
	width: '100%',
	gap: 10,
  },
  modalButton: {
	width: 150,
  },

  fullWidth: {
	width: '100%',
  },
  location: {

  },
  row: {
	flexDirection: 'row',
	width: '100%',
	justifyContent:'space-between',
  },

});