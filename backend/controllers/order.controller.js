const Order = require('../models/order.model');
const Product = require('../models/product.model');

// @desc    Tạo một đơn hàng mới
// @route   POST /api/orders
exports.createOrder = async (req, res, next) => {
    const { orderItems, totalAmount } = req.body;

    if (!orderItems || orderItems.length === 0) {
        return res.status(400).json({ success: false, error: "Giỏ hàng rỗng" });
    }

    try {
        // Bước 1: Tạo đơn hàng
        const order = await Order.create({
            orderItems,
            totalAmount
        });

        // Bước 2: Cập nhật số lượng tồn kho cho từng sản phẩm
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(item.product, {
                // $inc là một toán tử của MongoDB để tăng/giảm một giá trị số
                // Trừ đi số lượng đã bán
                $inc: { quantity: -item.quantity } 
            });
        }

        res.status(201).json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

// @desc    Lấy tất cả đơn hàng
// @route   GET /api/orders
exports.getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }); // Sắp xếp đơn mới nhất lên đầu
        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server Error" });
    }
};