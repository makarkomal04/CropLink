const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            message: 'Validation failed', 
            errors: errors.array() 
        });
    }
    next();
};

// Registration validation
const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email')
        .trim()
        .isEmail().withMessage('Valid email is required')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role')
        .optional()
        .isIn(['farmer', 'customer', 'admin']).withMessage('Invalid role'),
    body('farmLocation')
        .if(body('role').equals('farmer'))
        .notEmpty().withMessage('Farm location is required for farmers'),
    validate
];

// Login validation
const loginValidation = [
    body('email')
        .trim()
        .isEmail().withMessage('Valid email is required')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required'),
    validate
];

// Product validation
const productValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Product name is required')
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('category')
        .notEmpty().withMessage('Category is required')
        .isIn(['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Others']).withMessage('Invalid category'),
    body('type')
        .notEmpty().withMessage('Type is required')
        .isIn(['Organic', 'Pesticide-Free', 'Conventional']).withMessage('Invalid type'),
    body('quantity')
        .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('pricePerKg')
        .isFloat({ min: 1 }).withMessage('Price must be at least 1'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
    validate
];

module.exports = {
    registerValidation,
    loginValidation,
    productValidation,
};
