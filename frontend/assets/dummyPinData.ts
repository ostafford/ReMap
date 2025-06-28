// ==============================
//   DUMMY PIN DATA FOR TESTING
// ==============================

export interface MediaItem {
	uri: string;
	type: 'photo' | 'video';
	name: string;
}

export interface DummyPin {
	id: string;
	name: string; // Location/business name
	description: string; // User's memory description
	latitude: number;
	longitude: number;
	address: string;
	author: string; // Who created this memory
	createdAt: string; // When memory was created
	visibility: string; // Backend returns single string, not array
	imageUrls: string[] | null; // URLs for photos
	audioUrl: string | null; // URL for audio
	videoUrls: string[] | null; // URLs for videos
	ownerId: string; // User ID who owns this pin
	locationQuery: string; // Human readable location query
	socialCircleIds: string[]; // Social circle IDs
	categories: {
		id: string;
		name: string;
		icon: string;
		primary: boolean;
	}[];
	starterPackCategory: string; // Maps to our starter pack system
}

export const DUMMY_PINS: DummyPin[] = [
	// =============================
	//   CAFE EXPLORER MEMORIES
	// =============================
	{
		id: 'cafe_001',
		name: 'Patricia Coffee Brewers',
		description:
			'Found this tiny cafe tucked away in the city. The barista took so much care explaining the different beans. My first proper Melbourne coffee experience - now I understand the hype!',
		latitude: -37.8154,
		longitude: 144.9636,
		address: '1 Little Bourke Street',
		author: 'Sarah_M',
		createdAt: '2024-01-15T10:30:00Z',
		visibility: 'public',
		imageUrls: ['dummy_photo_1.jpg'],
		audioUrl: null,
		videoUrls: null,
		ownerId: 'user123',
		locationQuery: '1 Little Bourke Street, Melbourne',
		socialCircleIds: [],
		categories: [
			{
				id: 'cafe_cat',
				name: 'Coffee Shop',
				icon: '☕',
				primary: true,
			},
		],
		starterPackCategory: 'cafes',
	},
	{
		id: 'cafe_002',
		name: 'Degraves Espresso Bar',
		description:
			'Standing in this narrow laneway with my coffee, watching Melbourne life flow by. Street art on the walls, coffee in hand - this is what Melbourne feels like.',
		latitude: -37.8186,
		longitude: 144.9631,
		address: 'Degraves Street',
		author: 'CoffeeAddict_99',
		createdAt: '2024-02-01T14:15:00Z',
		visibility: 'public',
		imageUrls: ['dummy_photo_2.jpg'],
		audioUrl: 'dummy_audio_1.m4a',
		videoUrls: null,
		ownerId: 'user456',
		locationQuery: 'Degraves Street, Melbourne',
		socialCircleIds: [],
		categories: [
			{
				id: 'cafe_cat',
				name: 'Coffee Shop',
				icon: '☕',
				primary: true,
			},
		],
		starterPackCategory: 'cafes',
	},
	{
		id: 'cafe_003',
		name: 'Brother Baba Budan',
		description:
			'No seats here, just pure coffee focus. The barista explained their single origin in detail. Sometimes the best experiences happen when you have to slow down and just be present.',
		latitude: -37.8078,
		longitude: 144.9651,
		address: '359 Little Bourke Street',
		author: 'BaristaBen',
		createdAt: '2024-01-20T09:45:00Z',
		visibility: 'social',
		imageUrls: [],
		audioUrl: null,
		videoUrls: null,
		ownerId: 'user789',
		locationQuery: '359 Little Bourke Street, Melbourne',
		socialCircleIds: [],
		categories: [
			{
				id: 'cafe_cat',
				name: 'Coffee Shop',
				icon: '☕',
				primary: true,
			},
		],
		starterPackCategory: 'cafes',
	},

	// =============================
	//   NIGHTLIFE GUIDE MEMORIES
	// =============================
	{
		id: 'nightlife_001',
		name: 'Rooftop Bar',
		description:
			'Celebrating my promotion with friends as the sun set over Melbourne. The city looked magical from up here. The bartender made us a custom cocktail when we told him what we were celebrating!',
		latitude: -37.8136,
		longitude: 144.9631,
		address: 'Level 6, Curtin House',
		author: 'NightOwl_Mel',
		createdAt: '2024-02-10T19:30:00Z',
		visibility: 'public',
		imageUrls: ['dummy_photo_3.jpg', 'dummy_photo_4.jpg'],
		audioUrl: null,
		videoUrls: null,
		ownerId: 'user101',
		locationQuery: 'Level 6, Curtin House, Melbourne',
		socialCircleIds: [],
		categories: [
			{
				id: 'bar_cat',
				name: 'Cocktail Bar',
				icon: '🍸',
				primary: true,
			},
		],
		starterPackCategory: 'nightlife',
	},
	{
		id: 'nightlife_002',
		name: 'Eau De Vie',
		description: "Dad's whisky education night",
		latitude: -37.8125,
		longitude: 144.959,
		address: '1 Malthouse Lane',
		author: 'WhiskyWanderer',
		createdAt: '2024-01-25T21:00:00Z',
		visibility: 'social',
		imageUrls: ['dummy_photo_5.jpg'],
		audioUrl: null,
		videoUrls: null,
		ownerId: 'user102',
		locationQuery: '1 Malthouse Lane, Melbourne',
		socialCircleIds: [],
		categories: [
			{
				id: 'whiskey_cat',
				name: 'Whisky Bar',
				icon: '🥃',
				primary: true,
			},
		],
		starterPackCategory: 'nightlife',
	},

	// =============================
	//   FOODIE ADVENTURES MEMORIES
	// =============================
	{
		id: 'foodie_001',
		name: 'Chin Chin',
		description:
			'Took my now-partner here on our first date 3 years ago. We waited 45 minutes for a table and talked the whole time. The pad thai was amazing but the conversation was even better. We come back every anniversary.',
		latitude: -37.8181,
		longitude: 144.9647,
		address: '125 Flinders Lane',
		author: 'FoodieExplorer',
		createdAt: '2024-02-05T20:15:00Z',
		visibility: 'social',
		imageUrls: ['dummy_photo_6.jpg'],
		audioUrl: null,
		videoUrls: null,
		ownerId: 'user103',
		locationQuery: '125 Flinders Lane, Melbourne',
		socialCircleIds: [],
		categories: [
			{
				id: 'thai_cat',
				name: 'Thai Restaurant',
				icon: '🍜',
				primary: true,
			},
		],
		starterPackCategory: 'foodie',
	},
	{
		id: 'foodie_002',
		name: 'Movida',
		description:
			"Exploring Hosier Lane's incredible street art before dinner. The graffiti changes constantly but Movida's paella remains perfect. Love how Melbourne mixes culture and cuisine so naturally.",
		latitude: -37.8143,
		longitude: 144.9665,
		address: '1 Hosier Lane',
		author: 'SpanishFoodie',
		createdAt: '2024-01-30T19:45:00Z',
		visibility: 'public',
		imageUrls: ['dummy_photo_7.jpg'],
		audioUrl: null,
		videoUrls: null,
		ownerId: 'user104',
		locationQuery: '1 Hosier Lane, Melbourne',
		socialCircleIds: [],
		categories: [
			{
				id: 'spanish_cat',
				name: 'Spanish Restaurant',
				icon: '🥘',
				primary: true,
			},
		],
		starterPackCategory: 'foodie',
	},

	// =============================
	//   CULTURE SEEKER MEMORIES
	// =============================
	{
		id: 'culture_001',
		name: 'National Gallery of Victoria',
		description:
			'Ducked in here to escape the rain and ended up spending 4 hours lost in the contemporary wing. Found a painting that made me cry - art has never hit me like that before. Sometimes the best discoveries are unplanned.',
		latitude: -37.8226,
		longitude: 144.9685,
		address: '180 St Kilda Road',
		author: 'ArtLover_Melb',
		createdAt: '2024-02-08T14:30:00Z',
		visibility: 'public',
		imageUrls: ['dummy_photo_8.jpg'],
		audioUrl: 'dummy_audio_2.m4a',
		videoUrls: null,
		ownerId: 'user105',
		locationQuery: '180 St Kilda Road, Melbourne',
		socialCircleIds: [],
		categories: [
			{
				id: 'museum_cat',
				name: 'Art Museum',
				icon: '🎨',
				primary: true,
			},
		],
		starterPackCategory: 'culture',
	},
	{
		id: 'culture_002',
		name: 'Melbourne Museum',
		description:
			"My 6-year-old nephew's first museum visit. Watching his face light up at the T-Rex skeleton was priceless. He asked a million questions and I loved seeing Melbourne's history through his wonder-filled eyes.",
		latitude: -37.8033,
		longitude: 144.9717,
		address: '11 Nicholson Street',
		author: 'HistoryBuff_VIC',
		createdAt: '2024-01-12T11:00:00Z',
		visibility: 'social',
		imageUrls: ['dummy_photo_9.jpg'],
		audioUrl: null,
		videoUrls: null,
		ownerId: 'user106',
		locationQuery: '11 Nicholson Street, Melbourne',
		socialCircleIds: [],
		categories: [
			{
				id: 'history_cat',
				name: 'History Museum',
				icon: '🏛️',
				primary: true,
			},
		],
		starterPackCategory: 'culture',
	},

	// =============================
	//   NATURE LOVER MEMORIES
	// =============================
	{
		id: 'nature_001',
		name: 'Royal Botanic Gardens Melbourne',
		description:
			'Started doing sunrise meditation here during lockdown. This spot by the lake became my sanctuary. The black swans still recognize me and swim over expecting bread. Nature heals in ways I never understood before.',
		latitude: -37.8304,
		longitude: 144.9803,
		address: 'Birdwood Avenue',
		author: 'NatureLover_Aus',
		createdAt: '2024-02-12T16:20:00Z',
		visibility: 'private',
		imageUrls: ['dummy_photo_10.jpg'],
		audioUrl: 'dummy_audio_3.m4a',
		videoUrls: null,
		ownerId: 'user107',
		locationQuery: 'Birdwood Avenue, Melbourne',
		socialCircleIds: [],
		categories: [
			{
				id: 'park_cat',
				name: 'Botanical Garden',
				icon: '🌿',
				primary: true,
			},
		],
		starterPackCategory: 'nature',
	},
	{
		id: 'nature_002',
		name: 'Fitzroy Gardens',
		description:
			'Finally proposed to my girlfriend under the fairy tree where we had our first picnic 5 years ago. She said yes! The fairy tree has watched our whole love story unfold. Some places hold your entire heart.',
		latitude: -37.8129,
		longitude: 144.9797,
		address: 'Wellington Parade',
		author: 'ParkWalker',
		createdAt: '2024-01-28T15:10:00Z',
		visibility: 'social',
		imageUrls: ['dummy_photo_11.jpg'],
		audioUrl: null,
		videoUrls: null,
		ownerId: 'user108',
		locationQuery: 'Wellington Parade, Melbourne',
		socialCircleIds: [],
		categories: [
			{
				id: 'park_cat',
				name: 'Public Park',
				icon: '🌳',
				primary: true,
			},
		],
		starterPackCategory: 'nature',
	},

	// =============================
	//   URBAN EXPLORER MEMORIES
	// =============================
	{
		id: 'urban_001',
		name: 'Queen Victoria Market',
		description:
			"Every Saturday morning for 30 years, mum and I do the market run. Same route, same stallholders who know our names. Bought my first apartment's worth of everything here. Some traditions are worth keeping forever.",
		latitude: -37.8076,
		longitude: 144.9568,
		address: 'Queen Street',
		author: 'MarketLover_Mel',
		createdAt: '2024-02-03T10:45:00Z',
		visibility: 'social',
		imageUrls: ['dummy_photo_12.jpg'],
		audioUrl: null,
		videoUrls: null,
		ownerId: 'user109',
		locationQuery: 'Queen Street, Melbourne',
		socialCircleIds: [],
		categories: [
			{
				id: 'market_cat',
				name: 'Public Market',
				icon: '🛒',
				primary: true,
			},
		],
		starterPackCategory: 'urban',
	},
	{
		id: 'urban_002',
		name: 'Block Arcade',
		description:
			"First time really noticing Melbourne's incredible architecture. This mosaic floor stopped me in my tracks. Started my photography hobby right here with this arcade. Now I see beauty in buildings everywhere.",
		latitude: -37.8149,
		longitude: 144.9655,
		address: '282 Collins Street',
		author: 'ArchitectureFan',
		createdAt: '2024-01-18T13:25:00Z',
		visibility: 'public',
		imageUrls: ['dummy_photo_13.jpg', 'dummy_photo_14.jpg'],
		audioUrl: null,
		videoUrls: null,
		ownerId: 'user110',
		locationQuery: '282 Collins Street, Melbourne',
		socialCircleIds: [],
		categories: [
			{
				id: 'shopping_cat',
				name: 'Shopping Mall',
				icon: '🏛️',
				primary: true,
			},
		],
		starterPackCategory: 'urban',
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
		latitude: pin.latitude,
		longitude: pin.longitude,
	},
	title: pin.name,
	description: pin.description.substring(0, 100) + '...',
	category: pin.starterPackCategory,
	icon: pin.categories[0]?.icon || '📍',
	author: pin.author,
	locationName: pin.name,
});

