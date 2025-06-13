// Starter Pack routes
import { Router } from "express";

import { listStarterPacks } from "../controllers/starterPacks";

const router = Router();


// Create starter pack
router.post("/");

// List starter packs
router.get("/", listStarterPacks);

// Get single starter pack
router.get("/:id");

export default router;
