// server/src/controllers/authController.js
const User = require('../models/User');
const { signToken, cookieOptions } = require('../config/jwt');

const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ── Helper: sign token + set httpOnly cookie + respond ────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Set token as httpOnly cookie — JS can't read this!
  res.cookie('token', token, cookieOptions());

  // Remove password from output (extra safety)
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,            // also send in body for API clients (Postman)
    data: { user },
  });
};

// ── POST /api/auth/signup ─────────────────────────────────────────
const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if email already registered
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email already in use' });
  }

  // Create user — password is hashed by pre-save hook in model
  const user = await User.create({ name, email, password });

  sendTokenResponse(user, 201, res);
});

// ── POST /api/auth/login ──────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user — include password for comparison (select: false in schema)
  const user = await User.findOne({ email }).select('+password');

  // Use the same error for both "not found" and "wrong password"
  // This prevents "user enumeration" attacks
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }

  sendTokenResponse(user, 200, res);
});

// ── POST /api/auth/logout ─────────────────────────────────────────
const logout = asyncHandler(async (req, res) => {
  // Clear the cookie by setting maxAge to 0
  res.cookie('token', '', { ...cookieOptions(), maxAge: 0 });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// ── GET /api/auth/me — protected, returns current user ────────────
const getMe = asyncHandler(async (req, res) => {
  // req.user is set by protect middleware
  res.status(200).json({ success: true, data: { user: req.user } });
});

module.exports = { signup, login, logout, getMe };