/**
 * Sample function for future Foursquare API integration
 */
export const convertFoursquareToPin = (
	foursquarePlace: any,
	memoryData: any
): DummyPin => {
	// This function will help convert real Foursquare data + user memory to our pin format
	return {
		id: `${foursquarePlace.fsq_id}_${memoryData.timestamp}`,
		name: foursquarePlace.name,
		description: memoryData.content.description,
		latitude: foursquarePlace.geocodes.main.latitude,
		longitude: foursquarePlace.geocodes.main.longitude,
		address: foursquarePlace.location.address || '',
		author: memoryData.author || 'Anonymous',
		createdAt: memoryData.timestamp,
		visibility: memoryData.visibility,
		imageUrls: memoryData.media.photos.map((photo: any) => photo.uri),
		audioUrl: memoryData.media.audio ? memoryData.media.audio.uri : null,
		videoUrls: memoryData.media.videos
			? memoryData.media.videos.map((video: any) => video.uri)
			: null,
		ownerId: 'user123',
		locationQuery: `${foursquarePlace.location.address || ''} ${
			foursquarePlace.location.locality || ''
		} ${foursquarePlace.location.country || ''}`,
		socialCircleIds: [],
		categories: foursquarePlace.categories.map((cat: any) => ({
			id: cat.id.toString(),
			name: cat.name,
			icon: '📍',
			primary: cat.primary || false,
		})),
		starterPackCategory: 'urban',
	};
};
