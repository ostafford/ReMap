// Entry point
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
// routes
import profiles from './routers/profiles.js';
import auth from './routers/sign_up_in.js';

const port = process.env.BackPORT || 3000;

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Profile routes middleware
app.use('/api/profiles', profiles);

// Sign up/in routes middleware
app.use('/api/auth', auth);

app.listen(port, () => {
    console.log(`Port active: ${port}`);
});
