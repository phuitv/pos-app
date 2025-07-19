const Customer = require('../models/customer.model');

// @desc    Lấy danh sách khách hàng của cửa hàng
// @route   GET /api/customers
exports.getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find({ store: req.storeId });
        res.status(200).json({ success: true, data: customers });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Tạo khách hàng mới
// @route   POST /api/customers
exports.createCustomer = async (req, res) => {
    try {
        const customer = await Customer.create({
            ...req.body,
            store: req.storeId // Tự động gán vào cửa hàng hiện tại
        });
        res.status(201).json({ success: true, data: customer });
    } catch (error) {
        // Xử lý lỗi trùng số điện thoại
        if (error.code === 11000) {
            return res.status(400).json({ success: false, error: 'Số điện thoại này đã tồn tại trong hệ thống.' });
        }
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Cập nhật thông tin khách hàng
// @route   PUT /api/customers/:id
exports.updateCustomer = async (req, res) => {
    try {
        let customer = await Customer.findById(req.params.id);

        // Kiểm tra khách hàng có thuộc đúng cửa hàng không
        if (!customer || customer.store.toString() !== req.storeId.toString()) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy khách hàng.' });
        }

        customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: customer });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};