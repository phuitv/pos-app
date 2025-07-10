const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Bảo vệ routes, kiểm tra user đã đăng nhập chưa
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }

    try {
        // Giải mã token để lấy payload (chứa id và store)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Gắn thông tin vào đối tượng req để các controller sau có thể dùng
        req.user = await User.findById(decoded.id);
        req.storeId = decoded.storeId; // Lấy storeId từ token và gắn vào req

        if (!req.user || !req.storeId) {
            return res.status(401).json({ success: false, error: 'User hoặc Store không tồn tại' });
        }

        next(); // Cho phép đi tiếp
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }
};

// Phân quyền theo vai trò
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, error: `User role ${req.user.role} is not authorized to access this route` });
        }
        next();
    };
};