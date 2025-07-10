const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './.env' }); // Chỉ định đường dẫn đến file .env ở thư mục backend

// Load models
const User = require('../models/user.model');
const Store = require('../models/store.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model'); // Thêm Order nếu bạn muốn seed cả đơn hàng

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

// Read JSON files
const stores = JSON.parse(fs.readFileSync(`${__dirname}/stores.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const products = JSON.parse(fs.readFileSync(`${__dirname}/products.json`, 'utf-8'));

// Import data into DB
const importData = async () => {
    try {
        await Store.create(stores);
        await User.create(users); // Model sẽ tự động băm mật khẩu
        await Product.create(products);
        console.log('SUCCESS: Data Imported!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

// Delete data from DB
const deleteData = async () => {
    try {
        await Store.deleteMany();
        await User.deleteMany();
        await Product.deleteMany();
        await Order.deleteMany();
        console.log('SUCCESS: Data Destroyed!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

// Xử lý tham số dòng lệnh
if (process.argv[2] === '-i' || process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '-d' || process.argv[2] === '--delete') {
    deleteData();
} else {
    console.log('Please use the -i or -d flag');
    process.exit();
}