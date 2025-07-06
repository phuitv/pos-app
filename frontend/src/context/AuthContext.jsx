import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Tạo Context
const AuthContext = createContext();

// Tạo Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true); // Thêm state loading để xử lý lúc đầu

    useEffect(() => {
        const loadUser = async () => {
        // Mỗi khi token thay đổi (lúc đăng nhập/đăng xuất)
            if (token) {
                // Lưu token vào localStorage và đặt header mặc định cho Axios
                localStorage.setItem('token', token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                try {
                    // GỌI API MỚI ĐỂ LẤY THÔNG TIN USER
                    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`);
                    setUser(res.data.data); // Lưu thông tin user vào state
                    setIsAuthenticated(true);
                } catch (err) {
                    // Nếu token không hợp lệ (hết hạn, sai...), xóa nó đi
                    console.error("Token không hợp lệ, đang đăng xuất.");
                    setToken(null);
                    setUser(null);
                    setIsAuthenticated(false);
                    localStorage.removeItem('token');
                    delete axios.defaults.headers.common['Authorization'];
                }
            } else {
                // Nếu không có token, xóa khỏi localStorage và header
                localStorage.removeItem('token');
                delete axios.defaults.headers.common['Authorization'];
                setUser(null);
                setIsAuthenticated(false);
            }
            setLoading(false); // Đánh dấu đã kiểm tra xong
        };
        
        loadUser();
    }, [token]);

    const login = async (username, password) => {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { username, password });
        setToken(res.data.token); // Cập nhật state token, useEffect sẽ tự chạy
    };

    const logout = () => {
        setToken(null); // Cập nhật state token thành null, useEffect sẽ tự chạy
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated,
            loading,
            login,
            logout
        }}>
            {/* Chỉ render children khi đã kiểm tra xác thực xong */}
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;