// Authorisation routes
import { Router } from "express";

import { deleteUser, getUser, listUsers, logOut, signIn, signUp, updateEmail, updatePassword } from "../controllers/authController";

import checkUser from "../middleware/checkUser";

const router = Router();


// List all users
router.get("/users", listUsers);

// Retrieve a user
router.get("/users/:id", getUser);

// Sign up
router.post("/signUp", signUp);

// Sign in
router.post("/signIn", signIn);

// Log out
router.post("/signOut", checkUser, logOut);

// Update email
router.put("/email", checkUser, updateEmail);

// Update password
router.put("/password", checkUser, updatePassword);

// Delete account
router.delete("/users/:id", deleteUser);

export default router;
