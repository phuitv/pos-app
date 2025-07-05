import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

const OrderHistoryPage = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await axios.get('http://localhost:5001/api/orders');
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
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Mã Đơn hàng (ID)</TableCell>
                            <TableCell>Ngày tạo</TableCell>
                            <TableCell>Chi tiết</TableCell>
                            <TableCell align="right">Tổng tiền</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order._id}>
                                <TableCell>{order._id}</TableCell>
                                <TableCell>{new Date(order.createdAt).toLocaleString('vi-VN')}</TableCell>
                                <TableCell>
                                    {order.orderItems.map(item => (
                                        <div key={item._id}>{item.name} (x{item.quantity})</div>
                                    ))}
                                </TableCell>
                                <TableCell align="right">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default OrderHistoryPage;