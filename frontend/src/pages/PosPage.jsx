import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Grid, Typography, Paper, List, ListItem, ListItemText, TextField, Divider, 
    Button, Box, IconButton, Autocomplete, ToggleButton, ToggleButtonGroup, Snackbar, Alert, 
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

// Chuyển đổi chuỗi để tìm kiếm
const normalizeString = (str) => {
    if (!str) return '';
    return str
        .toLowerCase() // 1. Chuyển về chữ thường
        .normalize("NFD") // 2. Chuẩn hóa Unicode để tách dấu ra khỏi chữ cái
        .replace(/[\u0300-\u036f]/g, "") // 3. Xóa các ký tự dấu
        .replace(/đ/g, "d"); // 4. Thay thế 'đ' thành 'd'
};

const PosPage = ({ setNotification }) => {
    // === KHAI BÁO STATE ===
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]); // State để lưu giỏ hàng
    const [loading, setLoading] = useState(false);  // state để xử lý trạng thái loading khi đang thanh toán
    const [paymentMethod, setPaymentMethod] = useState('paid'); // Mặc định là 'paid'
    const [customerType, setCustomerType] = useState('retail'); // 'retail' hoặc 'regular'
    const [customers, setCustomers] = useState([]);
    const navigate = useNavigate(); // Khởi tạo hook navigate
    const [openPrintDialog, setOpenPrintDialog] = useState(false);
    const [lastOrder, setLastOrder] = useState(null);
    const [storeInfo, setStoreInfo] = useState(null);
    // State này sẽ giữ thông tin khách hàng cho cả việc tạo mới và cập nhật
    const [customerFormData, setCustomerFormData] = useState({
        _id: null,
        name: '',
        phone: '',
        address: ''
    });
    const [autocompleteKey, setAutocompleteKey] = useState(Date.now());
    
    // === CÁC HÀM FETCH DỮ LIỆU ===
    // Lấy danh sách sản phẩm từ API khi component được tải
    const fetchProducts = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
            setProducts(data.data || []);
        } catch (error) {
            console.error("Không thể lấy danh sách sản phẩm:", error);
            setProducts([]); // Đảm bảo luôn là mảng nếu có lỗi
        }
    };

    // Lấy danh sách khách hàng
    const fetchCustomers = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/customers`);
            setCustomers(data.data || []);
        } catch (error) {
            console.error("Không thể lấy danh sách khách hàng:", error);
            setCustomers([]); // Đảm bảo luôn là mảng nếu có lỗi
        }
    };

    // === CÁC USEEFFECT ===
    // Tải tất cả dữ liệu cần thiết khi component được mount lần đầu
    useEffect(() => {
        fetchProducts();
        fetchCustomers();
    }, []);

    useEffect(() => {
        const fetchStoreInfo = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/stores/my`);
                setStoreInfo(data.data);
            } catch (error) {
                console.error("Không thể lấy thông tin cửa hàng", error);
            }
        };
        fetchStoreInfo();
    }, []);

    // === CÁC HÀM XỬ LÝ SỰ KIỆN (HANDLERS) ===
    // Hàm reset form
    const resetCustomerForm = () => {
        setCustomerFormData({ _id: null, name: '', phone: '', address: '' });
        // Reset Autocomplete để nó xóa giá trị hiển thị
        setAutocompleteKey(Date.now());
    };

    const handleCustomerTypeChange = (event, newType) => {
        if (newType !== null) {
            setCustomerType(newType);
            // Nếu chuyển về khách lẻ, reset form
            if (newType === 'retail') {
                resetCustomerForm();
            }
        }
    };

    // Hàm xử lý khi nhấn nút "Tạo mới" hoặc "Cập nhật"
    const handleSaveCustomer = async () => {
        // Các logic
        const isUpdating = !!customerFormData._id;
        const url = isUpdating
            ? `${import.meta.env.VITE_API_URL}/api/customers/${customerFormData._id}`
            : `${import.meta.env.VITE_API_URL}/api/customers`;
        const method = isUpdating ? 'put' : 'post';
        
        try {
            const { data } = await axios[method](url, customerFormData);
            const savedCustomer = data.data;
            
            setNotification({ open: true, message: 'Thao tác với khách hàng thành công!', severity: 'success' });

            // --- LOGIC CẬP NHẬT STATE THỦ CÔNG ---
            // if (isUpdating) {
            //     setCustomers(prev => prev.map(c => c._id === savedCustomer._id ? savedCustomer : c));
            // } else {
            //     setCustomers(prev => [savedCustomer, ...prev]);
            // }

            await fetchCustomers();

            setCustomerFormData(savedCustomer);
            setAutocompleteKey(Date.now());
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message;
            setNotification({ open: true, message: `Lỗi: ${errorMessage}`, severity: 'error' });
        }
    };

    // Hàm thêm sp vào giỏ hàng
    const addProductToCart = (product) => {
        const existingProduct = cart.find(item => item._id === product._id);    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa

        if (existingProduct) {
            // Nếu đã có, chỉ tăng số lượng
            setCart(cart.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            // Nếu chưa có, thêm sản phẩm mới vào giỏ hàng với số lượng là 1
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    // Hàm cập nhật giỏ hàng
    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            // Nếu số lượng <= 0, xóa sản phẩm khỏi giỏ hàng
            setCart(cart.filter(item => item._id !== productId));
        } else {
            setCart(cart.map(item => item._id === productId ? { ...item, quantity: newQuantity } : item));
        }
    };

    // Hàm xoá sp khỏi giỏ hàng
    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item._id !== productId));
    };

    // Hàm đảm bảo người dùng không thể bỏ chọn cả hai nút
    const handlePaymentMethodChange = (event, newMethod) => {
        if (newMethod !== null) {
            setPaymentMethod(newMethod);
        }
    };

    // Hàm nhấn nút "Thanh toán"
    const handlePayment = async () => {
        if (cart.length === 0) return;

        setLoading(true); // Bắt đầu loading

        // Chuẩn bị dữ liệu để gửi lên API
        const orderData = {
            orderItems: cart.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                product: item._id // chỉ cần gửi ID của sản phẩm
            })),
            totalAmount: cart.reduce((total, item) => total + item.price * item.quantity, 0),
            paymentStatus: paymentMethod, // Gửi trạng thái thanh toán hiện tại
            customerId: customerFormData._id || null,   // Gửi ID từ form (nếu có sẽ là ID, nếu không là null)
        };

        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/orders`, orderData);
            setNotification({ open: true, message: 'Tạo đơn hàng thành công!', severity: 'success' });
            
            // Lưu lại đơn hàng vừa tạo và mở dialog
            setLastOrder(data.data);
            setOpenPrintDialog(true);
            
            setCart([]); // Xóa giỏ hàng sau khi thành công
            setPaymentMethod('paid'); // Reset phương thức thanh toán
            setCustomerType('retail'); // Reset về khách lẻ
            resetCustomerForm(); // Reset form sau khi thanh toán
        } catch (error) {
            const errorMessage = error.response?.data?.error || "Không thể kết nối tới server";
            setNotification({ open: true, message: `Lỗi: ${errorMessage}`, severity: 'error' });
        } finally {
            setLoading(false); // Kết thúc loading dù thành công hay thất bại
        }
    };

    // === PHẦN RENDER JSX ===
    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>    {/* spacing={3} tạo khoảng cách giữa các cột */}
                
                {/* Cột Trái: Danh sách sản phẩm */}
                <Grid item xs={12} md={7}>  {/* xs={12} nghĩa là trên màn hình rất nhỏ (extra small), nó chiếm 12/12 cột (toàn bộ chiều rộng). md={7} nghĩa là trên màn hình trung bình (medium) trở lên, nó chiếm 7/12 cột. Đây chính là cách làm responsive của MUI */}
                    <Paper sx={{ p: 2, width: '100%' }}>
                        <Typography variant="h6" gutterBottom>Tìm kiếm sản phẩm</Typography>

                        <Autocomplete
                            key={cart.length}
                            options={products} // Cung cấp mảng dữ liệu để tìm kiếm
                            getOptionLabel={(option) => `${option.name} - ${option.sku}`} // Hiển thị tên và SKU trong danh sách
                            
                            // Xử lý khi người dùng chọn một sản phẩm
                            onChange={(event, newValue) => { if (newValue) addProductToCart(newValue); }}

                            // Tuỳ chỉnh list sản phẩm trong ô tìm kiếm
                            renderOption={(props, option) => (
                                <li {...props} key={option._id}>
                                    <Box sx={{ width: '100%' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{option.name}</Typography>
                                            <Typography variant="body2" color="primary">{new Intl.NumberFormat('vi-VN').format(option.price)} ₫</Typography>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">SKU: {option.sku} | Tồn kho: {option.quantity}</Typography>
                                        <Divider sx={{ mt: 1 }} />
                                    </Box>
                                </li>
                            )}

                            // Định nghĩa ô input sẽ trông như thế nào
                            renderInput={(params) => (<TextField {...params} label="Gõ tên hoặc SKU để tìm" variant="outlined" />)}

                            // --- PROP tìm kiếm ko dấu ---
                            filterOptions={(options, state) => {
                                // Lấy inputValue từ state
                                const inputValue = state.inputValue;
                                const normalizedInputValue = normalizeString(inputValue);

                                // Hiển thị tất cả nếu chưa gõ gì
                                if (normalizedInputValue === '') return options;

                                return options.filter(option => {
                                    // Tạo một chuỗi để tìm kiếm (bao gồm tên và SKU)
                                    const searchableText = `${option.name} ${option.sku}`;
                                    const normalizedSearchableText = normalizeString(searchableText);

                                    // Trả về true nếu chuỗi đã chuẩn hóa chứa từ khóa đã chuẩn hóa
                                    return normalizedSearchableText.includes(normalizedInputValue);
                                });
                            }}
                            sx={{ mb: 2 }}
                        />
                    </Paper>
                </Grid>

                {/* Cột Phải: Hoá đơn */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 2, width: '100%' }}>
                        <Typography variant="h6" gutterBottom align='center'>Hóa đơn</Typography>

                        <ToggleButtonGroup
                            color="primary"
                            value={customerType}
                            exclusive
                            onChange={handleCustomerTypeChange}
                            fullWidth
                            sx={{ mb: 2 }}
                        >
                            <ToggleButton value="retail">Khách lẻ</ToggleButton>
                            <ToggleButton value="regular">Khách quen</ToggleButton>
                        </ToggleButtonGroup>

                        {/* ---- KHỐI CODE QUẢN LÝ KHÁCH HÀNG ---- */}
                        {/* Chỉ hiển thị khi chọn "Khách quen" */}
                        {customerType === 'regular' && (
                            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                                <Typography variant="subtitle1" gutterBottom>Thông tin khách hàng</Typography>
                                
                                <Autocomplete
                                    key={autocompleteKey}
                                    value={customerFormData._id ? customerFormData : null}
                                    options={customers}
                                    getOptionLabel={(option) => `${option.name} - ${option.phone}`}
                                    // So sánh các object để Autocomplete biết option nào đang được chọn
                                    isOptionEqualToValue={(option, value) => option._id === value._id}
                                    
                                    // Khi chọn một khách hàng, điền thông tin vào form
                                    onChange={(event, newValue) => {
                                        if (newValue) { setCustomerFormData(newValue); }
                                        else { resetCustomerForm(); }   // Nếu xóa lựa chọn, reset form
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Tìm hoặc thêm khách hàng" size="small" />}
                                    sx={{ mb: 2 }}
                                />

                                {/* Form nhập liệu */}
                                <TextField 
                                    label="Họ tên" 
                                    fullWidth margin="dense" size="small"
                                    value={customerFormData.name}
                                    onChange={(e) => setCustomerFormData({...customerFormData, name: e.target.value})}
                                />
                                <TextField 
                                    label="Số điện thoại" 
                                    fullWidth margin="dense" size="small"
                                    value={customerFormData.phone}
                                    onChange={(e) => setCustomerFormData({...customerFormData, phone: e.target.value})}
                                />
                                <TextField 
                                    label="Địa chỉ" 
                                    fullWidth margin="dense" size="small"
                                    value={customerFormData.address}
                                    onChange={(e) => setCustomerFormData({...customerFormData, address: e.target.value})}
                                />

                                {/* Nút Tạo mới / Cập nhật */}
                                <Button 
                                    variant="contained" 
                                    onClick={handleSaveCustomer}
                                    sx={{ mt: 1 }}
                                    // Vô hiệu hóa nút nếu chưa nhập tên hoặc sđt
                                    disabled={!customerFormData.name || !customerFormData.phone} 
                                >
                                    {/* Tên nút thay đổi dựa vào việc có _id hay không */}
                                    {customerFormData._id ? 'Cập nhật' : 'Tạo mới'}
                                </Button>
                            </Paper>
                        )}
                        {/* ---- HẾT KHỐI CODE QUẢN LÝ KH ---- */}

                        <List>
                            {cart.map((item) => (
                                <ListItem key={item._id} dense>
                                    <ListItemText
                                        primary={item.name}
                                        secondary={`${new Intl.NumberFormat('vi-VN').format(item.price)} ₫`}
                                    />
                                    <TextField
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => updateQuantity(item._id, parseInt(e.target.value, 10))}
                                        sx={{ width: '60px', mx: 2 }}
                                        slotProps={{ 
                                            input: { min: 1 }
                                        }}
                                    />
                                    <IconButton edge="end" aria-label="delete" onClick={() => removeFromCart(item._id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </ListItem>
                            ))}
                        </List>

                        {cart.length > 0 && <Divider sx={{ my: 2 }} />}

                        {/* ... phần tổng tiền ... */}
                        <Box sx={{ p: 2 }}>
                            <Typography variant="h5" align="right">
                                Tổng tiền: {new Intl.NumberFormat('vi-VN').format(cart.reduce((total, item) => total + item.price * item.quantity, 0))} ₫
                            </Typography>
                            <ToggleButtonGroup
                                color="primary"
                                value={paymentMethod}
                                exclusive // Đảm bảo chỉ chọn được 1 nút
                                onChange={handlePaymentMethodChange}
                                fullWidth
                                sx={{ mt: 2 }}
                            >
                                <ToggleButton value="paid">Đã thanh toán</ToggleButton>
                                <ToggleButton value="debt">Ghi nợ</ToggleButton>
                            </ToggleButtonGroup>
                            <Button
                                variant="contained"
                                fullWidth
                                sx={{ mt: 2 }}
                                disabled={cart.length === 0 || loading} // Vô hiệu hóa nút khi giỏ hàng rỗng hoặc đang loading
                                onClick={handlePayment} // Gọi hàm handlePayment
                            >
                                {loading ? 'Đang xử lý...' : 'Thanh toán'}
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* --- THÊM DIALOG --- */}
            <Dialog open={openPrintDialog} onClose={() => setOpenPrintDialog(false)}>
                <DialogTitle>Thanh toán thành công!</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bạn có muốn in hóa đơn cho đơn hàng này không?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPrintDialog(false)}>Không</Button>
                    <Button 
                        onClick={() => {
                            setOpenPrintDialog(false);
                            // Chuyển đến trang in và truyền dữ liệu qua state
                            navigate('/print/order', { state: { order: lastOrder, storeInfo: storeInfo } });
                        }} 
                        autoFocus
                    >
                        Có, In hóa đơn
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default PosPage;