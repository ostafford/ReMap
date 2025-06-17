// =========================================================================
//   						EXTERNAL IMPORTS
// =========================================================================
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ==============================
//   	NAVIGATION IMPORTS
// ==============================
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';

// =================
//   UI COMPONENTS
// =================
import { ReMapColors } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';



const Tab = createMaterialTopTabNavigator();

function ProfileTab() {
  return (
    <View style={styles.tabContent}>
      <Text style={styles.text}> *** username here ***</Text>
	  <Text>Profile picture here</Text>
	  <Text>Full name</Text>
	  <Text>Total Pins</Text>
	  	<Button
				//onPress={} - link to function that signs out user
				style={styles.circleButton}
				size="small"
				textColour={ReMapColors.primary.black}
			>
				Sign out
			</Button>
    </View>
  );
}

function CirclesTab() {
  return (
    <View style={styles.tabContent}>
      <Text style={styles.text}>Your Circles</Text>
      <View style={styles.buttonContainer}>
			<Button
				//onPress={} we'll implement function laterrrr
				style={styles.circleButton}
				size="small"
				textColour={ReMapColors.primary.black}
			>
				Create
			</Button>
			<Button
				//onPress={}
				style={styles.circleButton}
				size="small"
				textColour={ReMapColors.primary.black}
			>
				Join
			</Button>
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
    backgroundColor: 'white',
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
    color: ReMapColors.primary.black,
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
    backgroundColor: 'lightgray',
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
