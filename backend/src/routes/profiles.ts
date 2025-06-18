// Profile routes
import { Router } from "express";

import { getProfile, listProfiles, updateProfile } from "../controllers/profileController";

import checkUser from "../middleware/userAuth";

const router = Router();


// Get all profiles
router.get("/", listProfiles);

// Get single profile
router.get("/:id", getProfile);

// Update single profile
router.put("/:id", checkUser, updateProfile);

export default router;
