const CustomerForm = ({ data, setData, onSave, onUpdate, customerType }) => {
    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (customerType === 'retail') {
            onSave(data);
        } else {
            onUpdate(data);
        }
    }

    return (
        <Paper component="form" onSubmit={handleSubmit} variant="outlined" sx={{ p: 2, mb: 2 }}>
            <TextField name="name" label="Họ tên khách hàng" value={data.name} onChange={handleChange} required fullWidth margin="normal" size="small" />
            <TextField name="phone" label="Số điện thoại" value={data.phone} onChange={handleChange} required fullWidth margin="normal" size="small" />
            <TextField name="address" label="Địa chỉ" value={data.address} onChange={handleChange} fullWidth margin="normal" size="small" />
            <Button type="submit" variant="contained" size="small">
                {customerType === 'retail' ? 'Tạo mới & Gán' : 'Cập nhật & Gán'}
            </Button>
        </Paper>
    );
};