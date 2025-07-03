// Pins logic
import { Request, Response } from 'express';

import multer from 'multer';

import supabase from '../supabase/supabaseClient';

import { formatLocalTime } from '../modules/utilities';

// @desc Create pin
// @route POST /api/pins/user

// temporarily saves incoming files in buffer
const upload = multer({ storage: multer.memoryStorage() });

export const createPin = [
	upload.fields([{ name: 'image', maxCount: 5 }, { name: 'audio' }]),
	async (req: Request, res: Response) => {
		const imageFiles = (req.files as any)?.image || [];
		const audioFile = (req.files as any)?.audio?.[0];

		let imageUrls: string[] = [];
		let audioUrl: string | undefined = undefined;

		const user = req.user;

		if (!user) {
			res.status(401).json({ message: 'Unauthorized' });
			return;
		}

		let user_name = 'user';
		let user_id = user.id;

		try {
			const { data: profileData, error: profileError } = await supabase
				.from('profiles')
				.select('username, id')
				.eq('id', user.id)
				.single();

			if (profileError) {
				console.log(
					'Profile not found, using defaults:',
					profileError.message
				);

				// Continue with defaults rather than failing
			} else {
				user_name =
					profileData.username || user.email?.split('@')[0] || 'user';
				user_id = profileData.id;
				console.log('User profile found:', user_name);
			}
		} catch (error) {
			console.log('Profile lookup failed, using defaults');
			// Continue with fallback values
		}

		try {
			// Process multiple images
			for (const imageFile of imageFiles) {
				if (!imageFile.mimetype.startsWith('image/')) {
					console.log('Invalid file type. Only images are allowed');
					res.status(400).json({
						msg: 'Invalid file type. Only images are allowed',
					});
					return;
				}

				const { buffer, mimetype } = imageFile;

				// Image naming with timestamp and random suffix
				const timestamp = Date.now();
				const randomSuffix = Math.random().toString(36).substring(2, 8);
				const fileExtension = mimetype.split('/')[1]; // jpg, png, etc.
				const imageName = `${user_name}_${timestamp}_${randomSuffix}.${fileExtension}`;

				console.log('Uploading image with name:', imageName);

				const { error: uploadError } = await supabase.storage
					.from('images')
					.upload(imageName, buffer, {
						contentType: mimetype,
						upsert: false,
					});

				if (uploadError) {
					console.log(
						`Error uploading image file: ${uploadError.message}`
					);
					res.status(400).json({ error: uploadError.message });
					return;
				}

				const {
					data: { publicUrl },
				} = supabase.storage.from('images').getPublicUrl(imageName);

				imageUrls.push(publicUrl);
				console.log('Image uploaded successfully:', publicUrl);
			}
		} catch (err: any) {
			console.log('Update image server error', err.message);
			res.status(500).json({ 'Update image server error': err.message });
			return;
		}

		try {
			if (audioFile) {
				if (!audioFile.mimetype.startsWith('audio/')) {
					console.log('Invalid file type. Only audios are allowed');
					res.status(400).json({
						msg: 'Invalid file type. Only audios are allowed',
					});
					return;
				}

				const { buffer, mimetype } = audioFile;

				// FIXED: Better audio naming
				const timestamp = Date.now();
				const randomSuffix = Math.random().toString(36).substring(2, 8);
				const audioName = `${user_name}_audio_${timestamp}_${randomSuffix}.m4a`;

				console.log('Uploading audio with name:', audioName);

				const { error: uploadError } = await supabase.storage
					.from('audio')
					.upload(audioName, buffer, {
						contentType: mimetype,
						upsert: false,
					});

				if (uploadError) {
					console.log(
						`Error uploading audio file: ${uploadError.message}`
					);
					res.status(400).json({ error: uploadError.message });
					return;
				}

				const {
					data: { publicUrl },
				} = supabase.storage.from('audio').getPublicUrl(audioName);

				audioUrl = publicUrl;
				console.log('Audio uploaded successfully:', audioUrl);
			}
		} catch (err: any) {
			console.log('Upload audio server error', err.message);
			res.status(500).json({
				msg: 'Upload audio server error',
				error: err.message,
			});
			return;
		}

		const { name, description, latitude, longitude } = req.body;

		// Extract additional fields from frontend (USE THIS FOR BOTTOMSHEET)
		const location_query = req.body.location_query || '';

		// Parse JSON fields that come as strings in FormData
		let visibility = 'public'; // Default
		let social_circle_ids: string[] = [];

		try {
			if (req.body.visibility) {
				const parsed = JSON.parse(req.body.visibility);
				visibility = Array.isArray(parsed) ? parsed[0] : parsed; // Take first if array
			}
		} catch (error) {
			console.log('Could not parse visibility, using default');
		}

		try {
			if (req.body.social_circle_ids) {
				social_circle_ids = JSON.parse(req.body.social_circle_ids);
			}
		} catch (error) {
			console.log('Could not parse social_circle_ids, using empty array');
		}

		console.log('Extracted form data:', {
			name,
			description,
			latitude: parseFloat(latitude),
			longitude: parseFloat(longitude),
			location_query,
			visibility,
			social_circle_ids,
		});

		// Validate coordinates
		const lat = parseFloat(latitude);
		if (isNaN(lat) || lat < -90 || lat > 90) {
			console.log('Invalid latitude');
			res.status(400).json('Latitude must be between -90 and 90');
			return;
		}

		const lon = parseFloat(longitude);
		if (isNaN(lon) || lon < -180 || lon > 180) {
			console.log('Invalid longitude');
			res.status(400).json('Longitude must be between -180 and 180');
			return;
		}

		try {
			const { data, error } = await supabase
				.from('pins')
				.insert({
					name,
					description,
					latitude: lat,
					longitude: lon,
					location_query,
					image_urls: imageUrls,
					audio_url: audioUrl,
					owner_id: user_id,
					visibility,
					social_circle_ids:
						social_circle_ids.length > 0 ? social_circle_ids : null,
					private_pin: visibility === 'private',
				})
				.select();

			if (error) {
				console.log('Create pin error:', error.message);
				res.status(400).json({ 'Create pin error': error.message });
				return;
			}

			console.log('Created Pin:', data);

			// Response format
			res.status(201).json({
				success: true,
				message: 'Pin created successfully',
				data: data[0], // Return single pin object instead of array
			});
		} catch (err: any) {
			console.log('Create pin server error', err.message);
			res.status(500).json({ 'Create pin server error': err.message });
		}
	},
];

