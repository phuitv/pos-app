import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Container, Typography, Paper, Box, TextField, Button, CircularProgress } from '@mui/material';
import AuthContext from '../context/AuthContext';

const StoreSettingsPage = () => {
    const { user } = useContext(AuthContext);
    const [store, setStore] = useState(null);
    const [formData, setFormData] = useState({ name: '', address: '', phone: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStoreData = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/stores/my`);
                setStore(data.data);
                setFormData({
                    name: data.data.name,
                    address: data.data.address,
                    phone: data.data.phone
                });
            } catch (error) {
                console.error("Không thể lấy thông tin cửa hàng:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user && user.role === 'admin') {
            fetchStoreData();
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/stores/my`, formData);
            setStore(data.data);
            alert('Cập nhật thông tin cửa hàng thành công!');
        } catch (error) {
            alert('Lỗi khi cập nhật: ' + (error.response?.data?.error || error.message));
        }
    };

    if (loading) {
        return <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Container>;
    }

    if (!user || user.role !== 'admin') {
        return <Container><Typography>Bạn không có quyền truy cập trang này.</Typography></Container>;
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Cài đặt Cửa hàng
            </Typography>
            <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
                <TextField
                    label="Tên cửa hàng"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required fullWidth margin="normal"
                />
                <TextField
                    label="Địa chỉ"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    fullWidth margin="normal"
                />
                <TextField
                    label="Số điện thoại"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    fullWidth margin="normal"
                />
                <Box sx={{ mt: 2 }}>
                    <Button type="submit" variant="contained">Lưu thay đổi</Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default StoreSettingsPage;