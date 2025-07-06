const express = require('express');
const router = express.Router();
const { createUser, getUsers, deleteUser } = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Áp dụng middleware bảo vệ và phân quyền cho TẤT CẢ các route bên dưới
router.use(protect);
router.use(authorize('admin'));

router.route('/')
    .get(getUsers)
    .post(createUser);

router.route('/:id')
    .delete(deleteUser);

module.exports = router;