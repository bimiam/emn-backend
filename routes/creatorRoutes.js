// routes/creatorRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // To protect the route
const User = require('../models/User'); // To fetch user data

// @route   GET /api/creator/me/performance
// @desc    Get performance data for the logged-in creator
// @access  Private
router.get('/me/performance', protect, async (req, res) => {
    try {
        const userPerformance = await User.findById(req.user.id).select(
            'contentCreated estimatedEarnings mistakes contestPoints monthlyContentTrend displayName username'
        );

        if (!userPerformance) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // --- MODIFICATION FOR CHART DATA ---
        // If monthlyContentTrend is empty or not structured correctly, provide sample data
        let trendDataToRespondWith = userPerformance.monthlyContentTrend;
        if (!trendDataToRespondWith || 
            typeof trendDataToRespondWith !== 'object' || 
            !trendDataToRespondWith.labels || 
            !trendDataToRespondWith.data ||
            !Array.isArray(trendDataToRespondWith.labels) ||
            !Array.isArray(trendDataToRespondWith.data) ) {
            
            console.log("Original monthlyContentTrend from DB was empty or malformed. Using placeholder chart data.");
            trendDataToRespondWith = { 
                labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"], 
                data: [10, 15, 8, 12, 18] 
            };
        }
        // --- END OF MODIFICATION ---

        res.json({
            username: userPerformance.username,
            displayName: userPerformance.displayName,
            contentCreated: userPerformance.contentCreated,
            estimatedEarnings: userPerformance.estimatedEarnings,
            mistakesMade: userPerformance.mistakes, // Assuming 'mistakes' in DB maps to 'mistakesMade'
            contestPoints: userPerformance.contestPoints,
            monthlyContentTrend: trendDataToRespondWith // Use the potentially modified trend data
        });

    } catch (error) {
        console.error('Error fetching creator performance:', error.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   PUT /api/creator/me/performance
// @desc    Update performance data for the logged-in creator
// @access  Private
router.put('/me/performance', protect, async (req, res) => {
    const { 
        contentCreated, 
        estimatedEarnings, 
        mistakes, 
        contestPoints, 
        monthlyContentTrend 
    } = req.body;

    console.log('--- UPDATE PERFORMANCE ---');
    console.log('Received req.body:', req.body);
    console.log('User ID from token:', req.user.id);

    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        console.log('User BEFORE update:', { 
            contentCreated: user.contentCreated,
            estimatedEarnings: user.estimatedEarnings,
            mistakes: user.mistakes
        });

        if (contentCreated !== undefined) {
            console.log(`Updating contentCreated from ${user.contentCreated} to ${contentCreated}`);
            user.contentCreated = contentCreated;
        }
        if (estimatedEarnings !== undefined) {
            console.log(`Updating estimatedEarnings from ${user.estimatedEarnings} to ${estimatedEarnings}`);
            user.estimatedEarnings = estimatedEarnings;
        }
        if (mistakes !== undefined) {
            console.log(`Updating mistakes from ${user.mistakes} to ${mistakes}`);
            user.mistakes = mistakes;
        }
        if (contestPoints !== undefined) {
            console.log(`Updating contestPoints from ${user.contestPoints} to ${contestPoints}`);
            user.contestPoints = contestPoints;
        }
        // For PUT, we expect the frontend to send a correctly structured monthlyContentTrend if it's being updated
        if (monthlyContentTrend !== undefined) { 
            console.log('Updating monthlyContentTrend');
            user.monthlyContentTrend = monthlyContentTrend; 
        }
        
        console.log('User object AFTER assignments, BEFORE save:', { 
            contentCreated: user.contentCreated,
            estimatedEarnings: user.estimatedEarnings,
            mistakes: user.mistakes
        });

        const updatedUser = await user.save();

        console.log('User AFTER save (from updatedUser object):', { 
            contentCreated: updatedUser.contentCreated,
            estimatedEarnings: updatedUser.estimatedEarnings,
            mistakes: updatedUser.mistakes
        });

        res.json({
            username: updatedUser.username,
            displayName: updatedUser.displayName,
            contentCreated: updatedUser.contentCreated,
            estimatedEarnings: updatedUser.estimatedEarnings,
            mistakesMade: updatedUser.mistakes,
            contestPoints: updatedUser.contestPoints,
            monthlyContentTrend: updatedUser.monthlyContentTrend // Send back the (potentially updated) trend data
        });

    } catch (error) {
        console.error('Error updating creator performance:', error.message, error.stack);
        res.status(500).json({ msg: 'Server Error during performance update' });
    }
});

module.exports = router;