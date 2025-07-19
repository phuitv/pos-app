const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: __dirname + '/../.env' }); // Chỉ định đường dẫn đến file .env ở thư mục backend

// Load models
const Store = require('../models/store.model');
const User = require('../models/user.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');

// Connect to DB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

// Hàm Import/Update dữ liệu
const importData = async () => {
    try {
        // Đọc file
        const stores = JSON.parse(fs.readFileSync(`${__dirname}/stores.json`, 'utf-8'));
        const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

        console.log('Importing/Updating data...');

        // Upsert Stores
        for (const store of stores) {
            await Store.updateOne({ _id: store._id }, store, { upsert: true });
        }
        console.log('Stores processed.');

        // Upsert Users
        for (const user of users) {
            // Đối với user, chúng ta cần xử lý mật khẩu riêng vì upsert không kích hoạt middleware 'save'
            const existingUser = await User.findOne({ username: user.username });
            if (existingUser) {
                // Chỉ cập nhật, không thay đổi mật khẩu trừ khi được cung cấp
                await User.updateOne({ username: user.username }, user);
            } else {
                // Tạo mới nếu chưa tồn tại
                await User.create(user);
            }
        }
        console.log('Users processed.');

        console.log('SUCCESS: Data imported/updated!');
    } catch (err) {
        console.error('Error during import/update:', err);
    }
};

// Delete data from DB
const deleteData = async () => {
    try {
        console.log('Destroying all data...');
        await Store.deleteMany();
        await User.deleteMany();
        await Product.deleteMany();
        await Order.deleteMany();
        console.log('SUCCESS: Data Destroyed!');
    } catch (err) {
        console.error('Error during deletion:', err);
    }
};

// Hàm chính để chạy
const run = async () => {
    await connectDB();

    const flag = process.argv[2];

    if (flag === '-i' || flag === '--import') {
        await importData();
    } else if (flag === '-d' || flag === '--delete') {
        await deleteData();
    } else {
        console.log('Please add an option: -i to import/update data, -d to delete data');
    }

    await mongoose.connection.close();
    process.exit();
};

run();