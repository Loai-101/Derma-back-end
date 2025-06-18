const { validateEmail, validateUser } = require('../utils/validation');
const { validationResult } = require('express-validator');
const { AppError } = require('./errorMiddleware');

// Middleware to validate email
const validateEmailMiddleware = (req, res, next) => {
    const { error } = validateEmail(req.body.email);
    if (error) {
        return res.status(400).json({
            status: 'error',
            message: error.details[0].message
        });
    }
    next();
};

// Middleware to validate user data
const validateUserMiddleware = (req, res, next) => {
    const { error } = validateUser(req.body);
    if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        return res.status(400).json({
            status: 'error',
            messages: errorMessages
        });
    }
    next();
};

// Validate request
exports.validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg);
        return next(new AppError(errorMessages.join('. '), 400));
    }
    next();
};

// Sanitize request data
exports.sanitizeRequest = (req, res, next) => {
    // Sanitize body
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].trim();
            }
        });
    }

    // Sanitize query parameters
    if (req.query) {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = req.query[key].trim();
            }
        });
    }

    next();
};

// Validate MongoDB ObjectId
exports.validateObjectId = (req, res, next) => {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError('Invalid ID format', 400));
    }
    next();
};

// Validate pagination parameters
exports.validatePagination = (req, res, next) => {
    const { page = 1, limit = 10 } = req.query;
    
    // Convert to numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Validate
    if (isNaN(pageNum) || pageNum < 1) {
        return next(new AppError('Invalid page number', 400));
    }
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return next(new AppError('Invalid limit number', 400));
    }

    // Add to request
    req.pagination = {
        page: pageNum,
        limit: limitNum,
        skip: (pageNum - 1) * limitNum
    };

    next();
};

// Validate file upload
exports.validateFileUpload = (req, res, next) => {
    if (!req.file && !req.files) {
        return next(new AppError('No file uploaded', 400));
    }
    next();
};

// Validate date range
exports.validateDateRange = (req, res, next) => {
    const { startDate, endDate } = req.query;
    
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return next(new AppError('Invalid date format', 400));
        }

        if (start > end) {
            return next(new AppError('Start date must be before end date', 400));
        }

        req.dateRange = { start, end };
    }

    next();
};

module.exports = {
    validateEmailMiddleware,
    validateUserMiddleware,
    validateRequest,
    sanitizeRequest,
    validateObjectId,
    validatePagination,
    validateFileUpload,
    validateDateRange
}; 