const express = require('express');
const router = express.Router();
const { createOrder, getOrders } = require('../controllers/order.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Nhân viên và admin đều có thể tạo và xem đơn hàng
router.route('/')
    .post(protect, authorize('admin', 'staff'), createOrder)
    .get(protect, authorize('admin', 'staff'), getOrders);

module.exports = router;