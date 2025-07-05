const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    // Mảng chứa các sản phẩm trong đơn hàng
    orderItems: [
        {
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            // Lưu lại ID của sản phẩm gốc để tham chiếu nếu cần
            product: { 
                type: mongoose.Schema.ObjectId,
                ref: 'Product',
                required: true
            }
        }
    ],
    // Tổng giá trị đơn hàng
    totalAmount: {
        type: Number,
        required: true,
        default: 0.0
    },
    // Các thông tin khác có thể thêm sau: customer, paymentMethod...
}, {
    timestamps: true // Tự động thêm createdAt, updatedAt
});

module.exports = mongoose.model('Order', OrderSchema);