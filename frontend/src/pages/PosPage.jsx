import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Grid, Typography, Paper } from '@mui/material';
import { List, ListItem, ListItemText, TextField, Divider, Button, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';

const PosPage = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]); // State để lưu giỏ hàng

    const addProductToCart = (product) => {
        // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
        const existingProduct = cart.find(item => item._id === product._id);

        if (existingProduct) {
            // Nếu đã có, chỉ tăng số lượng
            setCart(cart.map(item =>
                item._id === product._id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            // Nếu chưa có, thêm sản phẩm mới vào giỏ hàng với số lượng là 1
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            // Nếu số lượng <= 0, xóa sản phẩm khỏi giỏ hàng
            setCart(cart.filter(item => item._id !== productId));
        } else {
            setCart(cart.map(item =>
                item._id === productId
                    ? { ...item, quantity: newQuantity }
                    : item
            ));
        }
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item._id !== productId));
    };

    // Tính tổng tiền của giỏ hàng
    const calculateTotal = () => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    // Thêm một state để xử lý trạng thái loading khi đang thanh toán
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        if (cart.length === 0) return;

        setLoading(true); // Bắt đầu loading

        // Chuẩn bị dữ liệu để gửi lên API
        const orderData = {
            orderItems: cart.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                product: item._id // chỉ cần gửi ID của sản phẩm
            })),
            totalAmount: calculateTotal()
        };

        try {
            await axios.post('http://localhost:5001/api/orders', orderData);
            alert('Tạo đơn hàng thành công!');
            setCart([]); // Xóa giỏ hàng sau khi thành công
        } catch (error) {
            console.error("Lỗi khi tạo đơn hàng:", error);
            alert("Có lỗi xảy ra: " + (error.response?.data?.error || "Không thể kết nối tới server"));
        } finally {
            setLoading(false); // Kết thúc loading dù thành công hay thất bại
        }
    };

    // Lấy danh sách sản phẩm từ API khi component được tải
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await axios.get('http://localhost:5001/api/products');
                setProducts(data.data);
            } catch (error) {
                console.error("Không thể lấy danh sách sản phẩm:", error);
            }
        };
        fetchProducts();
    }, []);

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>    {/* spacing={3} tạo khoảng cách giữa các cột */}
                {/* Cột Trái: Danh sách sản phẩm */}
                <Grid item xs={12} md={7}>  {/* xs={12} nghĩa là trên màn hình rất nhỏ (extra small), nó chiếm 12/12 cột (toàn bộ chiều rộng). md={7} nghĩa là trên màn hình trung bình (medium) trở lên, nó chiếm 7/12 cột. Đây chính là cách làm responsive của MUI */}
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Sản phẩm
                        </Typography>
                        <Grid container spacing={2}>
                            {products.map((product) => (
                                <Grid item xs={6} sm={4} md={3} key={product._id}>
                                    <Paper 
                                        onClick={() => addProductToCart(product)}
                                        sx={{ p: 2, textAlign: 'center', cursor: 'pointer', '&:hover': { backgroundColor: '#f0f0f0' } }}
                                    >
                                        <Typography variant="subtitle1" noWrap>{product.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {new Intl.NumberFormat('vi-VN').format(product.price)} ₫
                                        </Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>

                {/* Cột Phải: Giỏ hàng */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Hóa đơn
                        </Typography>
                        <List>
                            {cart.map((item) => (
                                <ListItem key={item._id} dense>
                                    <ListItemText
                                        primary={item.name}
                                        secondary={`${new Intl.NumberFormat('vi-VN').format(item.price)} ₫`}
                                    />
                                    <TextField
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => updateQuantity(item._id, parseInt(e.target.value, 10))}
                                        sx={{ width: '60px', mx: 2 }}
                                        inputProps={{ min: 1 }}
                                    />
                                    <IconButton edge="end" aria-label="delete" onClick={() => removeFromCart(item._id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </ListItem>
                            ))}
                        </List>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ p: 2 }}>
                            <Typography variant="h5" align="right">
                                Tổng tiền: {new Intl.NumberFormat('vi-VN').format(calculateTotal())} ₫
                            </Typography>
                            <Button
                                variant="contained"
                                fullWidth
                                sx={{ mt: 2 }}
                                disabled={cart.length === 0 || loading} // Vô hiệu hóa nút khi giỏ hàng rỗng hoặc đang loading
                                onClick={handlePayment} // Gọi hàm handlePayment
                            >
                                {loading ? 'Đang xử lý...' : 'Thanh toán'}
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default PosPage;