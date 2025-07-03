import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ReMapColors } from '@/constants/Colors';
import { StyleSheet } from 'react-native';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';

export default function Layout() {
	return (
		<SafeAreaProvider>
			<NotificationProvider>
				<OnboardingProvider>
					<StatusBar style="auto" />
					<Stack
						screenOptions={{
							headerShown: false, // Hide default headers if you're using custom ones
							contentStyle: {
								backgroundColor: ReMapColors.ui.background,
							},
						}}
					/>
				</OnboardingProvider>
			</NotificationProvider>
		</SafeAreaProvider>
	);
}
