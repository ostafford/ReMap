// Profile routes
import supabase from '../config/supabaseClient.js';
import { Router } from 'express';

const router = Router();

// Get all profile data
router.get('/', async (_, res) => {
    // access supabase profile data
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) {
        return res.status(400).json({msg: error.message});
    }

    res.status(200).json(data);
})

// Get single user
router.get('/:id', async (req, res) => {
  const id = req.params.id;

  const { data, error } = await supabase
  .from('profiles')
  .select()
  .eq('id', id)
  .single();

  if (error) {
    return res.status(400).json({msg: error.message});
  }

  res.status(200).json({
    'user_id': data.id,
    'username': data.username,
    'first_name': data.first_name,
    'last name': data.last_name,
  });
})

// Update user
router.put('/:id', async (req, res) => {
  const id = req.params.id;

  const { data, error } = await supabase
  .from('profiles')
  .update({
    username: req.body.username,
    first_name: req.body.first_name,
    last_name: req.body.last_name
  })
  .eq('id', id)
  .select();

  if (error) {
    return res.status(400).json({msg: error.message});
  }

  res.status(201).send(data);
})

export default router;
