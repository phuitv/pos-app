import React, { useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import AuthContext, { AuthProvider } from './context/AuthContext';
import RouteGuard from './RouteGuard';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import PosPage from './pages/PosPage';
import ProductManagementPage from './pages/ProductManagementPage';
import UserManagementPage from './pages/UserManagementPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import LoginPage from './pages/LoginPage';
import StoreSettingsPage from './pages/StoreSettingsPage';
import PrintOrderPage from './pages/PrintOrderPage';
import SetupStorePage from './pages/SetupStorePage';
import IngredientManagementPage from './pages/IngredientManagementPage';
import { Toolbar, Snackbar, Alert, Box, CircularProgress } from '@mui/material';

// Component con này sẽ xử lý việc hiển thị nội dung
const AppContent = () => {
    const { isAuthenticated, user, loading } = useContext(AuthContext);
    const location = useLocation();
    
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    // 1. Giai đoạn loading ban đầu
    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
    }

    // 2. Logic chuyển hướng cho người chưa đăng nhập
    if (!isAuthenticated) {
        // Chỉ cho phép truy cập trang login
        return (
            <Routes>
                <Route path="/login" element={<LoginPage setNotification={setNotification} />} />
                {/* Bất kỳ đường dẫn nào khác sẽ bị đá về login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        );
    }
    
    // 3. Logic chuyển hướng cho người đã đăng nhập
    if (isAuthenticated && user) {
        // 3a. Chưa setup xong -> Chỉ cho phép vào trang setup
        if (!user.store?.isSetupCompleted) {
            return (
                <Routes>
                    <Route path="/setup-store" element={<SetupStorePage setNotification={setNotification} />} />
                    {/* Bất kỳ đường dẫn nào khác sẽ bị đá về setup */}
                    <Route path="*" element={<Navigate to="/setup-store" replace />} />
                </Routes>
            );
        }
    }

    // 4. Nếu đã đăng nhập và đã setup xong -> Hiển thị ứng dụng đầy đủ
    return (
        <>
            <LocationAwareNavbar />
            <main>
                <Toolbar />
                <Routes>
                    <Route path="/" element={<PosPage setNotification={setNotification} />} />
                    <Route path="/products" element={<ProductManagementPage setNotification={setNotification} />} />
                    <Route path="/orders" element={<OrderHistoryPage setNotification={setNotification} />} />
                    <Route path="/users" element={<UserManagementPage setNotification={setNotification} />} />
                    <Route path="/ingredients" element={<IngredientManagementPage setNotification={setNotification} />} />
                    <Route path="/settings" element={<StoreSettingsPage setNotification={setNotification} />} />
                    <Route path="/print/order" element={<PrintOrderPage />} />
                    {/* Nếu đã đăng nhập và vào /login hoặc /setup, đá về trang chủ */}
                    <Route path="/login" element={<Navigate to="/" replace />} />
                    <Route path="/setup-store" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
            <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({ ...notification, open: false })}>
                <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity} sx={{ width: '100%' }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </>
    );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

const LocationAwareNavbar = () => {
    const location = useLocation();
    // Nếu URL là /print/order, không render Navbar
    if (location.pathname === '/print/order') {
        return null;
    }
    return <Navbar />;
};


export default App;