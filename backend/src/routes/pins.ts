// Pins routes
import { Router } from "express";

import { createPin, deletePin, getPin, listPins, updatePin } from "../controllers/pinsController";

import checkUser from "../middleware/checkUser";

const router = Router();


// Check user signed in
router.use(checkUser);

// Create pin
router.post("/", createPin);

// Get all pins
router.get("/", listPins);

// Get single pin
router.get("/:pinId", getPin);

// Update pins
router.put("/:pinId", updatePin);

// Delete pins
router.delete("/:pinId", deletePin);

export default router;
