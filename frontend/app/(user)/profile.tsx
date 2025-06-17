import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createMaterialTopTabNavigator();

function ProfileTab() {
  return (
    <View style={styles.tabContent}>
      <Text style={styles.text}>User Profile Info</Text>
    </View>
  );
}

function CirclesTab() {
  return (
    <View style={styles.tabContent}>
      <Text style={styles.text}>Your Circles</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.circleButton}>
          <Text style={styles.buttonText}>Create</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.circleButton}>
          <Text style={styles.buttonText}>Join</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const goBack = () => {
    router.back();
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: 'transparent',
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarIndicatorStyle: {
            backgroundColor: 'black',
          },
          tabBarLabelStyle: {
            fontWeight: 'bold',
            color: 'black',
          },
        }}
      >
        <Tab.Screen name="Profile" component={ProfileTab} />
        <Tab.Screen name="Circles" component={CirclesTab} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },

  backButton: {
    padding: 8,
    borderRadius: 8,
  },

  backButtonText: {
    fontSize: 16,
    color: 'black',
  },

  tabContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },

  text: {
    fontSize: 18,
    fontWeight: '600',
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 32,
    paddingBottom: 24,
  },

  circleButton: {
    backgroundColor: '#ddd',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },

  buttonText: {
    fontWeight: '600',
    fontSize: 16,
    color: 'black',
  },
});
