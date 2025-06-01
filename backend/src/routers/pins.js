// Pins routes
import supabase from '../config/supabaseClient.js';
import { Router } from 'express';

const router = Router();

// Get all pins
router.get('/', async (req, res) => {
    const { data, error } = await supabase
    .from(pins)
    .select();

    if (error) {
        res.status(400).json({msg: error.message});
    }

    res.status(200).json(data);
})

// Get single pin
router.get('/:id', async (req, res) => {
    const id = req.params.id;

    const { data, error } = await supabase
    .from('pins')
    .select()
    .eq('id', id)
    .single();

    if (error) {
        return res.status(400).json({msg: error.message});
    }

    res.status(200).send(data);
})

// Create pins
router.post('/:id', async (req, res) => {
    const id = req.params.id

    // coordinate limits
    if (!req.body.latitude) {
        res.status(400)
    } else if (req.body.latitude <= parseFloat(-90) || req.body.latitude >= parseFloat(90)) {
        res.status(400)
    }

    if (!req.body.longitude) {
        res.status(400)
    } else if (req.body.longitude <= parseFloat(-180) || req.body.longitude >= parseFloat(180)) {
        res.status(400)
    }

    const { data, error } = await supabase
    .from('pins')
    .insert([{
        description: req.body.description,
        latitude: req.body.latitude,
        longitude: req.body.longitude
    }])
    .select()
})

// Update pins

// Delete pins

export default router;
