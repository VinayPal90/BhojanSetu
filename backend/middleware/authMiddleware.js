// backend/middleware/authMiddleware.js

import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // User model import

// JWT ko verify karne aur user ko identify karne ke liye middleware
export const protect = async (req, res, next) => {
    let token;

    // 1. Header se token check karein
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 'Bearer' word ke baad token extract karein
            token = req.headers.authorization.split(' ')[1];

            // 2. Token ko verify karein
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // 3. User ko ID se fetch karein (password exclude karte hue)
            req.user = await User.findById(decoded.id).select('-password');
            
            // Agar user mil gaya, to aage next route par jaao
            if (req.user) {
                next();
            } else {
                return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
            }

        } catch (error) {
            console.error('Token verification error:', error);
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    // Agar token nahi mila
    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

// Role-based access control (Optional, par accha hai)
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `User role (${req.user.role}) is not authorized to access this route` 
            });
        }
        next();
    };
};