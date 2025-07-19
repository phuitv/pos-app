import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Tạo Context
const AuthContext = createContext();

// Tạo Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Mỗi khi token thay đổi (lúc đăng nhập/đăng xuất)
    const loadUser = async () => {
        console.log('--- AUTH CONTEXT: loadUser() started. ---'); // LOG 3
        const token = localStorage.getItem('token');
        if (token) {
            // Đặt header mặc định cho Axios
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            try {
                // GỌI API MỚI ĐỂ LẤY THÔNG TIN USER
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`);
                console.log('--- AUTH CONTEXT: API /me returned user. isSetupCompleted:', res.data.data.store.isSetupCompleted); // LOG 4
                setUser(res.data.data); // Lưu thông tin user vào state
                setIsAuthenticated(true);
            } catch (err) {
                delete axios.defaults.headers.common['Authorization'];
                setUser(null);
                setIsAuthenticated(false);
                localStorage.removeItem('token');
            }
        } else {
            // Đảm bảo trạng thái được dọn dẹp nếu không có token
             setUser(null);
             setIsAuthenticated(false);
        }
        setLoading(false); // Đánh dấu đã kiểm tra xong
    };
    
    useEffect(() => { loadUser(); }, []); // Chỉ chạy 1 lần khi tải app

    const login = async (username, password) => {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { username, password });
        localStorage.setItem('token', res.data.token);  // Lưu token mới vào localStorage
        await loadUser(); // Gọi lại loadUser để cập nhật mọi thứ
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setIsAuthenticated(false);
    };

    const updateUserAfterSetup = (updatedStore) => {
        // Cập nhật lại state 'user' bằng cách giữ lại thông tin user cũ
        // và chỉ ghi đè lại phần 'store'
        console.log("--- AUTH CONTEXT: updateUserAfterSetup called with:", updatedStore);
        setUser(prevUser => {
            const newUser = {
                ...prevUser,
                store: updatedStore,
            };
            console.log("--- AUTH CONTEXT: New user state will be:", newUser);
            return newUser;
        });
    };

    const value = { user, isAuthenticated, loading, login, logout, loadUser, updateUserAfterSetup };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;