// Profile routes
import { Router } from "express";

import { getProfile, listProfiles, updateProfile } from "../controllers/profileController";

const router = Router();

// Get all profiles
router.get("/", listProfiles);

// Get single profile
router.get("/:id", getProfile);

// Update single profile
router.put("/:id", updateProfile);

export default router;
