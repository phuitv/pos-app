const Order = require('../models/order.model');
const Product = require('../models/product.model');
const Ingredient = require('../models/ingredient.model'); // Import Ingredient model
const mongoose = require('mongoose');

// @desc    Tạo một đơn hàng mới
// @route   POST /api/orders
exports.createOrder = async (req, res, next) => {
    const { orderItems, totalAmount, paymentStatus, customerId } = req.body;

    if (!orderItems || orderItems.length === 0) {
        return res.status(400).json({ success: false, error: "Giỏ hàng rỗng" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Bước 1: Tạo đơn hàng
        const order = await Order.create({
            orderItems,
            totalAmount,
            paymentStatus,
            customer: customerId,
            store: req.storeId,    // Gán storeId của user
            user: req.user.id      // Gán userId của user
        });
        await order.save({ session });

        // Bước 2: Cập nhật số lượng tồn kho cho từng sản phẩm
        for (const item of orderItems) {
            // Lấy thông tin đầy đủ của sản phẩm từ DB
            const product = await Product.findById(item.product).session(session);

            if (!product) {
                // Nếu sản phẩm không tồn tại, hủy giao dịch
                throw new Error(`Sản phẩm với ID ${item.product} không tồn tại.`);
            }

            // Kịch bản 1: Sản phẩm bán lẻ (quản lý tồn kho trực tiếp)
            if (product.trackQuantity) {
                await Product.findByIdAndUpdate(item.product, 
                    { $inc: { quantity: -item.quantity } },
                    { session }
                );
            } 
            // Kịch bản 2: Sản phẩm dịch vụ (có công thức)
            else if (product.recipe && product.recipe.length > 0) {
                for (const recipeItem of product.recipe) {
                    if (!recipeItem || !recipeItem.ingredient) {
                        console.error("Công thức bị lỗi cho sản phẩm:", product.name);
                        continue; // Bỏ qua mục này và tiếp tục
                    }
                    const amountToDeduct = recipeItem.amount * item.quantity;
                    await Ingredient.findByIdAndUpdate(recipeItem.ingredient,
                        { $inc: { stock: -amountToDeduct } },
                        { session }
                    );
                }
            }
        }

        // Nếu mọi thứ ổn, commit transaction
        await session.commitTransaction();

        res.status(201).json({
            success: true,
            data: order
        });

    } catch (error) {
        // Nếu có bất kỳ lỗi nào, hủy bỏ tất cả các thay đổi
        await session.abortTransaction();
        console.error('Lỗi khi tạo đơn hàng:', error);
        res.status(500).json({ success: false, error: "Lỗi server khi tạo đơn hàng. " + error.message });
    } finally {
        // Luôn kết thúc session
        session.endSession();
    }
};

// @desc    Lấy tất cả đơn hàng
// @route   GET /api/orders
exports.getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ store: req.storeId }).sort({ createdAt: -1 }); // Sắp xếp đơn mới nhất lên đầu
        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server Error" });
    }
};