import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Container, Paper, Typography, Box, TextField, Button, Select, MenuItem, 
    FormControl, InputLabel } from '@mui/material';
import AuthContext from '../context/AuthContext';

const SetupStorePage = ({ setNotification }) => {
    const { updateUserAfterSetup, logout } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: '', address: '', phone: '', businessType: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("--- SUBMITTING SETUP FORM ---");
        console.log("Form data being sent:", formData);
        try {
            // Nhận lại dữ liệu store đã cập nhật
            const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/stores/my`, formData);
            console.log("API call successful. Response data:", data.data);
            setNotification({ open: true, message: 'Thiết lập thành công!', severity: 'success' });

            console.log("About to call updateUserAfterSetup with:", data.data);
            updateUserAfterSetup(data.data);
            console.log("Finished calling updateUserAfterSetup.");

        } catch (error) {
            console.error("--- ERROR DURING SETUP SUBMIT ---", error);
            const errorMessage = error.response?.data?.error || error.message;
            setNotification({ open: true, message: `Lỗi: ${errorMessage}`, severity: 'error' });
        }
    };

    return (
        <Container component="main" maxWidth="sm" sx={{ mt: 8 }}>
            <Paper sx={{ p: 4, position: 'relative' }}>
                <Button 
                    onClick={logout} 
                    sx={{ position: 'absolute', top: 16, right: 16 }}
                    variant="text"
                    size="small"
                >
                    Đăng xuất
                </Button>
                <Typography component="h1" variant="h4" align="center" gutterBottom>
                    Thiết lập Cửa hàng
                </Typography>
                <Typography align="center" sx={{ mb: 3 }}>
                    Chào mừng! Vui lòng cung cấp một số thông tin ban đầu để chúng tôi có thể tối ưu hóa trải nghiệm cho bạn.
                </Typography>
                <Box component="form" onSubmit={handleSubmit}>
                    <TextField name="name" label="Tên cửa hàng" onChange={handleChange} value={formData.name} required fullWidth margin="normal" />
                    <TextField name="address" label="Địa chỉ" onChange={handleChange} value={formData.address} required fullWidth margin="normal" />
                    <TextField name="phone" label="Số điện thoại" onChange={handleChange} value={formData.phone} required fullWidth margin="normal" />
                    <FormControl fullWidth required margin="normal">
                        <InputLabel>Loại hình kinh doanh</InputLabel>
                        <Select name="businessType" value={formData.businessType} label="Loại hình kinh doanh" onChange={handleChange}>
                            <MenuItem value="food_and_beverage">Dịch vụ ăn/uống (Cà phê, Quán ăn...)</MenuItem>
                            <MenuItem value="retail">Kinh doanh mua/bán (Tạp hóa, Thời trang...)</MenuItem>
                            <MenuItem value="service">Ngành dịch vụ (Nhà nghỉ, Rửa xe...)</MenuItem>
                        </Select>
                    </FormControl>
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, p: 1.5 }}>
                        Hoàn tất Thiết lập
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default SetupStorePage;