const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Not authorized to access this route'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'User not found'
                });
            }

            // Check if user is active
            if (!user.isActive) {
                return res.status(401).json({
                    status: 'error',
                    message: 'User account is deactivated'
                });
            }

            // Add user to request object
            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({
                status: 'error',
                message: 'Not authorized to access this route'
            });
        }
    } catch (error) {
        next(error);
    }
};

// Restrict to specific roles
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'You do not have permission to perform this action'
            });
        }
        next();
    };
};

// Check if user is verified
exports.isVerified = (req, res, next) => {
    if (!req.user.isEmailVerified) {
        return res.status(403).json({
            status: 'error',
            message: 'Please verify your email address'
        });
    }
    next();
};

// Check if user is the owner of the resource
exports.isOwner = (model) => async (req, res, next) => {
    try {
        const doc = await model.findById(req.params.id);
        if (!doc) {
            return res.status(404).json({
                status: 'error',
                message: 'Document not found'
            });
        }

        if (doc.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'You do not have permission to perform this action'
            });
        }

        next();
    } catch (error) {
        next(error);
    }
}; 