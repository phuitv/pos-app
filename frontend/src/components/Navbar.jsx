import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    const { isAuthenticated, logout, user } = useContext(AuthContext);

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    POS App
                </Typography>
                {isAuthenticated && (
                    <>
                        <Button color="inherit" href="/">Bán hàng</Button>

                        {/* NẾU LÀ ADMIN, HIỂN THỊ CÁC NÚT QUẢN LÝ */}
                        {user && user.role === 'admin' && (
                            <>
                                <Button color="inherit" href="/products">Quản lý Sản phẩm</Button>
                                <Button color="inherit" href="/orders">Lịch sử Đơn hàng</Button>
                                <Button color="inherit" href="/users">Quản lý Người dùng</Button>
                                <Button color="inherit" href="/settings">Cài đặt Cửa hàng</Button>
                                
                            </>
                        )}
                        
                        <Button color="inherit" onClick={logout}>Đăng xuất</Button>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;