// server/src/middleware/authMiddleware.js
const { verifyToken } = require('../config/jwt');
const User = require('../models/User');

/**
 * protect
 * Checks for a valid JWT in:
 *   1. httpOnly cookie  (recommended — browser sends automatically)
 *   2. Authorization: Bearer <token>  (for Postman / API clients)
 *
 * Attaches req.user if valid, otherwise returns 401.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Cookie (preferred)
    if (req.cookies?.token) {
      token = req.cookies.token;
    }
    // 2. Bearer header fallback (Postman, mobile apps)
    else if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated — please log in',
      });
    }

    // Decode & verify
    const decoded = verifyToken(token);

    // Fetch fresh user from DB (catches deleted/banned accounts)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists',
      });
    }

    req.user = user; // available to all downstream handlers
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired — please log in again' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

/**
 * restrictTo(...roles)
 * Role-based access control — use AFTER protect.
 * Example: router.delete('/:id', protect, restrictTo('admin'), deleteProduct)
 */
const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied — requires role: ${roles.join(' or ')}`,
    });
  }
  next();
};

module.exports = { protect, restrictTo };
