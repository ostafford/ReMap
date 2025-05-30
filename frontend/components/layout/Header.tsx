import React from 'react';
import { View, Text, StyleSheet} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ReMapColors } from '@/constants/Colors';

interface HeaderProps {
  title: string;
  subtitle?: string; // Optional subtitle
  showBackButton?: boolean; // We'll add this functionality later
}


export const Header = ({ title, subtitle }: HeaderProps) => {
  const insets = useSafeAreaInsets();

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
    backgroundColor: 'transparent',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ReMapColors.ui.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: ReMapColors.ui.text,
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.9,
  },
});