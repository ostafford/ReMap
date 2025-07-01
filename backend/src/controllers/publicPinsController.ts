// Public pins logic
import { Request, Response } from 'express';

import supabase from '../supabase/supabaseClient';

// @desc Get all pins
// @route GET /api/pins/
export const publicListPins = async (req: Request, res: Response) => {
	try {
		const { data: pins, error } = await supabase
			.from('pins')
<<<<<<< HEAD
			.select()
			.eq('private_pin', false);
=======
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
			.neq('visibility', 'private');
>>>>>>> 13d4256c699d9b048d56625de6074c3413f684c7

		if (error) {
			console.log('List pins error:', error.message);
			res.status(400).json({ 'List pins error': error.message });
			return;
		}
		console.log('List pins:', pins);
		res.status(200).json({ 'List pins': pins });
	} catch (err: any) {
		console.log('List pins server error', err.message);
		res.status(500).json({ 'List pins server error': err.message });
	}
};

// @desc Get single pin
// @route GET /api/pins/:pinId
export const publicGetPin = async (req: Request, res: Response) => {
	const pin_Id = req.params.pinId;

	try {
		const { data: pins, error } = await supabase
			.from('pins')
<<<<<<< HEAD
			.select()
			.eq('id', pin_Id)
			.eq('private_pin', false)
=======
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
			.neq('visibility', 'private')
>>>>>>> 13d4256c699d9b048d56625de6074c3413f684c7
			.single();

		if (error) {
			console.log('Get single pin error:', error.message);
			res.status(400).json({ 'Get single pin error': error.message });
			return;
		}
		console.log('Pin:', pins);
		res.status(200).json({ Pin: pins });
	} catch (err: any) {
		console.log('Get single pin server error', err.message);
		res.status(500).json({ 'Get single pin server error': err.message });
	}
};
