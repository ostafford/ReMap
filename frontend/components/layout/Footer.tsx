import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ReMapColors } from '@/constants/Colors';

interface FooterProps {
  children: React.ReactNode;
  style?: any;
  backgroundColor?: string;
  padding?: number;
}

export const Footer = ({ 
  children, 
  style, 
  backgroundColor = ReMapColors.ui.cardBackground,
  padding = 20 
}: FooterProps) => {
  return (
    <View style={[
      styles.container, 
      { backgroundColor, padding },
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // This ensures footer stays at bottom
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: ReMapColors.ui.border,
    // Add subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
});