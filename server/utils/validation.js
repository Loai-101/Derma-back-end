const Joi = require('joi');

// Email validation schema
const emailSchema = Joi.object({
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org', 'edu', 'gov'] } })
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'string.empty': 'Email cannot be empty',
            'any.required': 'Email is required'
        })
});

// Password validation schema
const passwordSchema = Joi.object({
    password: Joi.string()
        .min(8)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
        .required()
        .messages({
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
            'string.min': 'Password must be at least 8 characters long',
            'string.empty': 'Password cannot be empty',
            'any.required': 'Password is required'
        })
});

// Validate email
const validateEmail = (email) => {
    const { error, value } = emailSchema.validate({ email });
    return { error, value };
};

// Validate password
const validatePassword = (password) => {
    const { error, value } = passwordSchema.validate({ password });
    return { error, value };
};

// Combined user validation schema
const userSchema = Joi.object({
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org', 'edu', 'gov'] } })
        .required(),
    password: Joi.string()
        .min(8)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
        .required(),
    name: Joi.string()
        .min(2)
        .max(50)
        .required(),
    role: Joi.string()
        .valid('user', 'admin', 'doctor')
        .default('user')
});

// Validate user data
const validateUser = (userData) => {
    const { error, value } = userSchema.validate(userData, { abortEarly: false });
    return { error, value };
};

module.exports = {
    validateEmail,
    validatePassword,
    validateUser,
    emailSchema,
    passwordSchema,
    userSchema
}; 