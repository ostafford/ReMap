// Entry point
// import dotenv from "dotenv";
// dotenv.config();

import express from "express";
// routes
import auth from "./routes/auth";
import profiles from "./routes/profiles";
import pins from "./routes/pins";
import circles from "./routes/circles";
import starterPacks from "./routes/starterPack";

// middleware
import logger from "./middleware/logger";

// Active port
const port = Number(process.env.BackPORT) || 3000;

const app = express();

/* --------------- Middleware ----------------- */
// Body parser
// Enable json
app.use(express.json());
// Enable x-www-formurlencoded
app.use(express.urlencoded({ extended: false }));
// Logger
app.use(logger);


/* --------------- Routes ----------------- */
// Sign up/in routes middleware
app.use("/api/auth", auth);

// Profile routes middleware
app.use("/api/profiles", profiles);

// Pins routes middleware
app.use("/api/pins", pins);

// Circles routes middleware
app.use("/api/circles", circles);

// Starter pack routes middleware
app.use("/api/packs", starterPacks);


app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
