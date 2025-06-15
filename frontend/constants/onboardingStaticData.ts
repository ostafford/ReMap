// ===========================
//   ONBOARDING STATIC DATA
// ===========================

// Change Static Data here for it to change at the allocated pages.

// Welcome Steps for intro onboarding flow (3-Slides)
export interface WelcomeStep {
	title: string;
	description: string;
	icon: string;
}

export const WELCOME_STEPS: WelcomeStep[] = [
	{
		title: '📍 Pin Your Memories',
		description:
			'Transform your experiences into an interactive atlas. Every place has a story - yours.',
		icon: '🗺️',
	},
	{
		title: '🌟 Discover Authentic Stories',
		description:
			"Find genuine experiences from real people at places you're visiting or planning to explore.",
		icon: '👥',
	},
	{
		title: '🔒 Your Privacy, Your Choice',
		description:
			'Keep memories private, share with close friends, or contribute to the community - you decide.',
		icon: '🛡️',
	},
];

// Starter Pack options for personalization
// Just used for onboarding however we will need to discuss how this works with the backend etc.
// Created this to easily update rather than in main hook file.
export interface StarterPack {
	id: string;
	name: string;
	icon: string;
	description: string;
	category: string;
	color: string;
}

export const STARTER_PACKS: StarterPack[] = [
	{
		id: 'cafes',
		name: 'Cafe Explorer',
		icon: '☕',
		description: 'Discover cozy cafes and coffee culture',
		category: 'food_drink',
		color: '#8B4513',
	},
	{
		id: 'nightlife',
		name: 'Nightlife Guide',
		icon: '🍺',
		description: 'Bars, clubs, and entertainment venues',
		category: 'nightlife',
		color: '#4A148C',
	},
	{
		id: 'foodie',
		name: 'Foodie Adventures',
		icon: '🍽️',
		description: 'Restaurants, food trucks, and culinary experiences',
		category: 'food_drink',
		color: '#FF5722',
	},
	{
		id: 'culture',
		name: 'Culture Seeker',
		icon: '🎨',
		description: 'Museums, galleries, and cultural landmarks',
		category: 'arts_entertainment',
		color: '#9C27B0',
	},
	{
		id: 'nature',
		name: 'Nature Lover',
		icon: '🌳',
		description: 'Parks, trails, and outdoor adventures',
		category: 'outdoor_recreation',
		color: '#4CAF50',
	},
	{
		id: 'urban',
		name: 'Urban Explorer',
		icon: '🛍️',
		description: 'Shopping, landmarks, and city life',
		category: 'retail',
		color: '#2196F3',
	},
];
