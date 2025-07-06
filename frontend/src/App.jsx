import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PosPage from './pages/PosPage';
import ProductManagementPage from './pages/ProductManagementPage';
import UserManagementPage from './pages/UserManagementPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public Route - được bảo vệ bởi PublicRoute */}
          <Route path="/login" element={
            // Bọc LoginPage trong PublicRoute
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />

          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <PosPage />
            </ProtectedRoute>
          } />
          <Route path="/products" element={
            <ProtectedRoute>
              <ProductManagementPage />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <OrderHistoryPage />
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute>
              <UserManagementPage />
            </ProtectedRoute>
          } />
          
          {/* Có thể thêm route 404 ở đây */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App