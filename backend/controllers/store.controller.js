const Store = require('../models/store.model');

// @desc    Lấy thông tin cửa hàng của người dùng đang đăng nhập
// @route   GET /api/stores/my
// @access  Private (Admin)
exports.getMyStore = async (req, res, next) => {
    try {
        // req.storeId được lấy từ middleware 'protect'
        const store = await Store.findById(req.storeId);
        if (!store) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy cửa hàng' });
        }
        res.status(200).json({ success: true, data: store });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Cập nhật thông tin cửa hàng
// @route   PUT /api/stores/my
// @access  Private (Admin)
exports.updateMyStore = async (req, res, next) => {
    try {
        const store = await Store.findByIdAndUpdate(req.storeId, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({ success: true, data: store });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};