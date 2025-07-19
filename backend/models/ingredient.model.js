const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    unit: { // Đơn vị tính: kg, gram, lit, ml, cai, hop...
        type: String,
        required: true,
        trim: true
    },
    stock: { // Số lượng tồn kho theo đơn vị tính
        type: Number,
        required: true,
        default: 0
    },
    costPerUnit: { // Giá nhập trên mỗi đơn vị
        type: Number,
        required: true,
        default: 0
    },
    store: {
        type: mongoose.Schema.ObjectId,
        ref: 'Store',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Ingredient', IngredientSchema);