import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ReMapColors } from '@/constants/Colors';

export default function TabIndexScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SplashPage</Text>
      <Text style={styles.subtitle}>This is a placeholder</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ReMapColors.ui.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ReMapColors.ui.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: ReMapColors.ui.textSecondary,
  },
});