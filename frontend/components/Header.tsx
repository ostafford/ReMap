import { View, Text, StyleSheet } from 'react-native';

export default function Header() {
	return (
		<View style={styles.container}>
			<Text style={styles.title}> Hi this the Header</Text>
		</View>
	);
}

const styles = StyleSheet.create({
  container: {
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'pink',
  },
  title: {
    color: '#1E1E1E',
    fontSize: 30,
    fontWeight: 'bold',
  },
});