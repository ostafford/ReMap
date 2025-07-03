import type { Enums } from "@/types/database";


export const CATEGORIES = [
	{
		name: 'Cafe Explorer',
		icon: '☕',
		description: 'Discover cozy cafes and coffee culture',
		category: 'cafe',
		color: '#8B4513',
	},
	{
		name: 'Nightlife Guide',
		icon: '🍺',
		description: 'Bars, clubs, and entertainment venues',
		category: 'nightlife',
		color: '#4A148C',
	},
	{
		name: 'Foodie Adventures',
		icon: '🍽️',
		description: 'Restaurants, food trucks, and culinary experiences',
		category: 'food',
		color: '#FF5722',
	},
	{
		name: 'Culture Seeker',
		icon: '🎨',
		description: 'Museums, galleries, and cultural landmarks',
		category: 'culture',
		color: '#9C27B0',
	},
	{
		name: 'Nature Lover',
		icon: '🌳',
		description: 'Parks, trails, and outdoor adventures',
		category: 'nature',
		color: '#4CAF50',
	},
	{
		name: 'Urban Explorer',
		icon: '🛍️',
		description: 'Shopping, landmarks, and city life',
		category: 'urban',
		color: '#2196F3',
	},
] satisfies {
	category: Enums<"category">;
	name: string;
	icon: string;
	description: string;
	color: string;
}[];
