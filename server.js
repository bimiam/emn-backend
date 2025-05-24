// server.js
console.log("SERVER.JS - V.NO_APP_ROUTES_MOUNTED_1_FULL (All app.use for routes commented)"); 
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- Require Route Files (these are still required to check for immediate syntax errors in them) ---
const authRoutes = require('./routes/authRoutes');     
const creatorRoutes = require('./routes/creatorRoutes'); 
const adminRoutes = require('./routes/adminRoutes');   

const app = express();
const PORT = process.env.PORT || 5001;

// --- CORS Configuration ---
const allowedOrigins = [
    'https://00291emn.com', 
    // 'http://localhost:8080', // Example for local admin UI if served via http-server
    // Add other origins as needed
];
const corsOptions = {
  origin: function (origin, callback) {
    // console.log("CORS Check - Received Origin:", origin, "Type:", typeof origin); // For debugging
    if (origin === undefined || origin === null || origin === 'null' || allowedOrigins.indexOf(origin) !== -1) {
      // console.log('CORS: Allowed origin:', origin || 'No Origin (e.g., file:///)'); // For debugging
      callback(null, true);
    } else {
      console.warn('CORS: Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200 
};
// --- BEGIN TEST: Direct OPTIONS Handler ---
app.options('*', (req, res, next) => {
  console.log('TEST: Direct app.options handler HIT. Path:', req.path, 'Origin:', req.get('Origin'));
  res.setHeader('Access-Control-Allow-Origin', 'https://00291emn.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204); 
});
// --- END TEST: Direct OPTIONS Handler ---
// --- Core Middleware (Order Matters!) ---
// 1. Main CORS policy for all requests
//app.use(cors(corsOptions)); 

// 2. Handle OPTIONS preflight requests AFTER main CORS but BEFORE body parsing and specific routes
//app.options('*', cors(corsOptions)); // Ensures OPTIONS requests get CORS headers

// 3. Middleware to parse JSON bodies
app.use(express.json());    
// --- End Core Middleware ---


// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Connected successfully!'))
.catch(err => {
  console.error('MongoDB Connection Error:', err.message);
  process.exit(1); 
});
// --- End MongoDB Connection ---


// --- Basic API Test Route (This will be the only active API route from server.js itself) ---
app.get('/api/test', (req, res) => {
  console.log("GET /api/test called");
  res.json({ message: 'EMN Creator Dashboard API is running! (No app-specific routes mounted)' });
});
// --- End Basic API Test Route ---


// --- Mount Application Routers ---
// THE FOLLOWING LINES ARE COMMENTED OUT FOR THIS TEST
// app.use('/api/auth', authRoutes);      
// app.use('/api/creator', creatorRoutes); 
// app.use('/api/admin', adminRoutes);       
// --- End Mount Routers ---


// --- Global Error Handler (Basic) ---
app.use((err, req, res, next) => {
  console.error("Global Error Handler Caught:", err.name, err.message); 
  // console.error(err.stack); // Uncomment for full stack trace during development
  res.status(500).send('Something broke on the server!');
});
// --- End Global Error Handler ---

app.listen(PORT, () => {
  console.log(`Node.js server running on port ${PORT}`);
  console.log(`Access API at http://localhost:${PORT}`);
});

console.log("End of server.js main script execution (before server truly starts listening for events).");