import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Container, Box, TextField, Button, Typography, Paper, IconButton, InputAdornment } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault(); // Ngăn hành vi mặc định khi nhấn giữ chuột
    };

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy đường dẫn mà người dùng muốn truy cập trước khi bị chuyển về trang login
    const from = location.state?.from?.pathname || "/";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(username, password);
            // Đăng nhập thành công, chuyển hướng về trang trước đó hoặc trang chủ
            navigate(from, { replace: true });
        } catch (err) {
            setError('Tên đăng nhập hoặc mật khẩu không đúng.');
            console.error(err);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={6} sx={{ marginTop: 8, padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    Đăng nhập
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Tên đăng nhập"
                        name="username"
                        autoFocus
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Mật khẩu"
                        type={showPassword ? 'text' : 'password'}   // type sẽ thay đổi dựa trên state
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        
                        // Gắn icon vào cuối ô input
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowPassword}
                                        onMouseDown={handleMouseDownPassword}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    {error && (
                        <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                            {error}
                        </Typography>
                    )}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Đăng nhập
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default LoginPage;