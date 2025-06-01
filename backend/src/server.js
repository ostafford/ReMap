// Entry point
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
// routes
import profiles from './routers/profiles.js';
import auth from './routers/sign_up_in.js';
import pins from './routers/pins.js';
import groups from './routers/groups.js';

const port = process.env.BackPORT || 3000;

const app = express();

// Body parser middleware
// Enable json
app.use(express.json());
// Enable x-www-formurlencoded
app.use(express.urlencoded({ extended: false }));

// Sign up/in routes middleware
app.use('/api/auth', auth);

// Profile routes middleware
app.use('/api/profiles', profiles);

// Pins routes middleware
app.use('/api/pins', pins);

// Groups routes middleware
app.use('/api/groups', groups);


app.listen(port, () => {
    console.log(`Port active: ${port}`);
});
