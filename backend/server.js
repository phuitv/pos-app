const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const userRoutes = require('./routes/user.route');
app.use('/api/users', userRoutes);

// Trang cài đặt cửa hàng
const storeRoutes = require('./routes/store.route');
app.use('/api/stores', storeRoutes);

// Load env vars
dotenv.config();

const app = express();

// Body parser - để server có thể đọc được dữ liệu JSON gửi lên
app.use(express.json());

// Enable CORS
app.use(cors());    // Tạm thời cho phép tất cả để dễ deploy

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err));

// A simple test route
app.get('/', (req, res) => {
    res.send('API is running...');
});

const productRoutes = require('./routes/product.route');
app.use('/api/products', productRoutes); // Gắn router sản phẩm vào đường dẫn /api/products

const orderRoutes = require('./routes/order.route');
app.use('/api/orders', orderRoutes);

const authRoutes = require('./routes/auth.route');
app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/user.route');
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));