// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.user.id).select('-password');
            if (!req.user) {
                return res.status(401).json({ msg: 'Not authorized, user not found for token' });
            }
            next();
        } catch (error) {
            console.error('Token verification error:', error.message);
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ msg: 'Not authorized, token malformed or invalid' });
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ msg: 'Not authorized, token expired' });
            }
            return res.status(401).json({ msg: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        res.status(401).json({ msg: 'Not authorized, no token provided' });
    }
};
module.exports = { protect };