import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Import các component cần thiết của MUI
import { Modal, Box, Typography, TextField, Button } from '@mui/material';

// Style cho Box bên trong Modal
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const EditProductModal = ({ product, onClose, onProductUpdated }) => {
    // State để lưu dữ liệu của form, khởi tạo với dữ liệu sản phẩm đang sửa
    const [formData, setFormData] = useState({
        name: '', sku: '', price: '', quantity: ''
    });

    // useEffect sẽ chạy mỗi khi prop 'product' thay đổi
    // để cập nhật form với dữ liệu mới
    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                sku: product.sku,
                price: product.price,
                quantity: product.quantity
            });
        }
    }, [product]);

    // Nếu không có sản phẩm nào được truyền vào (tức là không ở chế độ sửa)
    // thì không render gì cả
    if (!product) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedData = {
                ...formData,
                price: Number(formData.price),
                quantity: Number(formData.quantity)
            };
            const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/products/${product._id}`, updatedData);
            onProductUpdated(res.data.data); // Báo cho component cha biết đã cập nhật xong
            onClose(); // Đóng modal
            alert('Cập nhật thành công!');
        } catch (error) {
            console.error('Lỗi khi cập nhật sản phẩm', error);
            alert('Có lỗi xảy ra khi cập nhật.');
        }
    };

    return (
        // Sử dụng component Modal của MUI
        <Modal
            open={Boolean(product)} // Modal sẽ mở khi prop 'product' có giá trị (truthy)
            onClose={onClose}
            aria-labelledby="modal-title"
        >
            <Box sx={style}>
                <Typography id="modal-title" variant="h6" component="h2">
                    Sửa sản phẩm
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <TextField name="name" label="Tên sản phẩm" value={formData.name} onChange={handleChange} fullWidth required margin="normal" />
                    <TextField name="sku" label="Mã SKU" value={formData.sku} onChange={handleChange} fullWidth required margin="normal" />
                    <TextField name="price" label="Giá bán" type="number" value={formData.price} onChange={handleChange} fullWidth required margin="normal" />
                    <TextField name="quantity" label="Số lượng" type="number" value={formData.quantity} onChange={handleChange} fullWidth required margin="normal" />
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={onClose}>Hủy</Button>
                        <Button type="submit" variant="contained" sx={{ ml: 1 }}>
                            Lưu thay đổi
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
};

export default EditProductModal;