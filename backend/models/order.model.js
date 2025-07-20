const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

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

    orderCode: {
        type: String,
        unique: true,
        // Tự động tạo mã 8 ký tự khi một đơn hàng mới được tạo
        default: () => `HD-${nanoid(8).toUpperCase()}` 
    },

    // Tổng giá trị đơn hàng
    totalAmount: {
        type: Number,
        required: true,
        default: 0.0
    },
    
    store: {
        type: mongoose.Schema.ObjectId,
        ref: 'Store',
        required: true
    },

    // thêm trường 'user' để biết nhân viên nào đã tạo đơn hàng
    user: { 
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },

    // Trạng thái thanh toán
    paymentStatus: {
        type: String,
        enum: ['paid', 'debt'], // Chỉ cho phép một trong hai giá trị này
        default: 'paid'        // Giá trị mặc định là 'paid' - Đã thanh toán
    },

    customer: {
        type: mongoose.Schema.ObjectId,
        ref: 'Customer',
        required: false // Không bắt buộc, vì có thể là khách lẻ
    }
}, {
    timestamps: true // Tự động thêm createdAt, updatedAt
});

module.exports = mongoose.model('Order', OrderSchema);