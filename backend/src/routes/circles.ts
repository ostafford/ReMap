// Circles routes
import { Router } from "express";

import { addMember, createCircle, deleteCircle, deleteMember, getCircle, listCircles, listMembers, updateCircle } from '../controllers/circlesController';

import checkUser from "../middleware/userAuth";

const router = Router();

// Check user signed in
router.use(checkUser);


/* -------------- Circle Table ---------------- */
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


/* -------------- Member Table ---------------- */
// Add member to circle
router.post("/members", addMember);

// List members in circle
router.get("/members/:circleId", listMembers);

// Delete members in circle
router.delete("/members/:circleId", deleteMember);

export default router;
