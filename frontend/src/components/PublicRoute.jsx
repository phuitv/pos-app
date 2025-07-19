import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useContext(AuthContext);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    }
    
    // Nếu đã đăng nhập, không cho vào trang login, đá về trang chủ
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Nếu chưa, cho phép vào
    return children;
};

export default PublicRoute;