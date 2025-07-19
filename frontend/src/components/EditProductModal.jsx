import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
// Import các component cần thiết của MUI
import { Modal, Box, Typography, TextField, Button, FormControlLabel, Switch, 
    Autocomplete, List, ListItem, ListItemText, IconButton, Divider 
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import AuthContext from '../context/AuthContext'; // Import AuthContext

// Style cho Box bên trong Modal
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const EditProductModal = ({ product, onClose, onProductUpdated }) => {
    const { user } = useContext(AuthContext); // Lấy thông tin user (chứa store)

    // State để lưu dữ liệu của form, khởi tạo với dữ liệu sản phẩm đang sửa
    const [formData, setFormData] = useState({
        name: '', sku: '', price: '', costPrice: '', 
        trackQuantity: true, quantity: ''
    });
    const [loading, setLoading] = useState(false); // state loading

    // --- STATE CHO CÔNG THỨC ---
    const [ingredients, setIngredients] = useState([]);
    const [recipeItems, setRecipeItems] = useState([]);
    const [selectedIngredient, setSelectedIngredient] = useState(null);
    const [ingredientAmount, setIngredientAmount] = useState('1');

    const shouldTrackQuantity = user?.store?.businessType === 'retail';

    // useEffect sẽ chạy mỗi khi prop 'product' thay đổi để cập nhật form với dữ liệu mới
    useEffect(() => {
        // Điền dữ liệu sản phẩm vào form khi modal được mở
        if (product) {
            setFormData({
                name: product.name || '',
                sku: product.sku || '',
                price: product.price || '',
                costPrice: product.costPrice || 0,
                trackQuantity: product.trackQuantity,
                quantity: product.quantity || 0
            });
            // Điền dữ liệu công thức đã có (nếu có)
            setRecipeItems(product.recipe || []);
        }

        // Luôn fetch danh sách nguyên vật liệu nếu là cửa hàng dịch vụ
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
    }, [product, shouldTrackQuantity]); // Chạy lại khi sản phẩm được chọn thay đổi

    // Nếu không có sản phẩm nào được truyền vào (tức là không ở chế độ sửa)
    // thì không render gì cả
    if (!product) return null;

    // === CÁC HÀM XỬ LÝ ===
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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

    // Hàm cho nút Cập nhật
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const recipeForApi = recipeItems.map(item => ({
            // Đảm bảo chỉ gửi ID nếu `item.ingredient` là object đầy đủ
            ingredient: item.ingredient._id || item.ingredient,
            amount: item.amount
        }));

        const updatedData = {
            name: formData.name,
            sku: formData.sku,
            price: Number(formData.price),
            trackQuantity: formData.trackQuantity,
            recipe: recipeForApi,
            ...(shouldTrackQuantity && {
                costPrice: Number(formData.costPrice),
                quantity: Number(formData.quantity)
            }),
        };

        try {
            const res = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/products/${product._id}`,
                updatedData
            );
            onProductUpdated(res.data.data); // Báo cho component cha biết đã cập nhật xong
            onClose(); // Đóng modal
            alert('Cập nhật thành công!');
        } catch (error) {
            console.error('Lỗi khi cập nhật sản phẩm', error);
            alert('Có lỗi xảy ra khi cập nhật.');
        } finally {
            setLoading(false);
        }
    };

    return (
        // Sử dụng component Modal của MUI
        <Modal
            open={Boolean(product)} // Modal sẽ mở khi prop 'product' có giá trị (truthy)
            onClose={onClose}
            aria-labelledby="modal-title"
        >
            <Box sx={style}>
                <Typography id="modal-title" variant="h6" component="h2">
                    Sửa sản phẩm
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, maxHeight: '80vh', overflowY: 'auto' }}>
                    <TextField name="name" label="Tên sản phẩm" value={formData.name} onChange={handleChange} fullWidth required margin="normal" />
                    <TextField name="sku" label="Mã SKU" value={formData.sku} onChange={handleChange} fullWidth margin="normal" />
                    <TextField name="price" label="Giá bán" type="number" value={formData.price} onChange={handleChange} fullWidth required margin="normal" />
                    
                    {/* --- GIAO DIỆN CÓ ĐIỀU KIỆN --- */}
                    {shouldTrackQuantity ? (
                        // Giao diện cho BÁN LẺ
                        <>
                            <FormControlLabel control={<Switch checked={formData.trackQuantity} onChange={(e) => setFormData({...formData, trackQuantity: e.target.checked})} name="trackQuantity"/>} 
                                label="Quản lý tồn kho" 
                            />
                            {formData.trackQuantity && (
                                <TextField 
                                    name="quantity" 
                                    label="Số lượng *" 
                                    type="number" 
                                    value={formData.quantity} onChange={handleChange} fullWidth 
                                    required={formData.trackQuantity} margin="normal" 
                                />
                            )}
                            <TextField 
                                name="costPrice" 
                                label="Giá nhập *" 
                                type="number" 
                                value={formData.costPrice} onChange={handleChange} fullWidth required 
                                margin="normal" 
                            />
                        </>
                    ) : (
                        // Giao diện cho DỊCH VỤ / ĂN UỐNG
                        <Box sx={{ mt: 2, p: 2, border: '1px dashed grey', borderRadius: 1 }}>
                            <Typography variant="subtitle1" gutterBottom>Công thức</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                <Autocomplete
                                    options={ingredients}
                                    value={selectedIngredient}
                                    onChange={(e, newValue) => setSelectedIngredient(newValue)}
                                    getOptionLabel={(option) => `${option.name} (${option.unit})`}
                                    sx={{ flexGrow: 1 }}
                                    renderInput={
                                        (params) => <TextField {...params} label="Chọn nguyên vật liệu" size="small" />
                                    }
                                />
                                <TextField label="SL" type="number" value={ingredientAmount} onChange={(e) => setIngredientAmount(e.target.value)} sx={{ width: '80px' }} size="small" />
                                <IconButton color="primary" onClick={handleAddRecipeItem}><AddCircleOutlineIcon /></IconButton>
                            </Box>
                            <List dense>
                                {recipeItems.map(item => (
                                    <ListItem
                                        key={item.ingredient._id || item.ingredient}
                                        secondaryAction={
                                            <IconButton edge="end" size="small" onClick={() => handleRemoveRecipeItem(item.ingredient._id || item.ingredient)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemText 
                                            // Cần tìm tên NVL từ danh sách ingredients
                                            primary={ingredients.find(i => i._id === (item.ingredient._id || item.ingredient))?.name || 'Loading...'}
                                            secondary={`${item.amount} ${ingredients.find(i => i._id === (item.ingredient._id || item.ingredient))?.unit}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button onClick={onClose}>Hủy</Button>
                        <Button type="submit" variant="contained" sx={{ ml: 1 }}>
                            Lưu thay đổi
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
};

export default EditProductModal;