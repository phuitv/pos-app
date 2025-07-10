const Product = require('../models/product.model');

// @desc    Tạo một sản phẩm mới
// @route   POST /api/products
// @access  Public (sau này sẽ là Private)
exports.createProduct = async (req, res, next) => {
    try {
        // Tự động thêm store ID của user vào sản phẩm mới
        const product = await Product.create({  //Product.create(req.body): dùng Mongoose để tạo 1 bản ghi mới trong collection 'products'
            ...req.body,    //req.body chứa dữ liệu mà client (frontend) gửi lên khi tạo sp mới
            store: req.storeId
        });
        res.status(201).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Lấy tất cả sản phẩm
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
    try {
        // Chỉ tìm các sản phẩm có store ID khớp với store ID của user
        const products = await Product.find({ store: req.storeId });  //dùng Mongoose để lấy tất cả bản ghi
        res.status(200).json({  //gửi phản hồi về cho client dưới dạng JSON; status(201) nghĩa là "Created", 200 là "OK"
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Xóa một sản phẩm
// @route   DELETE /api/products/:id
// @access  Public (sau này sẽ là Private/Admin)
exports.deleteProduct = async (req, res, next) => {
    try {
        let product = await Product.findById(req.params.id);

        // KIỂM TRA Sản phẩm có tồn tại và có thuộc đúng cửa hàng không?
        if (!product || product.store.toString() !== req.storeId) {
           return res.status(404).json({ success: false, error: `Product not found with id of ${req.params.id}` });
        }

        // Nếu đúng, tiếp tục delete
        await product.deleteOne(); // Hoặc Product.findByIdAndDelete(req.params.id)

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Cập nhật một sản phẩm
// @route   PUT /api/products/:id
// @access  Public (sau này sẽ là Private/Admin)
exports.updateProduct = async (req, res, next) => {
    try {
        let product = await Product.findById(req.params.id);

        // KIỂM TRA Sản phẩm có tồn tại và có thuộc đúng cửa hàng không?
        if (!product || product.store.toString() !== req.storeId) {
           return res.status(404).json({ success: false, error: `Product not found with id of ${req.params.id}` });
        }

        // Nếu đúng, tiếp tục cập nhật
        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Trả về document đã được cập nhật
            runValidators: true // Chạy lại các trình xác thực (validation) của schema
        });

        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};