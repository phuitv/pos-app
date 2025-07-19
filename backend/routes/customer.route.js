const express = require('express');
const router = express.Router();
const { getCustomers, createCustomer, updateCustomer } = require('../controllers/customer.controller');
const { protect } = require('../middleware/auth.middleware');

// Tất cả các route khách hàng đều cần đăng nhập
router.use(protect);

router.route('/')
    .get(getCustomers)
    .post(createCustomer);

router.route('/:id')
    .put(updateCustomer);

module.exports = router;