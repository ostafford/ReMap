import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { ReMapColors } from '../../constants/Colors';

interface MainContentProps {
  children: React.ReactNode;
  scrollable?: boolean; // Sometimes you don't want scrolling *What do you think Anna?*
  style?: any; // "?" Allows custom styling
  contentStyle?: any; // Style the inner content area
}

export const MainContent = ({ 
  children, 
  scrollable = true, 
  style,
  contentStyle 
}: MainContentProps) => {
  
  if (scrollable) {
    return (
      <ScrollView 
        style={[styles.scrollContainer, style]}
        contentContainerStyle={[styles.scrollContent, contentStyle]}
        showsVerticalScrollIndicator={false} // Clean look **Only appears when scrolling**
      >
        {children}
      </ScrollView>
    );
  }

  // Non-scrollable version for fixed layouts
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: ReMapColors.ui.background,
  },
  scrollContent: {
    flexGrow: 1,
    // padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: ReMapColors.ui.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
});