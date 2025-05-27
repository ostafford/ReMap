// frontend/app/(tabs)/index.tsx
// TEMPORARY TEST - Let's see your Header component in action!

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Header } from '../components/layout/Header'; // Import your new Header!
import { Button } from '../components/ui/Button'; // Anna's Button
import { Colors } from '../constants/Colors'; // Your brand colors

export default function TestScreen() {
  return (
    <View style={styles.container}>
      {/* Your new Header component! */}
      <Header 
        title="ReMap" 
        subtitle="Your Interactive Memory Atlas" 
      />
      
      {/* Main content area */}
      <ScrollView style={styles.content}>
        <View style={styles.buttonContainer}>
          <Button onPress={() => console.log('World Map pressed!')}>
            🗺️ Explore World Map
          </Button>
          
          <Button onPress={() => console.log('Onboarding pressed!')}>
            🚀 Start Onboarding
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  buttonContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50, // Give some space from header
  },
});