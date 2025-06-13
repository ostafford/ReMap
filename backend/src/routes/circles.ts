// Circles routes
import { Router } from "express";

import { addMember, createCircle, deleteCircle, getCircle, listCircles, updateCircle } from '../controllers/circlesController';

import checkUser from "../middleware/userAuth";

const router = Router();


router.use(checkUser);

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

// Add member to circle
router.post("/members", addMember);

export default router;
