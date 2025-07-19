import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, user, loading } = useContext(AuthContext);
    const location = useLocation();

    console.log('--- PROTECTED ROUTE RENDERING ---'); // LOG 5
    console.log('isAuthenticated:', isAuthenticated);
    console.log('loading:', loading);
    console.log('location.pathname:', location.pathname);
    if (user) {
        console.log('user.store.isSetupCompleted:', user.store?.isSetupCompleted);
    } else {
        console.log('user is null');
    }

    // Trong khi đang kiểm tra xác thực, hiển thị spinner
    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    }

    // Nếu không xác thực, đá về trang login
    if (!isAuthenticated) {
        console.log('--> Decision: Navigate to /login');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    // Nếu là admin nhưng chưa setup, và đang không ở trang setup, đá về trang setup
    if (user.role === 'admin' && !user.store?.isSetupCompleted && location.pathname !== '/setup-store') {
        console.log('--> Decision: Navigate to /setup-store');
        return <Navigate to="/setup-store" replace />;
    }
    
    // Nếu đã setup xong mà vẫn cố vào trang setup, đá về trang chủ
    if (user && user.store?.isSetupCompleted && location.pathname === '/setup-store') {
        console.log('--> Decision: Navigate to /');
        return <Navigate to="/" replace />;
    }

    console.log('--> Decision: Render children');
    // Nếu mọi thứ ổn, cho phép truy cập
    return children;
};

export default ProtectedRoute;