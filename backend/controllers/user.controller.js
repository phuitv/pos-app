const User = require('../models/user.model');

// @desc    Tạo người dùng mới (chỉ admin)
// @route   POST /api/users
exports.createUser = async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const user = await User.create({ username, password, role, store: req.storeId });
        res.status(201).json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Lấy danh sách tất cả người dùng (chỉ admin)
// @route   GET /api/users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({ store: req.storeId });
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

// @desc    Xóa người dùng (chỉ admin)
// @route   DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        // Admin không được xóa chính mình, và chỉ được xóa user trong cùng cửa hàng
        if (!userToDelete || userToDelete.store.toString() !== req.storeId.toString() || req.user.id === req.params.id) {
            return res.status(404).json({ success: false, error: `User not found or you can't delete yourself` });
        }
        await user.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};