import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { router } from 'expo-router';

// Import layout components
import { Header } from '../components/layout/Header';
import { MainContent } from '../components/layout/MainContent';
import { Footer } from '../components/layout/Footer';

// Import UI components
import { Button } from '../components/ui/Button';
import { SpinningGlobe } from '../components/ui/Globe';
import { InfoButton } from '../components/ui/IconButton';
import { AppConfig } from '../constants/Config';

// Import Constants
import { ReMapColors } from '../constants/Colors';

export default function SplashScreen() {
  const navigateToWorldMap = () => {
    router.navigate('/worldmap');
  };

  const navigateToOnboarding = () => {
    router.navigate('/onboarding');
  };

  const navigateToDevTabs = () => {
    router.navigate('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      {/* Developer access button (only in development) */}
      {AppConfig.showDevTools && (
        <View style={styles.devButtonContainer}>
          <InfoButton onPress={navigateToDevTabs} />
        </View>
      )}
      
      {/* Header with app name */}
      <Header 
        title="ReMap" 
        subtitle="Your Interactive Memory Atlas" 
      />
      
      {/* Main content with globe */}
      <MainContent scrollable={false} style={styles.mainContent}>
        <View style={styles.globeContainer}>
          <Canvas style={styles.canvas}>
            <ambientLight intensity={3} />
            <SpinningGlobe position={[0, 0, 0]} scale={1.8} />
          </Canvas>
        </View>
        
        <Text style={styles.description}>
          Transform your experiences into an interactive, personal atlas
        </Text>
      </MainContent>
      
      {/* Footer with your two buttons */}
      <Footer>
        <View style={styles.buttonContainer}>
          <Button 
            style={styles.primaryButton}
            onPress={navigateToWorldMap}
          >
            Explore
          </Button>
            <Button 
            style={styles.secondaryButton}
            // going to make a function for starter packs onboarding
            onPress={navigateToWorldMap}
          >
            New User
          </Button>
          


          {/* <Button 
            style={styles.secondaryButton}
            onPress={navigateToOnboarding}
          >
            🚀 Start Onboarding
          </Button> */}

          
        </View>
      </Footer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  devButtonContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
  },
  mainContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  globeContainer: {
    height: 300,
    width: '100%',
    marginVertical: 20,
  },
  canvas: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: ReMapColors.ui.textSecondary,
    textAlign: 'center',
    marginHorizontal: 20,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: ReMapColors.primary.accent,
    width: '100%',
  },
  secondaryButton: {
    backgroundColor: ReMapColors.primary.black,
    width: '100%',
  },
});