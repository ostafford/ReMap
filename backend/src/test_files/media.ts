// Profile routes
import { Router } from "express";

import { profileAvatar } from "./mediaController";

import getUser from "../middleware/getUser";

const router = Router();

// Update single profile
router.put("/avatar/:id", getUser, profileAvatar);

export default router;
