// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware'); // Middleware import

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    const { username, password, displayName, wpUserId } = req.body;
    try {
        let user = await User.findOne({ username });
        if (user) return res.status(400).json({ msg: 'User already exists' });
        user = new User({ username, password, displayName: displayName || username, wpUserId });
        await user.save();
        const payload = { user: { id: user.id } };
        console.log('JWT_SECRET value in /register route:', process.env.JWT_SECRET);
        if (!process.env.JWT_SECRET) return res.status(500).json({ msg: 'Server configuration error: JWT_SECRET missing.' });
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) { console.error('JWT Sign Error (in /register):', err.message); return res.status(500).json({ msg: 'Token generation failed due to JWT error' }); }
            res.json({ token });
        });
    } catch (err) { console.error('Error in /register route:', err.message, err.stack); res.status(500).send('Server error'); }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        let user = await User.findOne({ username });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials (user not found)' });
        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials (password incorrect)' });
        const payload = { user: { id: user.id } };
        console.log('JWT_SECRET value in /login route:', process.env.JWT_SECRET);
        if (!process.env.JWT_SECRET) return res.status(500).json({ msg: 'Server configuration error: JWT_SECRET missing.' });
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) { console.error('JWT Sign Error (in /login):', err.message); return res.status(500).json({ msg: 'Token generation failed due to JWT error' }); }
            res.json({ token });
        });
    } catch (err) { console.error('Error in /login route:', err.message, err.stack); res.status(500).send('Server error'); }
});

// @route   GET /api/auth/me
// @desc    Get current logged-in user's data (protected)
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        res.json({ _id: req.user._id, username: req.user.username, displayName: req.user.displayName, createdAt: req.user.createdAt });
    } catch (error) { console.error("Error in /me route after protect middleware:", error.message); res.status(500).json({ msg: "Server Error fetching user data" }); }
});

// @route   GET /api/auth/protected-test  <-- NEW ROUTE ADDED HERE
// @desc    A simple test for protected route access
// @access  Private
router.get('/protected-test', protect, (req, res) => {
    // If 'protect' middleware allows access, req.user will be available
    res.json({ 
        msg: `Hello ${req.user.displayName || req.user.username}! You have accessed a protected route.`,
        userId: req.user._id 
    });
});

module.exports = router;