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
    businessType: {
        type: String,
        enum: ['food_and_beverage', 'retail', 'service'],
        // Không required ở đây, sẽ bắt buộc ở logic sau
    },
    isSetupCompleted: {
        type: Boolean,
        default: false // Mặc định là chưa hoàn tất
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Store', StoreSchema);