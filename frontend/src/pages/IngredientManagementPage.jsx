// frontend/src/pages/IngredientManagementPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Container, Typography, Paper, Box, Grid, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Snackbar, Alert } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AuthContext from '../context/AuthContext';

const IngredientManagementPage = () => {
    const { user } = useContext(AuthContext);
    const [ingredients, setIngredients] = useState([]);
    const [formData, setFormData] = useState({ _id: null, name: '', unit: '', stock: 0, costPerUnit: 0 });
    const [isEditing, setIsEditing] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    const fetchIngredients = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/ingredients`);
            setIngredients(data.data || []);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách nguyên vật liệu:", error);
        }
    };

    useEffect(() => {
        fetchIngredients();
    }, []);

    const resetForm = () => {
        setFormData({ _id: null, name: '', unit: '', stock: 0, costPerUnit: 0 });
        setIsEditing(false);
    };

    const handleEdit = (ingredient) => {
        setFormData(ingredient);
        setIsEditing(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = isEditing ? 'put' : 'post';
        const url = isEditing 
            ? `${import.meta.env.VITE_API_URL}/api/ingredients/${formData._id}`
            : `${import.meta.env.VITE_API_URL}/api/ingredients`;

        try {
            await axios[method](url, formData);
            setNotification({ open: true, message: `Thao tác thành công!`, severity: 'success' });
            resetForm();
            fetchIngredients();
        } catch (error) {
            setNotification({ open: true, message: 'Lỗi: ' + (error.response?.data?.error || error.message), severity: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa nguyên vật liệu này?')) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/api/ingredients/${id}`);
                setNotification({ open: true, message: 'Xóa thành công!', severity: 'success' });
                fetchIngredients();
            } catch (error) {
                setNotification({ open: true, message: 'Lỗi khi xóa.', severity: 'error' });
            }
        }
    };

    if (user?.role !== 'admin') {
        return <Container><Typography>Bạn không có quyền truy cập trang này.</Typography></Container>;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>Quản lý Nguyên vật liệu</Typography>
            
            <Paper component="form" onSubmit={handleSubmit} sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6">{isEditing ? 'Cập nhật Nguyên vật liệu' : 'Thêm Nguyên vật liệu mới'}</Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField name="name" label="Tên Nguyên vật liệu" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField name="unit" label="Đơn vị tính (kg, gram, cái...)" value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} required fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField name="stock" label={isEditing ? "Số lượng tồn kho (Nhập hàng)" : "Số lượng ban đầu"} type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} required fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField name="costPerUnit" label="Giá nhập / đơn vị" type="number" value={formData.costPerUnit} onChange={(e) => setFormData({...formData, costPerUnit: e.target.value})} required fullWidth />
                    </Grid>
                </Grid>
                <Box sx={{ mt: 2 }}>
                    <Button type="submit" variant="contained">{isEditing ? 'Cập nhật' : 'Thêm mới'}</Button>
                    {isEditing && <Button onClick={resetForm} sx={{ ml: 2 }}>Hủy</Button>}
                </Box>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Tên Nguyên vật liệu</TableCell>
                            <TableCell>Đơn vị</TableCell>
                            <TableCell align="right">Tồn kho</TableCell>
                            <TableCell align="right">Giá vốn / Đơn vị</TableCell>
                            <TableCell align="center">Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {ingredients.map(ing => (
                            <TableRow key={ing._id}>
                                <TableCell>{ing.name}</TableCell>
                                <TableCell>{ing.unit}</TableCell>
                                <TableCell align="right">{ing.stock}</TableCell>
                                <TableCell align="right">{new Intl.NumberFormat('vi-VN').format(ing.costPerUnit)} ₫</TableCell>
                                <TableCell align="center">
                                    <IconButton onClick={() => handleEdit(ing)}><EditIcon /></IconButton>
                                    <IconButton onClick={() => handleDelete(ing._id)} color="error"><DeleteIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({ ...notification, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity} sx={{ width: '100%' }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default IngredientManagementPage;