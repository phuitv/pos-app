import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, IconButton, Button, Box, TextField, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('staff');

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`);
            setUsers(data.data);
        } catch (error) {
            console.error("Không thể lấy danh sách người dùng:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/users`, { username, password, role });
            alert('Tạo người dùng thành công!');
            // Reset form
            setUsername('');
            setPassword('');
            setRole('staff');
            // Tải lại danh sách
            fetchUsers();
        } catch (error) {
            alert('Lỗi khi tạo người dùng: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/${userId}`);
                alert('Xóa người dùng thành công!');
                fetchUsers();
            } catch (error) {
                alert('Lỗi khi xóa người dùng.');
            }
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Quản lý Người dùng
            </Typography>
            
            {/* Form tạo người dùng */}
            <Paper component="form" onSubmit={handleCreateUser} sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6">Tạo tài khoản mới</Typography>
                <TextField label="Tên đăng nhập" value={username} onChange={e => setUsername(e.target.value)} required fullWidth margin="normal" />
                <TextField label="Mật khẩu" type="password" value={password} onChange={e => setPassword(e.target.value)} required fullWidth margin="normal" />
                <FormControl fullWidth margin="normal">
                    <InputLabel>Vai trò</InputLabel>
                    <Select value={role} label="Vai trò" onChange={e => setRole(e.target.value)}>
                        <MenuItem value="staff">Nhân viên (Staff)</MenuItem>
                        <MenuItem value="admin">Quản trị (Admin)</MenuItem>
                    </Select>
                </FormControl>
                <Button type="submit" variant="contained" sx={{ mt: 2 }}>Tạo tài khoản</Button>
            </Paper>

            {/* Bảng danh sách người dùng */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Tên đăng nhập</TableCell>
                            <TableCell>Vai trò</TableCell>
                            <TableCell align="center">Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user._id}>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell align="center">
                                    <IconButton color="error" onClick={() => handleDeleteUser(user._id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default UserManagementPage;