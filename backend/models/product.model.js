const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên sản phẩm'], // Tên sản phẩm là bắt buộc
        trim: true // Tự động loại bỏ khoảng trắng thừa
    },
    sku: {
        type: String,
        trim: true,
        unique: true, // Mã SKU phải là duy nhất, không được trùng
        sparse: true    // Cho phép sku là null/undefined, nếu nhập, sku phải là duy nhất
    },
    price: {
        type: Number,
        required: [true, 'Vui lòng nhập giá bán']
    },
    costPrice: {
        type: Number,
        default: 0 // Giá trị mặc định là 0
    },
    trackQuantity: {
        type: Boolean,
        default: true // Mặc định là có theo dõi tồn kho
    },
    quantity: {
        type: Number,
        default: 0 // Giá trị mặc định nếu không cung cấp
    },
    recipe: [{
        ingredient: {
            type: mongoose.Schema.ObjectId,
            ref: 'Ingredient',
            required: true
        },
        amount: { // Số lượng nguyên vật liệu cần cho 1 sản phẩm
            type: Number,
            required: true
        }
    }],
    store: {
        type: mongoose.Schema.ObjectId,
        ref: 'Store',
        required: true
    }
}, {
    timestamps: true // Tự động thêm 2 trường: createdAt (thời gian tạo) và updatedAt (cập nhật lần cuối)
});

// --- MIDDLEWARE TÍNH GIÁ VỐN TỰ ĐỘNG ---
ProductSchema.pre('save', async function(next) {
    // Nếu sản phẩm có công thức, tính toán lại giá vốn
    if (this.isModified('recipe') && this.recipe.length > 0) {
        let totalCost = 0;
        // Dùng Promise.all để lấy thông tin của tất cả nguyên vật liệu cùng lúc
        const ingredients = await mongoose.model('Ingredient').find({
            '_id': { $in: this.recipe.map(item => item.ingredient) }
        });
        
        this.recipe.forEach(item => {
            const ingredientInfo = ingredients.find(i => i._id.equals(item.ingredient));
            if (ingredientInfo) {
                totalCost += ingredientInfo.costPerUnit * item.amount;
            }
        });
        this.costPrice = totalCost;
        
        // Sản phẩm có công thức thì không quản lý tồn kho trực tiếp
        this.trackQuantity = false; 
        this.quantity = 0; // Hoặc có thể để là Infinity
    }
    next();
});

// --- MIDDLEWARE TỰ ĐỘNG TẠO SKU ---
ProductSchema.pre('save', function(next) {
    // Chỉ chạy logic này nếu sku rỗng HOẶC đây là một document mới
    if (!this.sku) {    // 'this' là document sản phẩm sắp được lưu
        // 1. Lấy 3 ký tự đầu của tên sản phẩm, chuyển thành chữ hoa
        const namePrefix = this.name.substring(0, 3).toUpperCase();
        
        // 2. Lấy 6 ký tự cuối của timestamp hiện tại (dạng mili giây)
        const timestampSuffix = Date.now().toString().slice(-6);

        // 3. Ghép chúng lại để tạo SKU
        this.sku = `${namePrefix}-${timestampSuffix}`;
    }
    
    // Báo cho Mongoose biết là đã xử lý xong và có thể tiếp tục quá trình save
    next();
});

module.exports = mongoose.model('Product', ProductSchema);