// @desc Get all pins
// @route GET /api/pins/user
export const listPins = async (req: Request, res: Response) => {
	const user = req.user;

	if (!user) {
		res.status(401).json({ message: 'Unauthorized' });
		return;
	}

	try {
		// First, get all pins owned by the user (including private ones)
		const { data: userPins, error: userPinsError } = await supabase
			.from('pins')
			.select(
				`
				*,
				owner:profiles!pins_owner_id_fkey(
					id,
					username,
					full_name,
					avatar_url
				)
			`
			)
			.eq('owner_id', user.id);

		if (userPinsError) {
			console.log('List user pins error:', userPinsError.message);
			res.status(400).json({
				'List user pins error': userPinsError.message,
			});
			return;
		}

		// Get public pins (visible to everyone)
		const { data: publicPins, error: publicPinsError } = await supabase
			.from('pins')
			.select(
				`
				*,
				owner:profiles!pins_owner_id_fkey(
					id,
					username,
					full_name,
					avatar_url
				)
			`
			)
			.eq('visibility', 'public')
			.neq('owner_id', user.id); // Exclude user's own pins (already included above)

		if (publicPinsError) {
			console.log('List public pins error:', publicPinsError.message);
			res.status(400).json({
				'List public pins error': publicPinsError.message,
			});
			return;
		}

		// Get social pins where user is a member of the circle
		// First, get user's social circles
		const { data: userCircles, error: circlesError } = await supabase
			.from('members')
			.select('circle_id')
			.eq('user_id', user.id);

		if (circlesError) {
			console.log('Get user circles error:', circlesError.message);
			// Continue without social pins if there's an error
		}

		let socialPins: any[] = [];
		if (userCircles && userCircles.length > 0) {
			const circleIds = userCircles.map((c) => c.circle_id);

			// Get pins that are shared with any of user's circles
			const { data: socialPinsData, error: socialPinsError } =
				await supabase
					.from('pins')
					.select(
						`
					*,
					owner:profiles!pins_owner_id_fkey(
						id,
						username,
						full_name,
						avatar_url
					)
				`
					)
					.eq('visibility', 'social')
					.neq('owner_id', user.id) // Exclude user's own pins
					.overlaps('social_circle_ids', circleIds);

			if (socialPinsError) {
				console.log('List social pins error:', socialPinsError.message);
				// Continue without social pins if there's an error
			} else {
				socialPins = socialPinsData || [];
			}
		}

		// Combine all pins and remove duplicates
		const allPins = [
			...(userPins || []),
			...(publicPins || []),
			...socialPins,
		];

		// Remove duplicates based on pin ID
		const uniquePins = allPins.filter(
			(pin, index, self) =>
				index === self.findIndex((p) => p.id === pin.id)
		);

		console.log(
			`📊 [BACKEND] Returning ${uniquePins.length} pins for user ${user.id}:`
		);
		console.log(`   - User's pins: ${userPins?.length || 0}`);
		console.log(`   - Public pins: ${publicPins?.length || 0}`);
		console.log(`   - Social pins: ${socialPins.length}`);

		res.status(200).json(uniquePins);
	} catch (error) {
		console.error('List pins error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

// @desc Get single pin
// @route GET /api/pins/user/:pinId
export const getPin = async (req: Request, res: Response) => {
	const pin_Id = req.params.pinId;

	const user = req.user;

	if (!user) {
		res.status(401).json({ message: 'Unauthorized' });
		return;
	}

	try {
		// Updated query to include user profile data via JOIN
		const { data: pins, error } = await supabase
			.from('pins')
			.select(
				`
				*,
				owner:profiles!pins_owner_id_fkey(
					id,
					username,
					full_name,
					avatar_url
				)
			`
			)
			.eq('id', pin_Id)
			.eq('owner_id', user.id) // check current user id is owner_id
			.single();

		if (error) {
			console.log('Get single user pin error:', error.message);
			res.status(400).json({
				'Get single user pin error': error.message,
			});
			return;
		}
		console.log('User Pin:', pins);
		res.status(200).json(pins);
	} catch (err: any) {
		console.log('Get single user pin server error', err.message);
		res.status(500).json({
			'Get single user pin server error': err.message,
		});
	}
};

// @desc Update single pin
// @route PUT /api/pins/user/:pinId
export const updatePin = [
	upload.fields([{ name: 'image', maxCount: 5 }, { name: 'audio' }]),
	async (req: Request, res: Response) => {
		const id = req.params.id;

		const user = req.user;

		if (!user) {
			res.status(401).json({ message: 'Unauthorized' });
			return;
		}

		const imageFiles = (req.files as any)?.image || [];
		const audioFile = (req.files as any)?.audio?.[0];

		let imageUrls: string[] = [];
		let audioUrl: string | undefined = undefined;

		// Get user name and id
		const { data, error } = await supabase
			.from('profiles')
			.select()
			.eq('id', id)
			.eq('owner_id', user.id) // check current user id is owner_id
			.single();

		if (error) {
			console.log('Can not get user details:', error.message);
			res.status(400).json({
				'Can not get user details:': error.message,
			});
			return;
		}
		console.log('User name:', data.username);
		const user_name = data.username;

		const user_id = data.id;

		try {
			// Process multiple images
			for (const imageFile of imageFiles) {
				// Check if the file is an image (starts with "image/")
				if (!imageFile.mimetype.startsWith('image/')) {
					console.log('Invalid file type. Only images are allowed');
					res.status(400).json({
						msg: 'Invalid file type. Only images are allowed',
					});
					return;
				}

				const { buffer, mimetype } = imageFile;

				// image name - user name : dd/mm/yyyy hh:mm:ss
				const imageName = `${user_name}:${formatLocalTime()}`;

				const { error } = await supabase.storage
					.from('images')
					.upload(imageName, buffer, {
						contentType: mimetype,
						upsert: false, // prevent overwriting
					});

				if (error) {
					console.log(`Error uploading image file: ${error.message}`);
					res.status(400).json({ error: error.message });
					return;
				}

				const {
					data: { publicUrl },
				} = supabase.storage.from('images').getPublicUrl(imageName);

				imageUrls.push(publicUrl);
			}
		} catch (err: any) {
			console.log('Update image server error', err.message);
			res.status(500).json({ 'Update image server error': err.message });
		}

		try {
			if (audioFile) {
				// Check if the file is an image (starts with "audio/")
				if (!audioFile.mimetype.startsWith('audio/')) {
					console.log('Invalid file type. Only audios are allowed');
					res.status(400).json({
						msg: 'Invalid file type. Only audios are allowed',
					});
					return;
				}

				const { buffer, mimetype } = audioFile;

				// audio name - user name : dd/mm/yyyy hh:mm:ss
				const audioName = `${user_name}:${formatLocalTime()}`;

				const { error } = await supabase.storage
					.from('audio')
					.upload(audioName, buffer, {
						contentType: mimetype,
						upsert: false, // prevent overwriting
					});

				if (error) {
					console.log(`Error uploading audio file: ${error.message}`);
					res.status(400).json({ error: error.message });
				}

				const {
					data: { publicUrl },
				} = supabase.storage.from('audio').getPublicUrl(audioName);

				audioUrl = publicUrl;
			}
		} catch (err: any) {
			console.log('Upload audio server error', err.message);
			res.status(500).json({
				msg: 'Upload audio server error',
				error: err.message,
			});
		}

		const { name, description, latitude, longitude } = req.body;

		// Checks latitude is within range
		const lat = parseFloat(latitude);
		if (isNaN(lat)) {
			console.log('Latitude must be a valid number');
			res.status(400).json('Latitude must be a valid number');
			return;
		}
		if (lat < -90 || lat > 90) {
			console.log('Latitude must be between -90 and 90');
			res.status(400).json('Latitude must be between -90 and 90');
			return;
		}

		// Checks longitude is within range
		const lon = parseFloat(longitude);
		if (isNaN(lon)) {
			console.log('Longitude must be a valid number');
			res.status(400).json('Longitude must be a valid number');
			return;
		}
		if (lon < -180 || lon > 180) {
			console.log('Longitude must be between -180 and 180');
			res.status(400).json('Longitude must be between -180 and 180');
			return;
		}

		try {
			const { data, error } = await supabase
				.from('pins')
				.update({
					name,
					description,
					latitude,
					longitude,
					image_urls: imageUrls,
					audio_url: audioUrl,
					owner_id: user_id,
				})
				.select();

			if (error) {
				console.log('Update pin error:', error.message);
				res.status(400).json({ 'Update pin error': error.message });
				return;
			}
			console.log('Updated Pin:', data);
			res.status(200).json(data);
		} catch (err: any) {
			console.log('Update pin server error', err.message);
			res.status(500).json({ 'Update pin server error': err.message });
		}
	},
];

// @desc Delete single pin
// @route DELETE /api/pins/user/:pinId
export const deletePin = async (req: Request, res: Response) => {
	const pin_id = req.params.pinId;

	const user = req.user;

	if (!user) {
		res.status(401).json({ message: 'Unauthorized' });
		return;
	}

	try {
		const { error } = await supabase
			.from('pins')
			.delete()
			.eq('id', pin_id)
			.eq('owner_id', user.id);

		if (error) {
			console.log(`Delete pin: ${pin_id} error: ${error.message}`);
			res.status(400).json(
				`Delete pin: ${pin_id} error: ${error.message}`
			);
			return;
		}
		console.log(`Pin: ${pin_id} deleted`);
		res.status(200).json(`Pin: ${pin_id} deleted`);
	} catch (err: any) {
		console.log('Delete pin server error', err.message);
		res.status(500).json({ 'Delete pin server error': err.message });
	}
};

// @desc Get pins at specific location (for "Next Memory" feature)
// @route GET /api/pins/user/location/:latitude/:longitude
export const getPinsAtLocation = async (req: Request, res: Response) => {
	const { latitude, longitude } = req.params;
	const user = req.user;

	if (!user) {
		res.status(401).json({ message: 'Unauthorized' });
		return;
	}

	// Convert to numbers and validate
	const lat = parseFloat(latitude);
	const lng = parseFloat(longitude);

	if (isNaN(lat) || isNaN(lng)) {
		res.status(400).json({ message: 'Invalid coordinates' });
		return;
	}

	try {
		// Get pins at the same location (within small radius)
		// Using 0.001 degree radius (roughly 100 meters)
		const radius = 0.001;

		const { data: pins, error } = await supabase
			.from('pins')
			.select(
				`
				*,
				owner:profiles!pins_owner_id_fkey(
					id,
					username,
					full_name,
					avatar_url
				)
			`
			)
			.gte('latitude', lat - radius)
			.lte('latitude', lat + radius)
			.gte('longitude', lng - radius)
			.lte('longitude', lng + radius)
			.order('created_at', { ascending: false });

		if (error) {
			console.log('Get pins at location error:', error.message);
			res.status(400).json({
				'Get pins at location error': error.message,
			});
			return;
		}

		console.log(`Found ${pins.length} pins at location (${lat}, ${lng})`);
		res.status(200).json({
			'Pins at location': pins,
			location: { latitude: lat, longitude: lng },
			count: pins.length,
		});
	} catch (err: any) {
		console.log('Get pins at location server error', err.message);
		res.status(500).json({
			'Get pins at location server error': err.message,
		});
	}
};
