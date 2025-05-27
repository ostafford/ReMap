import { StyleSheet } from 'react-native';

import EditScreenInfo from '@/Archive/EditScreenInfo';
import { Text, View } from '@/components/ui/Themed';
import { useRouter } from 'expo-router';
import { router } from 'expo-router';

// imports for the components!
import { Button } from "@/components/ui/Button";



export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Starter Packs here</Text>

      {/* implementing custom components */}
      <Button style={[styles.button]} onPress={() => router.navigate('/home')}>
        Home
      </Button>

      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <EditScreenInfo path="app/(tabs)/two.tsx" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },

  button: {
    	backgroundColor: "#2900E2",
      width: 325,
  }
});
