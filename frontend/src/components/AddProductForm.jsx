import React, { useState, useEffect , useContext } from 'react';
import axios from 'axios';
import { TextField, Button, Box, Paper, Typography, CircularProgress,
    FormControlLabel, Switch, Autocomplete, Chip, List, ListItem, ListItemText, IconButton,
    Divider
 } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import AuthContext from '../context/AuthContext'; // Import context

const AddProductForm = ({ onProductAdded, onCancel }) => {
    const { user } = useContext(AuthContext); // Lấy thông tin user (chứa store)
    
    const [formData, setFormData] = useState({
        name: '', sku: '', costPrice: '', price: '',
        // Giá trị mặc định của trackQuantity giờ phụ thuộc vào loại hình kinh doanh
        trackQuantity: user?.store?.businessType === 'retail',
        quantity: ''
    });
    const [loading, setLoading] = useState(false);

    const [ingredients, setIngredients] = useState([]); // Danh sách NVL để chọn
    const [recipeItems, setRecipeItems] = useState([]); // Công thức đang xây dựng
    const [selectedIngredient, setSelectedIngredient] = useState(null); // NVL đang được chọn trong Autocomplete
    const [ingredientAmount, setIngredientAmount] = useState(1);    // Số lượng NVL đang nhập

    // Xác định xem có nên quản lý tồn kho không
    const shouldTrackQuantity = user?.store?.businessType === 'retail';

    // Fetch danh sách nguyên vật liệu khi component được tải
    useEffect(() => {
        // Chỉ fetch NVL nếu là cửa hàng dịch vụ
        if (!shouldTrackQuantity) {
            const fetchIngredients = async () => {
                try {
                    const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/ingredients`);
                    setIngredients(data.data || []);
                } catch (error) {
                    console.error("Lỗi khi lấy danh sách nguyên vật liệu:", error);
                }
            };
            fetchIngredients();
        }
    }, [shouldTrackQuantity]);  // Chạy lại nếu loại hình kinh doanh thay đổi

    // === CÁC HÀM XỬ LÝ ===
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Hàm cho công thức tính NVL
    const handleAddRecipeItem = () => {
        if (!selectedIngredient || !ingredientAmount || Number(ingredientAmount) <= 0) {
            alert('Vui lòng chọn nguyên vật liệu và nhập số lượng hợp lệ.');
            return;
        }

        // Kiểm tra xem NVL đã có trong công thức chưa
        const existingItem = recipeItems.find(item => item.ingredient._id === selectedIngredient._id);
        if (existingItem) {
            alert('Nguyên vật liệu này đã có trong công thức.');
            return;
        }

        const newItem = {
            ingredient: selectedIngredient, // Lưu cả object để hiển thị tên, đơn vị...
            amount: Number(ingredientAmount)
        };
        setRecipeItems([...recipeItems, newItem]);
        
        // Reset các ô nhập liệu cho lần thêm tiếp theo
        setSelectedIngredient(null);
        setIngredientAmount('1');
    };

    const handleRemoveRecipeItem = (ingredientId) => {
        setRecipeItems(recipeItems.filter(item => item.ingredient._id !== ingredientId));
    };

    // Hàm nhấn nút submit form
    const handleSubmit = async (e) => {
        e.preventDefault(); // Ngăn chặn hành vi mặc định của form là tải lại trang
        setLoading(true);

        // Chuyển đổi công thức về dạng chỉ có ID trước khi gửi lên API
        const recipeForApi = recipeItems.map(item => ({
            ingredient: item.ingredient._id,
            amount: item.amount
        }));

        // Tạo đối tượng sản phẩm mới từ dữ liệu trong state
        const newProduct = {
            name: formData.name,
            sku: formData.sku,
            price: Number(formData.price), // Chuyển giá trị price sang kiểu Number
            // Chỉ gửi costPrice và quantity nếu là sản phẩm bán lẻ
            ...(shouldTrackQuantity && {
                costPrice: Number(formData.costPrice),
                quantity: Number(formData.quantity)
            }),
            trackQuantity: formData.trackQuantity,
            recipe: recipeForApi
        };

        try {
            // Gửi yêu cầu POST đến API backend để tạo sản phẩm
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/products`, newProduct
            );

            // Gọi hàm onProductAdded được truyền từ component cha (ProductManagementPage)
            // để thông báo rằng một sản phẩm mới đã được thêm.
            // và truyền dữ liệu sản phẩm mới nhận được từ API.
            onProductAdded(response.data.data);

            // 2. XÓA TRỐNG FORM để sẵn sàng cho lần nhập tiếp theo
            setFormData({
                name: '', sku: '', costPrice: '', price: '', quantity: '',
                trackQuantity: shouldTrackQuantity
            });
            setRecipeItems([]);

        } catch (error) {
            console.error('Lỗi khi thêm sản phẩm:', error);
            // Hiển thị một thông báo lỗi cụ thể hơn nếu có thể
            alert('Có lỗi xảy ra: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Thông tin sản phẩm</Typography>
            <Box component="form" onSubmit={handleSubmit}>
                <TextField name="name" label="Tên sản phẩm" value={formData.name} 
                    onChange={handleChange} fullWidth required margin="normal" />
                <TextField name="sku" label="Mã SKU (để trống sẽ tự tạo)" value={formData.sku} 
                    onChange={handleChange} fullWidth margin="normal" />
                <TextField name="costPrice" label="Giá nhập" type="number" value={formData.costPrice} 
                    onChange={handleChange} fullWidth required margin="normal" />
                <TextField name="price" label="Giá bán" type="number" value={formData.price} 
                    onChange={handleChange} fullWidth required margin="normal" />
                
                {/* --- GIAO DIỆN CÓ ĐIỀU KIỆN DỰA TRÊN LOẠI HÌNH KINH DOANH --- */}
                {shouldTrackQuantity ? (
                    // Giao diện cho cửa hàng BÁN LẺ
                    <>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.trackQuantity}
                                    onChange={handleChange}
                                    name="trackQuantity"
                                />
                            }
                            label="Quản lý tồn kho"
                            sx={{ mt: 1, display: 'block' }}
                        />
                        {formData.trackQuantity && (
                            <TextField name="quantity" label="Số lượng *" type="number" 
                                value={formData.quantity} onChange={handleChange} fullWidth 
                                required={formData.trackQuantity} margin="normal" 
                            />
                        )}
                        <TextField name="costPrice" label="Giá nhập *" type="number" 
                            value={formData.costPrice} onChange={handleChange} fullWidth 
                            required margin="normal" 
                        />
                    </>
                ) : (
                    // Giao diện cho cửa hàng DỊCH VỤ / ĂN UỐNG
                    <Box sx={{ mt: 2, p: 2, border: '1px dashed grey', borderRadius: 1 }}>
                        <Typography variant="subtitle1" gutterBottom>Xây dựng Công thức</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Autocomplete
                                options={ingredients}
                                value={selectedIngredient}
                                onChange={(e, newValue) => setSelectedIngredient(newValue)}
                                getOptionLabel={(option) => `${option.name} (${option.unit})`}
                                sx={{ flexGrow: 1 }}
                                renderInput={(params) => <TextField {...params} label="Chọn nguyên vật liệu" size="small" />}
                            />
                            <TextField 
                                label="SL" 
                                type="number" 
                                value={ingredientAmount}
                                onChange={(e) => setIngredientAmount(e.target.value)}
                                sx={{ width: '80px' }}
                                size="small"
                            />
                            <IconButton color="primary" onClick={handleAddRecipeItem} title="Thêm vào công thức">
                                <AddCircleOutlineIcon />
                            </IconButton>
                        </Box>
                        <List dense>
                            {recipeItems.map(item => (
                                <ListItem
                                    key={item.ingredient._id}
                                    secondaryAction={
                                        <IconButton edge="end" size="small" onClick={() => handleRemoveRecipeItem(item.ingredient._id)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    }
                                >
                                    <ListItemText 
                                        primary={item.ingredient.name}
                                        secondary={`${item.amount} ${item.ingredient.unit}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                        {recipeItems.length > 0 && <Divider />}
                    </Box>
                )}

                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Lưu sản phẩm'}
                    </Button>
                    {onCancel && <Button variant="outlined" onClick={onCancel}>Hủy</Button>}
                </Box>
            </Box>
        </Paper>
    );
};

export default AddProductForm;