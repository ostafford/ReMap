// ================
//   CORE IMPORTS
// ================
import React, { useState, useEffect, useRef } from 'react';
import { 
	View,
	TextInput,
	TouchableOpacity,
	Text,
	StyleSheet,
	ScrollView, 
	Animated,
	Dimensions
} from 'react-native';

// ===========================
//   COMPONENTS IMPORTS
// ===========================
import { ReMapColors } from '@/constants/Colors';

// ===========================
//   FOURSQUARE API IMPORTS
// ===========================
import axios from 'axios';
import Constants from 'expo-constants';
import uuid from 'react-native-uuid';



// ===========================
//  DECLARING TYPES
// ===========================
export type Suggestion = {
  type: string;
  place?: {
    fsq_id: string;
    name: string;
    location?: {
      address?: string;
      formatted_address?: string;
      locality?: string;
    };
  };
  text?: {
    primary: string;
    secondary?: string;
  };
  address?: {
    formatted_address?: string;
  };
  geocodes?: {
    main: {
      latitude: number;
      longitude: number;
    };
  };
};

type Props = {
	onSelect: (item: Suggestion) => void;
	placeholder?: string;
};



// ==================================
//   AUTOCOMPLETE SEARCH COMPONENT
// ==================================
export const FoursquareSearch = ({ onSelect, placeholder = 'Search location...' }: Props) => {
	const inputRef = useRef<TextInput>(null);
	const [query, setQuery] = useState('');
	const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
	
	// **** CREATING A SESSION TOKEN SO WE DON'T GET CHARGED PER KEYSTROKE *****
	const [sessionToken, setSessionToken] = useState<string | null>(null);


	useEffect(() => {
		if (query.length === 1 && !sessionToken) {
			setSessionToken(uuid.v4() as string);
		}
	}, [query]);

	useEffect(() => {
		const fetchSuggestions = async () => {
			if (query.length < 2) {
				setSuggestions([]);
				return;
			}

			const apiKey = Constants.expoConfig?.extra?.foursquareApiKey;
			console.log("Foursquare API key:", apiKey);
			console.log('Expo Constants extra:', Constants.expoConfig?.extra);
			console.log('Authorization header:', `fsq${apiKey}`);

			try {
				const res = await axios.get('https://api.foursquare.com/v3/autocomplete', {
					headers: {
						Authorization: `fsq${apiKey.trim()}`,
						accept: 'application/json'
					},
					params: {
						query,
						limit: 5,
						ll: '-37.817979,144.960408',
						// im commenting this out because some reason the session token causes issues with fetching API data (going to troubleshoot this)
						//session_token: sessionToken,
					},
				});

				console.log('Autocomplete results:', res.data.results);
				setSuggestions(res.data.results || []);
			} catch (err) {
				console.error('Autocomplete fetch failed:', err);
			}
		};

		const timeout = setTimeout(fetchSuggestions, 300);
		return () => clearTimeout(timeout);
	}, [query]);


	useEffect(() => {
	const timeout = setTimeout(() => {
		inputRef.current?.focus();
	}, 100);
	return () => clearTimeout(timeout);
}, []);



	const handleSelect = async (item: Suggestion) => {
	try {
		if (item.type === 'place' && item.place?.fsq_id) {
		const apiKey = Constants.expoConfig?.extra?.foursquareApiKey;
		const detailRes = await axios.get(
			`https://api.foursquare.com/v3/places/${item.place.fsq_id}`,
			{
			headers: {
				Authorization: `fsq${apiKey.trim()}`,
				accept: 'application/json',
			},
			}
		);

		const fullPlace = detailRes.data;
		onSelect({
			...item,
			place: {
			...item.place,
			location: fullPlace.location,
			},
			geocodes: fullPlace.geocodes,
		});
		} else {
		onSelect(item);
		}

		setQuery(item.text?.primary || item.place?.name || '');
		setSuggestions([]);
		setSessionToken(null);
	} catch (error) {
		console.error('Failed to fetch place details:', error);
		onSelect(item);
	}
	};

	
// ===========================================
//   AUTOCOMPLETE SEARCH COMPONENT RENDERING
// ==========================================
	return (
		<View style={styles.container}>
			<TextInput
				ref={inputRef}
				placeholder={placeholder}
				placeholderTextColor= {ReMapColors.ui.textSecondary}
				value={query}
				onChangeText={setQuery}
				style={styles.input}
			/>
			{suggestions.length > 0 && (
				<ScrollView
					style={styles.list}
					nestedScrollEnabled={true}
					keyboardShouldPersistTaps="handled"
				>
					{suggestions.map((item, index) => {
						let displayText = "";

						if (item.type === 'place' && item.place?.name) {
							displayText = item.place.name;
						} else if (item.type === 'search' && item.text?.primary) {
							displayText = item.text.primary;
						} else if (item.type === 'address' && (item.address?.formatted_address || item.text?.primary)) {
							displayText = item.address.formatted_address || item.text.primary;
						} else if (item.type === 'geo' && item.text?.primary) {
							displayText = item.text.primary;
						} else if (item.text?.primary) {
							displayText = item.text.primary;
						}

						return (
							<TouchableOpacity
								key={item.place?.fsq_id || index}
								style={styles.item}
								onPress={() => handleSelect(item)}
								
								>
								<Text>{displayText}</Text>
							</TouchableOpacity>
						);
					})}
				</ScrollView>
				)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		width: '100%',
		alignItems: 'center',
	},
	input: {
		borderWidth: 1,
		borderColor: ReMapColors.ui.grey,
		borderRadius: 16,
		padding: 12,
		width: '100%',
		backgroundColor: ReMapColors.ui.grey,
	},
	list: {
		backgroundColor: ReMapColors.ui.background,
		maxHeight: 150,
		marginTop: 4,
		borderRadius: 6,
		elevation: 3,
	},
	item: {
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: ReMapColors.ui.background,
	},
});
