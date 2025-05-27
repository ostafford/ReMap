import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ReMapColors } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { MainContent } from '@/components/layout/MainContent';

export default function WorldMapScreen() {
  const goBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Header title="World Map" />
      <MainContent>
        <Text style={styles.title}>🗺️ World Map</Text>
        <Text style={styles.subtitle}>Coming Soon!</Text>
        
        <Button onPress={goBack} style={styles.backButton}>
          ← Back to Home
        </Button>
      </MainContent>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ReMapColors.ui.background,
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
  backButton: {
    backgroundColor: ReMapColors.primary.violet,
    marginTop: 20,
  },
});