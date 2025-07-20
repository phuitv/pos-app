import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Container, Typography, Paper, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    useTheme, // Hook để truy cập theme
    useMediaQuery, // Hook để kiểm tra màn hình
    Box, // Rất hữu ích để tạo layout
    Card, CardContent, Divider, Chip // Component cho giao diện mobile
} from '@mui/material';

const OrderHistoryPage = () => {
    const [orders, setOrders] = useState([]);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders`);
                setOrders(data.data);
            } catch (error) {
                console.error("Không thể lấy lịch sử đơn hàng:", error);
            }
        };
        fetchOrders();
    }, []);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Lịch sử Đơn hàng
            </Typography>

            {isMobile ? (
                // --- GIAO DIỆN CHO MOBILE ---
                <Box>
                    {orders.map((order) => (
                        <Card key={order._id} sx={{ mb: 2 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                        {order.orderCode || order._id.slice(-8).toUpperCase()}
                                    </Typography>
                                    <Chip
                                        label={order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Ghi nợ'}
                                        color={order.paymentStatus === 'paid' ? 'success' : 'warning'}
                                        size="small"
                                    />
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    Ngày: {new Date(order.createdAt).toLocaleString('vi-VN')}
                                </Typography>
                                <Divider sx={{ my: 1.5 }} />
                                
                                {/* Danh sách sản phẩm trong đơn */}
                                {order.orderItems.map(item => (
                                    <Box key={item._id} sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                        <Typography variant="body2">{item.name} (x{item.quantity})</Typography>
                                        <Typography variant="body2">{new Intl.NumberFormat('vi-VN').format(item.price * item.quantity)} ₫</Typography>
                                    </Box>
                                ))}

                                <Divider sx={{ my: 1.5 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                    <Typography variant="h6">Tổng cộng:</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        {new Intl.NumberFormat('vi-VN').format(order.totalAmount)} ₫
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            ) : (
                // --- GIAO DIỆN CHO DESKTOP ---
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Mã Đơn hàng (ID)</TableCell>
                                <TableCell>Ngày tạo</TableCell>
                                <TableCell>Chi tiết</TableCell>
                                <TableCell align="right">Tổng tiền</TableCell>
                                <TableCell align="center">Trạng thái</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.orderCode}>
                                    <TableCell>{order.orderCode}</TableCell>
                                    <TableCell>{new Date(order.createdAt).toLocaleString('vi-VN')}</TableCell>
                                    <TableCell>
                                        {order.orderItems.map(item => (
                                            <div key={item._id}>{item.name} (x{item.quantity})</div>
                                        ))}
                                    </TableCell>
                                    <TableCell align="right">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Ghi nợ'}
                                            color={order.paymentStatus === 'paid' ? 'success' : 'warning'}
                                            size="small"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
};

export default OrderHistoryPage;