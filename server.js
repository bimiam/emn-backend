 // server.js
console.log("SERVER.JS - VERSION WITH_CREATOR_ROUTES_1"); // For version tracking

require('dotenv').config(); // Loads variables from .env into process.env

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected successfully!'))
  .catch(err => {
      console.error('MongoDB Connection Error:', err.message);
  });

// Basic Test Route
app.get('/api/test', (req, res) => {
  res.json({ message: 'EMN Creator Dashboard API is running!' });
});

// --- Mount Routers ---
// Authentication Routes
app.use('/api/auth', require('./routes/authRoutes')); 

// Creator Data Routes  <-- THIS IS THE NEWLY ADDED LINE FOR CREATOR ROUTES
app.use('/api/creator', require('./routes/creatorRoutes')); 

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

console.log("End of server.js execution script (listen has been called).");