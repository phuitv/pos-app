import React, { useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthContext from './context/AuthContext';

// Component bọc các Routes
const RouteGuard = ({ children }) => {
    const { isAuthenticated, user } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate(); // Dùng hook navigate để ra lệnh chuyển hướng

    // --- SỬ DỤNG useEffect ĐỂ XỬ LÝ CHUYỂN HƯỚNG ---
    useEffect(() => {
        // Danh sách các route yêu cầu đăng nhập
        const protectedPaths = ['/', '/products', '/orders', '/users', '/settings', '/setup-store'];

        // 1. Nếu chưa đăng nhập nhưng cố vào trang được bảo vệ
        if (!isAuthenticated && protectedPaths.includes(location.pathname)) {
            navigate('/login', { state: { from: location }, replace: true });
            return; // Dừng thực thi sớm
        }

        // 2. Nếu đã đăng nhập
        if (isAuthenticated && user) {
            // 2a. Chưa setup xong -> bắt vào trang setup
            if (!user.store?.isSetupCompleted && location.pathname !== '/setup-store') {
                navigate('/setup-store', { replace: true });
                return;
            }
            
            // 2b. Đã setup xong nhưng vẫn ở trang setup -> đá ra trang chủ
            if (user.store?.isSetupCompleted && location.pathname === '/setup-store') {
                navigate('/', { replace: true });
                return;
            }
            
            // 2c. Đã đăng nhập nhưng cố vào trang login -> đá ra trang chủ
            if (location.pathname === '/login') {
                navigate('/', { replace: true });
                return;
            }
        }
    // Dependency array: Chạy lại logic này mỗi khi user, isAuthenticated hoặc location thay đổi
    }, [isAuthenticated, user, location, navigate]);

    // Nếu mọi điều kiện đều qua, render các routes bình thường
    return children;
};

export default RouteGuard;