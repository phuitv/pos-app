import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useContext(AuthContext);
    const location = useLocation();

    if (!isAuthenticated) {
        // Nếu chưa đăng nhập, chuyển hướng về trang login
        // `state={{ from: location }}` để lưu lại trang người dùng đang cố truy cập
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Nếu đã đăng nhập, cho phép render component con (children)
    return children;
};

export default ProtectedRoute;