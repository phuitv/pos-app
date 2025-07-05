const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');

const {
    createProduct,
    getProducts,
    deleteProduct,
    updateProduct
} = require('../controllers/product.controller');

// Các route CRUD sản phẩm chỉ dành cho admin
router.route('/')
    .get(protect, getProducts)
    .post(protect, authorize('admin'), createProduct);

router.route('/:id')
    .put(protect, authorize('admin'), updateProduct)
    .delete(protect, authorize('admin'), deleteProduct);

module.exports = router;