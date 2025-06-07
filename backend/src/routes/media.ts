// Profile routes
import { Router } from "express";

import { profileAvatar } from "../controllers/mediaController";

const router = Router();

// Update single profile
router.put("/avatar/:id", profileAvatar);

export default router;
