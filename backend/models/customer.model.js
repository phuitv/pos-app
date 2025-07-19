const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên khách hàng'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Vui lòng nhập số điện thoại'],
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    store: { // Mỗi khách hàng thuộc về một cửa hàng
        type: mongoose.Schema.ObjectId,
        ref: 'Store',
        required: true
    }
}, {
    timestamps: true
});

// Đảm bảo số điện thoại là duy nhất trong phạm vi một cửa hàng
CustomerSchema.index({ phone: 1, store: 1 }, { unique: true });

module.exports = mongoose.model('Customer', CustomerSchema);