// server/src/routes/authRoutes.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { signup, login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

// Validation rules
const signupRules = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// Public routes
router.post('/signup', signupRules, validate, signup);
router.post('/login',  loginRules,  validate, login);
router.post('/logout', logout);

// Protected route — requires valid JWT
router.get('/me', protect, getMe);

module.exports = router;
