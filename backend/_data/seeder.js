const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: '../.env' }); // Chỉ định đường dẫn đến file .env ở thư mục backend

// Load models
const User = require('../models/user.model');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Thêm Dữ liệu người dùng
const users = [
    {
        username: 'superadmin',
        password: 'superpassword123',
        role: 'admin'
    },
    {
        username: 'nhanvien01',
        password: 'password123',
        role: 'staff'
    }
];

// Import data into DB
const importData = async () => {
    try {
        await User.create(users);
        console.log('SUCCESS: Data Imported...');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

// Delete data from DB
const deleteData = async () => {
    try {
        await User.deleteMany();
        console.log('SUCCESS: Data Destroyed...');
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