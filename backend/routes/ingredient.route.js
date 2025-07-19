const express = require('express');
const router = express.Router();
const { 
    getIngredients, 
    createIngredient, 
    updateIngredient, 
    deleteIngredient 
} = require('../controllers/ingredient.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Chỉ admin mới có quyền quản lý nguyên vật liệu
router.use(protect, authorize('admin'));

router.route('/')
    .get(getIngredients)
    .post(createIngredient);

router.route('/:id')
    .put(updateIngredient)
    .delete(deleteIngredient);

module.exports = router;