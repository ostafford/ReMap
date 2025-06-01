import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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

export default function createPin() {
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [isSignupModalVisible, setIsSignupModalVisible] = useState(false);

  const toggleLoginModal = () => setIsLoginModalVisible(!isLoginModalVisible);
  const toggleSignupModal = () => setIsSignupModalVisible(!isSignupModalVisible);

  const goBack = () => {
	router.back();
  };

  const navigateToWorldMap = () => {
	// After login/signup, go to world map
	router.navigate('/worldmap');
  };

  return (
	<View style={styles.container}>
	  <Header 
		title="What's new?" 
		subtitle="Create a memory" 
	  />
	  
	  <MainContent>
		<View style={styles.content}>
		{/* separating using Views to control each section only for development */}
			

			<Input
			label="Search Location"
			placeholder="Search Location"
			style={styles.fullWidth}
			/>

			<Text>* display location here *</Text>

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
				<View>
					<Input
					label="Picture it"
					placeholder="Shtanky bathroom"
					style={styles.fullWidth}
					/>
				</View>
				<IconButton
					icon="camera"
					onPress={goBack}
				>	
				</IconButton>
				<IconButton
					icon="microphone"
					onPress={goBack}
				>	
				</IconButton>
			</View>

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
  }
});