// Sign up and Sign in routes
import supabase from '../config/supabaseClient.js';
import { Router } from 'express';

const router = Router();

// Create new account
router.post('/signUp', async (req, res) => {
    const { email, password } = req.body;
    const { user, error } = await supabase.auth.signUp({
        email, password
    });

    if (error) {
        return res.status(400).json({ msg: error.message });
    }
    
    res.status(201).json(user);
});

// Sign in
router.post('/signIn', async (req, res) => {
    const { email, password } = req.body;
    const { user, error } = await supabase.auth.signInWithPassword({
        email, password
    });

    if (error) {
        return res.status(400).json({ msg: error.message });
    }

    res.status(200).json(user);
});

export default router;
