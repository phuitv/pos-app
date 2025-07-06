import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Box, Paper, Typography } from '@mui/material';

const AddProductForm = ({ onProductAdded }) => {
    // Sử dụng useState để quản lý trạng thái của từng ô input trong form
    const [name, setName] = useState('');
    const [sku, setSku] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');

    // Hàm này sẽ được gọi khi người dùng nhấn nút submit form
    const handleSubmit = async (e) => {
        e.preventDefault(); // Ngăn chặn hành vi mặc định của form là tải lại trang

        // Tạo đối tượng sản phẩm mới từ dữ liệu trong state
        const newProduct = {
            name,
            sku,
            price: Number(price), // Chuyển giá trị price sang kiểu Number
            quantity: Number(quantity) // Chuyển quantity sang kiểu Number
        };

        try {
            // Gửi yêu cầu POST đến API backend để tạo sản phẩm
            const response = await axios.post('${import.meta.env.VITE_API_URL}/api/products', newProduct);

            // Gọi hàm onProductAdded được truyền từ component cha (ProductManagementPage)
            // để thông báo rằng một sản phẩm mới đã được thêm.
            // Chúng ta truyền dữ liệu sản phẩm mới nhận được từ API.
            onProductAdded(response.data.data);

            // Reset các ô input về rỗng sau khi thêm thành công
            setName('');
            setSku('');
            setPrice('');
            setQuantity('');

        } catch (error) {
            console.error('Lỗi khi thêm sản phẩm:', error);
            // Hiển thị một thông báo lỗi cụ thể hơn nếu có thể
            alert('Có lỗi xảy ra: ' + (error.response?.data?.error || error.message));
        }
    };

    return (
        <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Thông tin sản phẩm</Typography>
            <Box component="form" onSubmit={handleSubmit}>
                <TextField
                    label="Tên sản phẩm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth required margin="normal"
                />
                <TextField
                    label="Mã SKU"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    fullWidth required margin="normal"
                />
                <TextField
                    label="Giá bán"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    fullWidth required margin="normal"
                />
                <TextField
                    label="Số lượng"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    fullWidth required margin="normal"
                />
                <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                    Lưu sản phẩm
                </Button>
            </Box>
        </Paper>
    );
};

export default AddProductForm;