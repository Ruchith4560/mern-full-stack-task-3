// server/src/app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const authRoutes    = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const errorHandler  = require('./middleware/errorHandler');

const app = express();

// ── Middleware ────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  credentials: true,   // allow cookies to be sent cross-origin
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// ── Health check ──────────────────────────────────────────────────
app.get('/', (req, res) =>
  res.json({ success: true, message: '🔐 Task 3 Auth API running!' })
);

// ── Routes ────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);

// ── 404 ───────────────────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` })
);

// ── Central error handler ─────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
