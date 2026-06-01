// server/src/routes/productRoutes.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getAllProducts, getProductById, createProduct,
  updateProduct, patchProduct, deleteProduct,
} = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

// All product routes require a valid JWT ──────────────────────────
router.use(protect);

const productRules = [
  body('name').notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
  body('price').isFloat({ min: 0 }).withMessage('Price must be ≥ 0'),
  body('category').isIn(['electronics', 'clothing', 'food', 'books', 'other']).withMessage('Invalid category'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be ≥ 0'),
];

router.get('/',     getAllProducts);
router.get('/:id',  getProductById);
router.post('/',    productRules, validate, createProduct);
router.put('/:id',  productRules, validate, updateProduct);
router.patch('/:id', validate, patchProduct);

// Only admins can delete
router.delete('/:id', restrictTo('admin'), deleteProduct);

module.exports = router;
