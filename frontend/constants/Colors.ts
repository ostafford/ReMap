const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export default {
	light: {
		text: '#000',
		background: '#fff',
		tint: tintColorLight,
		tabIconDefault: '#ccc',
		tabIconSelected: tintColorLight,
	},
	dark: {
		text: '#fff',
		background: '#000',
		tint: tintColorDark,
		tabIconDefault: '#ccc',
		tabIconSelected: tintColorDark,
	},
};

export const ReMapColors = {
	// Primary Brand Colors
	primary: {
		accent: '#4800E2',
		black: '#1E1E1E',
		violet: '#855988', // Chinese Violet
		lavender: '#6B4984', // Dark Lavender
		regalia: '#6B4984', // Regalia
		blue: '#2B2F77', // St. Patrick's Blue
		cadet: '#141852', // Space Cadet
		cetacean: '#070B34', // Cetacean Blue
		testing: '#6c7075',
	},

	// UI Colors
	ui: {
		background: '#F8FAFC',
		cardBackground: '#FFFFFF',
		text: '#1F2937',
		textSecondary: '#6B7280',
		border: '#E5E7EB',
		grey: '#D9D9D9',
	},

	// Semantic Colors
	semantic: {
		success: '#10B981',
		error: '#EF4444',
		warning: '#F59E0B',
		info: '#3B82F6',
	},
};

// Quick access to your brand colors
export const BrandColors = {
	primary: ReMapColors.primary.violet,
	secondary: ReMapColors.primary.lavender,
	accent: ReMapColors.primary.blue,
	dark: ReMapColors.primary.cadet,
	background: ReMapColors.ui.background,
	white: ReMapColors.ui.cardBackground,
	text: ReMapColors.ui.text,
};
