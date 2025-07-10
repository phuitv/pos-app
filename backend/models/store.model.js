const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên cửa hàng'],
        unique: true,
        trim: true,
        maxlength: [100, 'Tên cửa hàng không được vượt quá 100 ký tự']
    },
    address: {
        type: String,
        default: 'Chưa cập nhật'
    },
    phone: {
        type: String,
        default: 'Chưa cập nhật'
    },
    // Thêm các thông tin khác bạn muốn cửa hàng có ở đây
}, {
    timestamps: true
});

module.exports = mongoose.model('Store', StoreSchema);