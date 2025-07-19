import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext'; // Import AuthContext
import axios from 'axios';

// 1. IMPORT CÁC COMPONENT TỪ MUI
import { 
    Container, Typography, Box, Button,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, IconButton, Snackbar, Alert,
    useTheme, // Hook để truy cập theme mặc định của MUI
    useMediaQuery, // Hook để kiểm tra breakpoint
    Card, CardContent, CardActions, // Component để xây dựng giao diện mobile
    Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete'; // Icon cho nút xóa
import EditIcon from '@mui/icons-material/Edit';   // Icon cho nút sửa

import AddProductForm from '../components/AddProductForm';
import EditProductModal from '../components/EditProductModal';

const ProductManagementPage = () => {
    const { user } = useContext(AuthContext); // Lấy user từ context
    const [products, setProducts] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false); // State để ẩn/hiện form thêm mới
    
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
                setProducts(response.data.data);
            } catch (error) {
                console.error("Có lỗi xảy ra khi lấy dữ liệu sản phẩm!", error);
            }
        };
        fetchProducts();
    }, []);

    const handleProductAdded = (newProduct) => {
        // 1. Cập nhật bảng danh sách
        setProducts(prevProducts => [newProduct, ...prevProducts]);
        // 2. Hiển thị thông báo
        setNotification({ open: true, message: 'Thêm sản phẩm thành công!', severity: 'success' });
    };

    const handleProductUpdated = (updatedProduct) => {
        setProducts(products.map(p => (p._id === updatedProduct._id ? updatedProduct : p)));
    };

    const handleDelete = async (productId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/api/products/${productId}`);
                setProducts(products.filter(p => p._id !== productId));
            } catch (error) {
                console.error('Lỗi khi xóa sản phẩm:', error);
                alert('Có lỗi xảy ra khi xóa sản phẩm.');
            }
        }
    };

    // --- HÀM KIỂM TRA MÀN HÌNH ---
    const theme = useTheme();
    // isMobile sẽ là true nếu chiều rộng màn hình nhỏ hơn breakpoint 'sm' (small)
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        // Container giúp căn giữa và giới hạn chiều rộng nội dung
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}> 
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                {/* Typography là component để hiển thị text, tương tự h1, p... */}
                <Typography variant="h4" component="h1">
                    Quản lý Sản phẩm
                </Typography>
                {/* NÚT THÊM SẢN PHẨM chỉ hiển thị khi đúng điều kiện */}
                {user && user.role === 'admin' && (
                    <Button variant="contained" onClick={() => setShowAddForm(!showAddForm)}>
                        {showAddForm ? 'Hủy' : 'Thêm sản phẩm mới'}
                    </Button>
                )}
            </Box>

            {/* Chỉ hiển thị form nếu nút được bấm VÀ user là admin */}
            {user && user.role === 'admin' && showAddForm && <AddProductForm onProductAdded={handleProductAdded} />}

            <EditProductModal 
                product={editingProduct} 
                onClose={() => setEditingProduct(null)}
                onProductUpdated={handleProductUpdated}
            />

            {isMobile ? (
                // --- GIAO DIỆN CHO MOBILE ---
                <Box>
                    {products.map((product) => (
                        <Card key={product._id} sx={{ mb: 2 }}>
                            <CardContent>
                                <Typography variant="h6" component="div">
                                    {product.name}
                                </Typography>
                                <Typography color="text.secondary" gutterBottom>
                                    SKU: {product.sku || 'N/A'}
                                </Typography>
                                <Divider sx={{ my: 1 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                    <Typography>Giá nhập:</Typography>
                                    <Typography sx={{ fontWeight: 'bold' }}>{new Intl.NumberFormat('vi-VN').format(product.costPrice || 0)} ₫</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography>Giá bán:</Typography>
                                    <Typography sx={{ fontWeight: 'bold' }}>{new Intl.NumberFormat('vi-VN').format(product.price)} ₫</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography>Tồn kho:</Typography>
                                    <Typography sx={{ fontWeight: 'bold' }}>
                                        {product.trackQuantity ? product.quantity : 'N/A'}
                                    </Typography>
                                </Box>
                            </CardContent>
                            {user && user.role === 'admin' && (
                                <CardActions sx={{ justifyContent: 'flex-end' }}>
                                    <IconButton color="primary" onClick={() => setEditingProduct(product)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(product._id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </CardActions>
                            )}
                        </Card>
                    ))}
                </Box>
            ) : (
                // --- GIAO DIỆN CHO DESKTOP ---
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell>Tên sản phẩm</TableCell>
                                <TableCell>Mã SKU</TableCell>
                                <TableCell align="right">Giá nhập</TableCell>
                                <TableCell align="right">Giá bán</TableCell>
                                <TableCell align="right">Số lượng tồn</TableCell>
                                {/* ĐIỀU KIỆN để CỘT HÀNH ĐỘNG hiển thị */}
                                {user && user.role === 'admin' && (
                                    <TableCell align="center">Hành động</TableCell>
                                )}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product._id} hover>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>{product.sku}</TableCell>
                                    <TableCell align="right">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.costPrice || 0)}
                                    </TableCell>
                                    <TableCell align="right">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                    </TableCell>
                                    <TableCell align="right">
                                        {/* Nếu có theo dõi, hiển thị số lượng. Nếu không, hiển thị 'N/A' */}
                                        {product.trackQuantity ? product.quantity : 'N/A'}
                                    </TableCell>
                                    {/* ĐIỀU KIỆN để CÁC NÚT SỬA/XÓA hiển thị */}
                                    {user && user.role === 'admin' && (
                                        <TableCell align="center">
                                            {/* IconButton là nút chỉ có icon, rất gọn */}
                                            <IconButton color="primary" onClick={() => setEditingProduct(product)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton color="error" onClick={() => handleDelete(product._id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
};

export default ProductManagementPage;