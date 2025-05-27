import { View, Text, StyleSheet } from 'react-native';

export default function Footer() {
	return (
		<View style={styles.container}>
						<Text style={styles.title}> Hi this the Footer</Text>
		</View>
	);
}

const styles = StyleSheet.create({
  container: {
	height: 90,
	justifyContent: 'center',
	alignItems: 'center',
	backgroundColor: 'blue',
  },
    title: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
});