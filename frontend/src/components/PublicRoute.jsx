import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const PublicRoute = ({ children }) => {
    const { isAuthenticated } = useContext(AuthContext);

    if (isAuthenticated) {
        // Nếu người dùng đã đăng nhập, chuyển hướng họ về trang chủ.
        // Không cho phép họ ở lại trang đăng nhập.
        return <Navigate to="/" replace />;
    }

    // Nếu chưa đăng nhập, cho phép họ xem component con (chính là trang LoginPage).
    return children;
};

export default PublicRoute;