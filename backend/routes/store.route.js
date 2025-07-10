const express = require('express');
const router = express.Router();
const { getMyStore, updateMyStore } = require('../controllers/store.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Chỉ admin mới có quyền truy cập các route này
router.use(protect, authorize('admin'));

router.route('/my')
    .get(getMyStore)
    .put(updateMyStore);

module.exports = router;