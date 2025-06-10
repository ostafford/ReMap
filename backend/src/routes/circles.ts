// Circles routes
import { Router } from 'express';

import { createCircle, deleteCircle, getCircle, listCircles, updateCircle } from '../controllers/circlesController';

const router = Router();


// Create circle
router.post("/", createCircle);

//  List circles
router.get("/", listCircles);

// Get single circle
router.get("/:circleId", getCircle);

// Update circle
router.put("/:circleId", updateCircle);

// Delete circle
router.delete("/:circleId", deleteCircle);

export default router;
