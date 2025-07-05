const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Load env vars
dotenv.config();

const app = express();

// Body parser - để server có thể đọc được dữ liệu JSON gửi lên
app.use(express.json());

// Enable CORS
app.use(cors({
    origin: 'http://localhost:5173' // Chỉ cho phép origin này truy cập
}));

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));