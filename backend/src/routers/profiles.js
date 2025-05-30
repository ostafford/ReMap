// Profile routes
import supabase from '../config/supabaseClient.js';
import { Router } from 'express';

const router = Router();

// GET route
router.get('/', async (_, res) => {
    // access supabase data
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) {
        return res.status(400).json({msg: error.message});
    };

    res.status(200).json(data);
})

// POST route
router.post('/', async (req, res) => {
  const { username, full_name } = req.body;

  const { data, error } = await supabase
    .from('profiles')
    .insert([ {username, full_name} ]);
  
  if (error) {
    return res.status(400).json({msg: error.message});
  };

  console.log(req.body);
  res.status(201).json(data);
});

export default router;
