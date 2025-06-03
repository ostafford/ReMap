// ==============================
//   DUMMY PIN DATA FOR TESTING
// ==============================
// This structure aligns with createPin.tsx and ReMap's memory-focused philosophy

export interface MediaItem {
	uri: string;
	type: 'photo' | 'video';
	name: string;
}

export interface DummyPin {
	id: string;
	name: string; // Location/business name
	location: {
		latitude: number;
		longitude: number;
		address: string;
		query: string; // Matches createPin location format
		city: string;
		country: string;
	};
	categories: {
		id: string;
		name: string;
		icon: string;
		primary: boolean;
	}[];
	starterPackCategory: string; // Maps to our starter pack system

	// MAIN MEMORY DATA (matches createPin structure)
	memory: {
		title: string; // User's memory title (from createPin)
		description: string; // User's memory description (from createPin)
		author: string; // Who created this memory
		createdAt: string; // When memory was created
		visibility: string[]; // Matches createPin visibility options
		media: {
			// Matches createPin media structure
			photos: MediaItem[];
			videos: MediaItem[];
			audio: {
				uri: string;
				recorded: string;
			} | null;
		};
	};
}

// Melbourne-based dummy data aligned with ReMap's memory philosophy
export const DUMMY_PINS: DummyPin[] = [
	// =============================
	//   CAFE EXPLORER MEMORIES
	// =============================
	{
		id: 'cafe_001',
		name: 'Patricia Coffee Brewers',
		location: {
			latitude: -37.8154,
			longitude: 144.9636,
			address: '1 Little Bourke Street',
			query: 'Patricia Coffee Brewers, Little Bourke Street, Melbourne',
			city: 'Melbourne',
			country: 'Australia',
		},
		categories: [
			{
				id: 'cafe_cat',
				name: 'Coffee Shop',
				icon: '☕',
				primary: true,
			},
		],
		starterPackCategory: 'cafes',
		memory: {
			title: 'Best flat white discovery',
			description:
				'Found this tiny cafe tucked away in the city. The barista took so much care explaining the different beans. My first proper Melbourne coffee experience - now I understand the hype!',
			author: 'Sarah_M',
			createdAt: '2024-01-15T10:30:00Z',
			visibility: ['public'],
			media: {
				photos: [
					{
						uri: 'dummy_photo_1.jpg',
						type: 'photo',
						name: 'Perfect latte art',
					},
				],
				videos: [],
				audio: null,
			},
		},
	},
	{
		id: 'cafe_002',
		name: 'Degraves Espresso Bar',
		location: {
			latitude: -37.8186,
			longitude: 144.9631,
			address: 'Degraves Street',
			query: 'Degraves Espresso Bar, Degraves Street, Melbourne',
			city: 'Melbourne',
			country: 'Australia',
		},
		categories: [
			{
				id: 'cafe_cat',
				name: 'Coffee Shop',
				icon: '☕',
				primary: true,
			},
		],
		starterPackCategory: 'cafes',
		memory: {
			title: 'Classic Melbourne laneway moment',
			description:
				'Standing in this narrow laneway with my coffee, watching Melbourne life flow by. Street art on the walls, coffee in hand - this is what Melbourne feels like.',
			author: 'CoffeeAddict_99',
			createdAt: '2024-02-01T14:15:00Z',
			visibility: ['public'],
			media: {
				photos: [
					{
						uri: 'dummy_photo_2.jpg',
						type: 'photo',
						name: 'Laneway atmosphere',
					},
				],
				videos: [],
				audio: {
					uri: 'dummy_audio_1.m4a',
					recorded: '2024-02-01T14:20:00Z',
				},
			},
		},
	},
	{
		id: 'cafe_003',
		name: 'Brother Baba Budan',
		location: {
			latitude: -37.8078,
			longitude: 144.9651,
			address: '359 Little Bourke Street',
			query: 'Brother Baba Budan, Little Bourke Street, Melbourne',
			city: 'Melbourne',
			country: 'Australia',
		},
		categories: [
			{
				id: 'cafe_cat',
				name: 'Coffee Shop',
				icon: '☕',
				primary: true,
			},
		],
		starterPackCategory: 'cafes',
		memory: {
			title: 'Standing room only perfection',
			description:
				'No seats here, just pure coffee focus. The barista explained their single origin in detail. Sometimes the best experiences happen when you have to slow down and just be present.',
			author: 'BaristaBen',
			createdAt: '2024-01-20T09:45:00Z',
			visibility: ['social'],
			media: {
				photos: [],
				videos: [],
				audio: null,
			},
		},
	},

	// =============================
	//   NIGHTLIFE GUIDE MEMORIES
	// =============================
	{
		id: 'nightlife_001',
		name: 'Rooftop Bar',
		location: {
			latitude: -37.8136,
			longitude: 144.9631,
			address: 'Level 6, Curtin House',
			query: 'Rooftop Bar, Curtin House, Melbourne',
			city: 'Melbourne',
			country: 'Australia',
		},
		categories: [
			{
				id: 'bar_cat',
				name: 'Cocktail Bar',
				icon: '🍸',
				primary: true,
			},
		],
		starterPackCategory: 'nightlife',
		memory: {
			title: 'Sunset cocktails above the city',
			description:
				'Celebrating my promotion with friends as the sun set over Melbourne. The city looked magical from up here. The bartender made us a custom cocktail when we told him what we were celebrating!',
			author: 'NightOwl_Mel',
			createdAt: '2024-02-10T19:30:00Z',
			visibility: ['public'],
			media: {
				photos: [
					{
						uri: 'dummy_photo_3.jpg',
						type: 'photo',
						name: 'Sunset city view',
					},
					{
						uri: 'dummy_photo_4.jpg',
						type: 'photo',
						name: 'Celebration cocktail',
					},
				],
				videos: [
					{
						uri: 'dummy_video_1.mp4',
						type: 'video',
						name: 'City lights coming on',
					},
				],
				audio: null,
			},
		},
	},
	{
		id: 'nightlife_002',
		name: 'Eau De Vie',
		location: {
			latitude: -37.8125,
			longitude: 144.959,
			address: '1 Malthouse Lane',
			query: 'Eau De Vie, Malthouse Lane, Melbourne',
			city: 'Melbourne',
			country: 'Australia',
		},
		categories: [
			{
				id: 'whiskey_cat',
				name: 'Whisky Bar',
				icon: '🥃',
				primary: true,
			},
		],
		starterPackCategory: 'nightlife',
		memory: {
			title: "Dad's whisky education night",
			description:
				'Brought my dad here for his 60th birthday. The bartender spent an hour teaching us about different whisky regions. Dad said it was the best birthday gift ever - quality time and quality whisky.',
			author: 'WhiskyWanderer',
			createdAt: '2024-01-25T21:00:00Z',
			visibility: ['social'],
			media: {
				photos: [
					{
						uri: 'dummy_photo_5.jpg',
						type: 'photo',
						name: 'Dad with his favorite dram',
					},
				],
				videos: [],
				audio: null,
			},
		},
	},

	// =============================
	//   FOODIE ADVENTURES MEMORIES
	// =============================
	{
		id: 'foodie_001',
		name: 'Chin Chin',
		location: {
			latitude: -37.8181,
			longitude: 144.9647,
			address: '125 Flinders Lane',
			query: 'Chin Chin, Flinders Lane, Melbourne',
			city: 'Melbourne',
			country: 'Australia',
		},
		categories: [
			{
				id: 'thai_cat',
				name: 'Thai Restaurant',
				icon: '🍜',
				primary: true,
			},
		],
		starterPackCategory: 'foodie',
		memory: {
			title: 'First date success story',
			description:
				'Took my now-partner here on our first date 3 years ago. We waited 45 minutes for a table and talked the whole time. The pad thai was amazing but the conversation was even better. We come back every anniversary.',
			author: 'FoodieExplorer',
			createdAt: '2024-02-05T20:15:00Z',
			visibility: ['social'],
			media: {
				photos: [
					{
						uri: 'dummy_photo_6.jpg',
						type: 'photo',
						name: 'Anniversary dinner',
					},
				],
				videos: [],
				audio: null,
			},
		},
	},
	{
		id: 'foodie_002',
		name: 'Movida',
		location: {
			latitude: -37.8143,
			longitude: 144.9665,
			address: '1 Hosier Lane',
			query: 'Movida, Hosier Lane, Melbourne',
			city: 'Melbourne',
			country: 'Australia',
		},
		categories: [
			{
				id: 'spanish_cat',
				name: 'Spanish Restaurant',
				icon: '🥘',
				primary: true,
			},
		],
		starterPackCategory: 'foodie',
		memory: {
			title: 'Tapas and street art adventure',
			description:
				"Exploring Hosier Lane's incredible street art before dinner. The graffiti changes constantly but Movida's paella remains perfect. Love how Melbourne mixes culture and cuisine so naturally.",
			author: 'SpanishFoodie',
			createdAt: '2024-01-30T19:45:00Z',
			visibility: ['public'],
			media: {
				photos: [
					{
						uri: 'dummy_photo_7.jpg',
						type: 'photo',
						name: 'Street art backdrop',
					},
				],
				videos: [],
				audio: null,
			},
		},
	},

	// =============================
	//   CULTURE SEEKER MEMORIES
	// =============================
	{
		id: 'culture_001',
		name: 'National Gallery of Victoria',
		location: {
			latitude: -37.8226,
			longitude: 144.9685,
			address: '180 St Kilda Road',
			query: 'National Gallery of Victoria, St Kilda Road, Melbourne',
			city: 'Melbourne',
			country: 'Australia',
		},
		categories: [
			{
				id: 'museum_cat',
				name: 'Art Museum',
				icon: '🎨',
				primary: true,
			},
		],
		starterPackCategory: 'culture',
		memory: {
			title: 'Rainy day revelation',
			description:
				'Ducked in here to escape the rain and ended up spending 4 hours lost in the contemporary wing. Found a painting that made me cry - art has never hit me like that before. Sometimes the best discoveries are unplanned.',
			author: 'ArtLover_Melb',
			createdAt: '2024-02-08T14:30:00Z',
			visibility: ['public'],
			media: {
				photos: [
					{
						uri: 'dummy_photo_8.jpg',
						type: 'photo',
						name: 'The painting that moved me',
					},
				],
				videos: [],
				audio: {
					uri: 'dummy_audio_2.m4a',
					recorded: '2024-02-08T16:00:00Z',
				},
			},
		},
	},
	{
		id: 'culture_002',
		name: 'Melbourne Museum',
		location: {
			latitude: -37.8033,
			longitude: 144.9717,
			address: '11 Nicholson Street',
			query: 'Melbourne Museum, Nicholson Street, Melbourne',
			city: 'Melbourne',
			country: 'Australia',
		},
		categories: [
			{
				id: 'history_cat',
				name: 'History Museum',
				icon: '🏛️',
				primary: true,
			},
		],
		starterPackCategory: 'culture',
		memory: {
			title: 'Teaching my nephew about dinosaurs',
			description:
				"My 6-year-old nephew's first museum visit. Watching his face light up at the T-Rex skeleton was priceless. He asked a million questions and I loved seeing Melbourne's history through his wonder-filled eyes.",
			author: 'HistoryBuff_VIC',
			createdAt: '2024-01-12T11:00:00Z',
			visibility: ['social'],
			media: {
				photos: [
					{
						uri: 'dummy_photo_9.jpg',
						type: 'photo',
						name: 'Nephew meets T-Rex',
					},
				],
				videos: [
					{
						uri: 'dummy_video_2.mp4',
						type: 'video',
						name: 'His reaction to the skeleton',
					},
				],
				audio: null,
			},
		},
	},

	// =============================
	//   NATURE LOVER MEMORIES
	// =============================
	{
		id: 'nature_001',
		name: 'Royal Botanic Gardens Melbourne',
		location: {
			latitude: -37.8304,
			longitude: 144.9803,
			address: 'Birdwood Avenue',
			query: 'Royal Botanic Gardens Melbourne, Birdwood Avenue, Melbourne',
			city: 'Melbourne',
			country: 'Australia',
		},
		categories: [
			{
				id: 'park_cat',
				name: 'Botanical Garden',
				icon: '🌿',
				primary: true,
			},
		],
		starterPackCategory: 'nature',
		memory: {
			title: 'Morning meditation by the lake',
			description:
				'Started doing sunrise meditation here during lockdown. This spot by the lake became my sanctuary. The black swans still recognize me and swim over expecting bread. Nature heals in ways I never understood before.',
			author: 'NatureLover_Aus',
			createdAt: '2024-02-12T16:20:00Z',
			visibility: ['private'],
			media: {
				photos: [
					{
						uri: 'dummy_photo_10.jpg',
						type: 'photo',
						name: 'Sunrise over the lake',
					},
				],
				videos: [],
				audio: {
					uri: 'dummy_audio_3.m4a',
					recorded: '2024-02-12T06:30:00Z',
				},
			},
		},
	},
	{
		id: 'nature_002',
		name: 'Fitzroy Gardens',
		location: {
			latitude: -37.8129,
			longitude: 144.9797,
			address: 'Wellington Parade',
			query: 'Fitzroy Gardens, Wellington Parade, Melbourne',
			city: 'Melbourne',
			country: 'Australia',
		},
		categories: [
			{
				id: 'park_cat',
				name: 'Public Park',
				icon: '🌳',
				primary: true,
			},
		],
		starterPackCategory: 'nature',
		memory: {
			title: 'Proposal spot after 5 years',
			description:
				'Finally proposed to my girlfriend under the fairy tree where we had our first picnic 5 years ago. She said yes! The fairy tree has watched our whole love story unfold. Some places hold your entire heart.',
			author: 'ParkWalker',
			createdAt: '2024-01-28T15:10:00Z',
			visibility: ['social'],
			media: {
				photos: [
					{
						uri: 'dummy_photo_11.jpg',
						type: 'photo',
						name: 'The moment she said yes',
					},
				],
				videos: [],
				audio: null,
			},
		},
	},

	// =============================
	//   URBAN EXPLORER MEMORIES
	// =============================
	{
		id: 'urban_001',
		name: 'Queen Victoria Market',
		location: {
			latitude: -37.8076,
			longitude: 144.9568,
			address: 'Queen Street',
			query: 'Queen Victoria Market, Queen Street, Melbourne',
			city: 'Melbourne',
			country: 'Australia',
		},
		categories: [
			{
				id: 'market_cat',
				name: 'Public Market',
				icon: '🛒',
				primary: true,
			},
		],
		starterPackCategory: 'urban',
		memory: {
			title: 'Saturday ritual with mum',
			description:
				"Every Saturday morning for 30 years, mum and I do the market run. Same route, same stallholders who know our names. Bought my first apartment's worth of everything here. Some traditions are worth keeping forever.",
			author: 'MarketLover_Mel',
			createdAt: '2024-02-03T10:45:00Z',
			visibility: ['social'],
			media: {
				photos: [
					{
						uri: 'dummy_photo_12.jpg',
						type: 'photo',
						name: 'Mum and our market haul',
					},
				],
				videos: [],
				audio: null,
			},
		},
	},
	{
		id: 'urban_002',
		name: 'Block Arcade',
		location: {
			latitude: -37.8149,
			longitude: 144.9655,
			address: '282 Collins Street',
			query: 'Block Arcade, Collins Street, Melbourne',
			city: 'Melbourne',
			country: 'Australia',
		},
		categories: [
			{
				id: 'shopping_cat',
				name: 'Shopping Mall',
				icon: '🏛️',
				primary: true,
			},
		],
		starterPackCategory: 'urban',
		memory: {
			title: 'Architecture photography passion born',
			description:
				"First time really noticing Melbourne's incredible architecture. This mosaic floor stopped me in my tracks. Started my photography hobby right here with this arcade. Now I see beauty in buildings everywhere.",
			author: 'ArchitectureFan',
			createdAt: '2024-01-18T13:25:00Z',
			visibility: ['public'],
			media: {
				photos: [
					{
						uri: 'dummy_photo_13.jpg',
						type: 'photo',
						name: 'Mosaic floor detail',
					},
					{
						uri: 'dummy_photo_14.jpg',
						type: 'photo',
						name: 'Arcade ceiling',
					},
				],
				videos: [],
				audio: null,
			},
		},
	},
];

