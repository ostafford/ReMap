import { View, Text, StyleSheet } from 'react-native';

export default function Search() {
	return (
		<View style={styles.container}>
			<Text style={styles.title}> Hi this the supporting header</Text>
		</View>
	);
}

const styles = StyleSheet.create({
  container: {
	height: 50,
	justifyContent: 'center',
	alignItems: 'center',
	backgroundColor: 'orange',
  },
	title: {
	color: 'black',
	fontSize: 10,
	fontWeight: 'bold',
  },
});