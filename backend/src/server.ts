// Entry point
// import dotenv from "dotenv";
// dotenv.config();

import express from "express";
// routes
import auth from "./routes/auth";
import profiles from "./routes/profiles";
import pins from "./routes/pins";
import groups from "./routes/groups";
import media from "./routes/media";

// middleware
import logger from "./middleware/logger";
import getUser from "./middleware/getUser";

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
// Check user login session
app.use(getUser);

/* --------------- Routes ----------------- */
// Sign up/in routes middleware
app.use("/api/auths", auth);

// Profile routes middleware
app.use("/api/profiles", profiles);

// Pins routes middleware
app.use("/api/pins", pins);

// Groups routes middleware
app.use("/api/groups", groups);

app.use("/api/media", media);

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
