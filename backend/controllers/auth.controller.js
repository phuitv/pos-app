const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

// Hàm để ký và trả về token
const getSignedJwtToken = (user) => {
    return jwt.sign(
        { id: user._id, storeId: user.store }, // Thêm storeId vào payload
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// @desc    Đăng ký người dùng mới
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
    const { username, password, role } = req.body;
    try {
        const user = await User.create({ username, password, role });
        const token = getSignedJwtToken(user._id);
        res.status(200).json({ success: true, token });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Đăng nhập
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, error: "Please provide username and password" });
    }
    try {
        const user = await User.findOne({ username }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, error: "Invalid credentials" });
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: "Invalid credentials" });
        }
        const token = getSignedJwtToken(user);
        res.status(200).json({ success: true, token });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Lấy thông tin user hiện tại
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    // Sử dụng .populate('store') để lấy thông tin chi tiết của cửa hàng
    const user = await User.findById(req.user.id).populate('store');

    res.status(200).json({
        success: true,
        data: user
    });
};