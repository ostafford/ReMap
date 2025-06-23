// Pins routes
import { Router } from 'express';

import {
	createPin,
	deletePin,
	getPin,
	listPins,
	updatePin,
} from '../controllers/pinsController';

import checkUser from '../middleware/userAuth';

import {
	publicGetPin,
	publicListPins,
} from '../controllers/publicPinsController';

const router = Router();

/* ----------------- Private --------------------- */
// Create pin
router.post('/user', checkUser, createPin);

// Get all pins
router.get('/user', checkUser, listPins);

// Get single pin
router.get('/user/:pinId', checkUser, getPin);

// Update pins
router.put('/user/:pinId', checkUser, updatePin);

// Delete pins
router.delete('/user/:pinId', checkUser, deletePin);

/* ----------------- Public --------------------- */
// Get all pins
router.get('/', publicListPins);

// Get single pin
router.get('/:pinId', publicGetPin);

export default router;
