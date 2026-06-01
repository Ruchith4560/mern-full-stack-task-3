// server/src/config/jwt.js
const jwt = require('jsonwebtoken');

/**
 * Sign a JWT with the user's id as payload.
 * @param {string} userId  — MongoDB ObjectId string
 * @returns {string}       — signed JWT
 */
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

/**
 * Verify a JWT and return the decoded payload.
 * Throws if invalid or expired.
 */
const verifyToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET);

/**
 * Build the httpOnly cookie options.
 * httpOnly = JS cannot read it  → protects against XSS
 * secure   = HTTPS only in prod → protects against MITM
 * sameSite = 'strict'           → protects against CSRF
 */
const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
});

module.exports = { signToken, verifyToken, cookieOptions };
