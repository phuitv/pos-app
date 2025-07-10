const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'], // Tên sản phẩm là bắt buộc
        trim: true // Tự động loại bỏ khoảng trắng thừa
    },
    sku: {
        type: String,
        required: [true, 'Please add a SKU'],
        unique: true // Mã SKU phải là duy nhất, không được trùng
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    quantity: {
        type: Number,
        required: [true, 'Please add a quantity'],
        default: 0 // Giá trị mặc định nếu không cung cấp
    },
    store: {
        type: mongoose.Schema.ObjectId,
        ref: 'Store',
        required: true
    }
}, {
    timestamps: true // Tự động thêm 2 trường: createdAt (thời gian tạo) và updatedAt (cập nhật lần cuối)
});

module.exports = mongoose.model('Product', ProductSchema);