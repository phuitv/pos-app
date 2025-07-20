import React, { useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer, List, ListItem, ListItemText, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    const { isAuthenticated, logout, user } = useContext(AuthContext);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ my: 2 }}>
                POS App
            </Typography>
            <Divider />
            <List>
                <ListItem component={NavLink} to="/" style={({ isActive }) => ({ backgroundColor: isActive ? '#e0e0e0' : 'transparent' })}>
                    <ListItemText primary="Bán hàng" />
                </ListItem>
                
                {user && user.role === 'admin' && (
                    <>
                        <ListItem component={NavLink} to="/products" style={({ isActive }) => ({ backgroundColor: isActive ? '#e0e0e0' : 'transparent' })}>
                            <ListItemText primary="Quản lý Sản phẩm" />
                        </ListItem>
                        <ListItem component={NavLink} to="/orders" style={({ isActive }) => ({ backgroundColor: isActive ? '#e0e0e0' : 'transparent' })}>
                            <ListItemText primary="Lịch sử Đơn hàng" />
                        </ListItem>
                        <ListItem component={NavLink} to="/users" style={({ isActive }) => ({ backgroundColor: isActive ? '#e0e0e0' : 'transparent' })}>
                            <ListItemText primary="Quản lý Người dùng" />
                        </ListItem>
                        <ListItem component={NavLink} to="/ingredients" style={({ isActive }) => ({ backgroundColor: isActive ? '#e0e0e0' : 'transparent' })}>
                            <ListItemText primary="Nguyên vật liệu" />
                        </ListItem>
                        <ListItem component={NavLink} to="/settings" style={({ isActive }) => ({ backgroundColor: isActive ? '#e0e0e0' : 'transparent' })}>
                            <ListItemText primary="Cài đặt Cửa hàng" />
                        </ListItem>
                    </>
                )}

                <ListItem component="button" onClick={logout}>
                    <ListItemText primary="Đăng xuất" />
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex' }}>
        <AppBar component="nav">
            <Toolbar>
                {/* Nút Hamburger chỉ hiển thị trên màn hình nhỏ */}
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{ mr: 2, display: { sm: 'none' } }} // display: none trên màn hình sm trở lên
                >
                    <MenuIcon />
                </IconButton>
                
                {/* Tên App */}
                <Typography
                    variant="h6"
                    component="div"
                    sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }} // Ẩn trên màn hình xs
                >
                    POS App
                </Typography>

                {/* Các nút menu chỉ hiển thị trên màn hình lớn */}
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    {isAuthenticated && (
                         <>
                            <Button 
                                component={NavLink} 
                                to="/" 
                                sx={{ 
                                    color: '#fff', 
                                    '&.active': { backgroundColor: 'rgba(255, 255, 255, 0.2)' } 
                                }}
                            >
                                Bán hàng
                            </Button>
                            
                            {user && user.role === 'admin' && (
                                <>
                                    <Button component={NavLink} to="/products" sx={{ color: '#fff', '&.active': { backgroundColor: 'rgba(255, 255, 255, 0.2)' } }}>Quản lý Sản phẩm</Button>
                                    <Button component={NavLink} to="/orders" sx={{ color: '#fff', '&.active': { backgroundColor: 'rgba(255, 255, 255, 0.2)' } }}>Lịch sử Đơn hàng</Button>
                                    <Button component={NavLink} to="/users" sx={{ color: '#fff', '&.active': { backgroundColor: 'rgba(255, 255, 255, 0.2)' } }}>Quản lý Người dùng</Button>
                                    <Button component={NavLink} to="/incredients" sx={{ color: '#fff', '&.active': { backgroundColor: 'rgba(255, 255, 255, 0.2)' } }}>Nguyên vật liệu</Button>
                                    <Button component={NavLink} to="/settings" sx={{ color: '#fff', '&.active': { backgroundColor: 'rgba(255, 255, 255, 0.2)' } }}>Cài đặt Cửa hàng</Button>
                                </>
                            )}
                            
                            <Button color="inherit" onClick={logout}>Đăng xuất</Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
        
        {/* Ngăn kéo menu mobile */}
        <nav>
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true, // Tốt hơn cho hiệu năng trên mobile
                }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
                }}
            >
                {drawer}
            </Drawer>
        </nav>
    </Box>
    );
};

export default Navbar;