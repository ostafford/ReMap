import express, { Router } from "express";
import serverless from "serverless-http";

// Import routes
import auth from "../../src/routes/auth";
import profiles from "../../src/routes/profiles";
import pins from "../../src/routes/pins";
import circles from "../../src/routes/circles";

// Import middleware
import logger from "../../src/middleware/logger";

const api = express();
const router = Router();

/* --------------- Middleware ----------------- */
// Body parser
// Enable json
api.use(express.json());
// Enable x-www-formurlencoded
api.use(express.urlencoded({ extended: false }));
// Logger
api.use(logger);

/* --------------- Routes ----------------- */
// Sign up/in routes middleware
router.use("/auth", auth);

// Profile routes middleware
router.use("/profiles", profiles);

// Pins routes middleware
router.use("/pins", pins);

// Circles routes middleware
router.use("/circles", circles);

// Mount all routes under /api
api.use("/api", router);

export const handler = serverless(api); 