// =============================
//   HELPER FUNCTIONS
// =============================

/**
 * Filter pins by starter pack categories
 */
export const filterPinsByStarterPacks = (
	selectedPackIds: string[]
): DummyPin[] => {
	if (selectedPackIds.length === 0) {
		return DUMMY_PINS; // Return all if no selections
	}

	return DUMMY_PINS.filter((pin) =>
		selectedPackIds.includes(pin.starterPackCategory)
	);
};

/**
 * Get pins by specific category
 */
export const getPinsByCategory = (category: string): DummyPin[] => {
	return DUMMY_PINS.filter((pin) => pin.starterPackCategory === category);
};

/**
 * Get all available categories from pins
 */
export const getAvailableCategories = (): string[] => {
	const categories = new Set(
		DUMMY_PINS.map((pin) => pin.starterPackCategory)
	);
	return Array.from(categories);
};

/**
 * Convert DummyPin to MapView Marker format
 */
export const convertToMapMarker = (pin: DummyPin) => ({
	id: pin.id,
	coordinate: {
		latitude: pin.location.latitude,
		longitude: pin.location.longitude,
	},
	title: pin.memory.title, // Use memory title instead of location name
	description: pin.memory.description.substring(0, 100) + '...', // Truncate description
	category: pin.starterPackCategory,
	icon: pin.categories[0]?.icon || '📍',
	author: pin.memory.author,
	locationName: pin.name, // Keep location name separate
});

