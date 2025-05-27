// frontend/components/layout/Header.tsx
// Your first layout component using ReMap brand colors!

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, AppColors } from '../../constants/Colors';

interface HeaderProps {
  title: string;
  subtitle?: string; // Optional subtitle
  showBackButton?: boolean; // We'll add this functionality later
}

export const Header = ({ title, subtitle }: HeaderProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary, // Your brand violet!
    paddingTop: 50, // Space for status bar
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.white,
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.9, // Slightly transparent for hierarchy
  },
});