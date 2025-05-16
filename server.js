// For version tracking - you can update this
console.log("SERVER.JS - VERSION WITH_DETAILED_CORS_1");

require('dotenv').config(); // Loads variables from .env into process.env

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/authRoutes');
const creatorRoutes = require('./routes/creatorRoutes');
// If you have a custom error handler middleware, require it here
// const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5001; // Render will set process.env.PORT

// --- CORS Configuration ---
const allowedOrigins = [
    'https://00291emn.com',     // Your WordPress domain
    'http://localhost:3000',    // Example for local frontend development (optional)
    // Add any other domains you might need to allow, e.g., a staging domain
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin: ' + origin;
            console.error(msg + ' Attempted origin: ' + origin); // Log the blocked origin
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true, // Important for cookies, authorization headers with tokens
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow common methods
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'] // Allow necessary headers
}));

// Middleware to parse JSON bodies
app.use(express.json());

// --- Connect to MongoDB ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected successfully!'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err.message);
        // process.exit(1); // Optionally exit if DB connection fails
    });

// --- API Routes ---
// Basic Test Route
app.get('/api/test', (req, res) => {
    res.json({ message: 'EMN Creator Dashboard API is running!' });
});

// Authentication Routes
app.use('/api/auth', authRoutes);

// Creator Data Routes
app.use('/api/creator', creatorRoutes);


// --- Global Error Handler (Optional but recommended) ---
// app.use(errorHandler); // Make sure this is after all your routes

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("End of server.js execution script (listen has been called).");
});