/**
 * Sample function for future Foursquare API integration
 */
export const convertFoursquareToPin = (
	foursquareVenue: any,
	memoryData: any
): DummyPin => {
	// This function will help convert real Foursquare data + user memory to our pin format
	return {
		id: `${foursquareVenue.fsq_id}_${memoryData.timestamp}`, // Unique ID combining venue and memory
		name: foursquareVenue.name,
		location: {
			latitude: foursquareVenue.geocodes.main.latitude,
			longitude: foursquareVenue.geocodes.main.longitude,
			address: foursquareVenue.location.address || '',
			query: `${foursquareVenue.name}, ${
				foursquareVenue.location.address ||
				foursquareVenue.location.locality
			}`,
			city: foursquareVenue.location.locality || '',
			country: foursquareVenue.location.country || '',
		},
		categories: foursquareVenue.categories.map((cat: any) => ({
			id: cat.id.toString(),
			name: cat.name,
			icon: '📍', // Default, can be mapped from Foursquare icons
			primary: cat.primary || false,
		})),
		starterPackCategory: 'urban', // Will need mapping logic based on Foursquare categories
		memory: {
			title: memoryData.content.title,
			description: memoryData.content.description,
			author: memoryData.author || 'Anonymous',
			createdAt: memoryData.timestamp,
			visibility: memoryData.visibility,
			media: memoryData.media,
		},
	};
};
