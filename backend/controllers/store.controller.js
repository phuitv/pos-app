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
        const { name, address, phone, businessType } = req.body;

        if (!name || !address || !phone || !businessType) {
            return res.status(400).json({ success: false, error: 'Vui lòng điền đầy đủ các thông tin bắt buộc.' });
        }

        // Bước 1: Cập nhật document
        await Store.findByIdAndUpdate(
            req.storeId, 
            { 
                name, 
                address, 
                phone, 
                businessType,
                isSetupCompleted: true // Cập nhật tất cả các trường
            }, 
            { runValidators: true }
        );

        // Bước 2: Tìm lại document đã được cập nhật để đảm bảo lấy dữ liệu mới nhất
        const updatedStore = await Store.findById(req.storeId);
        
        if (!updatedStore) {
             return res.status(404).json({ success: false, error: 'Không tìm thấy cửa hàng sau khi cập nhật.' });
        }
        
        // Bước 3: Trả về dữ liệu mới nhất
        res.status(200).json({ success: true, data: updatedStore });

    } catch (error) {
        console.error("Error in updateMyStore:", error); // Thêm log lỗi chi tiết
        res.status(400).json({ success: false, error: error.message });
    }
};