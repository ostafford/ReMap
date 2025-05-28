import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { Tabs } from 'expo-router';
import { Pressable, Alert, useColorScheme } from 'react-native';

import { ReMapColors } from '@/constants/Colors';
import { AppConfig, DevUtils } from '@/constants/Config';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Show developer info when config icon is pressed
  const showDevInfo = () => {
    if (AppConfig.showDevTools) {
      Alert.alert(
        'ReMap Developer Info',
        `Development Mode: ${AppConfig.isDevelopment ? 'ON' : 'OFF'}\nShow Tabs: ${AppConfig.showTabs ? 'ON' : 'OFF'}\nVersion: ${AppConfig.version}`,
        [{ text: 'OK' }]
      );
    }
  };

  // Only show tabs if enabled in config
  if (!AppConfig.showTabs) {
    DevUtils.log('Tabs hidden - production mode');
    return null; // This will hide the entire tab system
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ReMapColors.primary.violet,
        tabBarInactiveTintColor: ReMapColors.ui.textSecondary,
        tabBarStyle: {
          backgroundColor: ReMapColors.ui.cardBackground,
          borderTopColor: ReMapColors.ui.border,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: ReMapColors.primary.violet,
        },
        headerTintColor: ReMapColors.ui.cardBackground,
      }}>
      
      {}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Anna\'s Work',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerRight: () => (
            AppConfig.showDevTools ? (
              <Pressable onPress={showDevInfo} style={{ marginRight: 15 }}>
                <FontAwesome
                  name="info-circle"
                  size={20}
                  color={ReMapColors.ui.cardBackground}
                />
              </Pressable>
            ) : null
          ),
        }}
      />

      {/* Profile Screen */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />

      {/* Starters Screen */}
      <Tabs.Screen
        name="starters"
        options={{
          title: 'Starters',
          tabBarIcon: ({ color }) => <TabBarIcon name="rocket" color={color} />,
        }}
      />
    </Tabs>
  );
}