const Ingredient = require('../models/ingredient.model');

// @desc    Lấy tất cả nguyên vật liệu của cửa hàng
// @route   GET /api/ingredients
exports.getIngredients = async (req, res) => {
    try {
        const ingredients = await Ingredient.find({ store: req.storeId });
        res.status(200).json({ success: true, data: ingredients });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Tạo nguyên vật liệu mới
// @route   POST /api/ingredients
exports.createIngredient = async (req, res) => {
    try {
        const ingredient = await Ingredient.create({
            ...req.body,
            store: req.storeId
        });
        res.status(201).json({ success: true, data: ingredient });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Cập nhật nguyên vật liệu (VD: nhập hàng)
// @route   PUT /api/ingredients/:id
exports.updateIngredient = async (req, res) => {
    try {
        let ingredient = await Ingredient.findById(req.params.id);
        if (!ingredient || ingredient.store.toString() !== req.storeId.toString()) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy nguyên vật liệu' });
        }
        ingredient = await Ingredient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: ingredient });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Xóa nguyên vật liệu
// @route   DELETE /api/ingredients/:id
exports.deleteIngredient = async (req, res) => {
    try {
        const ingredient = await Ingredient.findById(req.params.id);
        if (!ingredient || ingredient.store.toString() !== req.storeId.toString()) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy nguyên vật liệu' });
        }
        await ingredient.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(400).json({ success: false, error: 'Server Error' });
    }
};