export interface DummySocialCircle {
	id: string;
	name: string;
	memberCount: number;
	description: string;
	color: string;
	members?: Array<{
		id: string;
		name: string;
		avatar?: string;
	}>;
}

export const DUMMY_SOCIAL_CIRCLES: DummySocialCircle[] = [
	{
		id: 'family',
		name: 'Family Circle',
		memberCount: 8,
		description: 'Close family members',
		color: '#FF6B6B',
		members: [
			{ id: 'mom', name: 'Mom' },
			{ id: 'dad', name: 'Dad' },
			{ id: 'sister', name: 'Sarah' },
			{ id: 'brother', name: 'Mike' },
			{ id: 'grandma', name: 'Grandma Rose' },
			{ id: 'grandpa', name: 'Grandpa Joe' },
			{ id: 'aunt', name: 'Aunt Lisa' },
			{ id: 'uncle', name: 'Uncle Tom' },
		],
	},
	{
		id: 'work_friends',
		name: 'Work Friends',
		memberCount: 12,
		description: 'Colleagues and work buddies',
		color: '#4ECDC4',
		members: [
			{ id: 'john', name: 'John Smith' },
			{ id: 'jane', name: 'Jane Doe' },
			{ id: 'alex', name: 'Alex Chen' },
			{ id: 'maria', name: 'Maria Rodriguez' },
		],
	},
	{
		id: 'university',
		name: 'University Squad',
		memberCount: 15,
		description: 'University friends and classmates',
		color: '#45B7D1',
		members: [
			{ id: 'emma', name: 'Emma Wilson' },
			{ id: 'ryan', name: 'Ryan Taylor' },
			{ id: 'sophia', name: 'Sophia Lee' },
		],
	},
	{
		id: 'hiking_group',
		name: 'Adventure Hikers',
		memberCount: 6,
		description: 'Weekend hiking enthusiasts',
		color: '#96CEB4',
		members: [
			{ id: 'trail_master', name: 'Trail Master Tom' },
			{ id: 'summit_sarah', name: 'Summit Sarah' },
		],
	},
	{
		id: 'book_club',
		name: 'Book Club',
		memberCount: 9,
		description: 'Monthly book discussion group',
		color: '#FFEAA7',
		members: [
			{ id: 'bookworm', name: 'Literary Lisa' },
			{ id: 'critic', name: 'Critical Carl' },
		],
	},
	{
		id: 'gym_buddies',
		name: 'Gym Buddies',
		memberCount: 4,
		description: 'Workout partners and fitness friends',
		color: '#FF7675',
		members: [
			{ id: 'trainer', name: 'Trainer Tim' },
			{ id: 'cardio_queen', name: 'Cardio Queen' },
		],
	},
];

// ==================================================
// TESTING FUNCTIONS
// ==================================================

// Test function to simulate getUserSocialCircles()
export const getTestSocialCircles = async (): Promise<DummySocialCircle[]> => {
	return new Promise((resolve) => {
		// Simulate API delay
		setTimeout(() => {
			console.log(' Test: Loaded dummy social circles');
			resolve(DUMMY_SOCIAL_CIRCLES);
		}, 500);
	});
};
