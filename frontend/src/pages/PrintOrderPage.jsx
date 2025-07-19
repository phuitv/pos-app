import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Table, TableBody, TableCell, TableRow, Divider } from '@mui/material';

// Component này sẽ là giao diện của hóa đơn
const Invoice = React.forwardRef(({ order, storeInfo }, ref) => (
    <Box ref={ref} sx={{ p: 2, width: '300px', fontFamily: 'monospace' }}>
        {/* Thông tin cửa hàng */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{storeInfo?.name}</Typography>
            <Typography variant="caption">ĐC: {storeInfo?.address}</Typography><br/>
            <Typography variant="caption">ĐT: {storeInfo?.phone}</Typography>
        </Box>
        <Divider />
        
        {/* Thông tin hóa đơn */}
        <Typography variant="h5" sx={{ textAlign: 'center', my: 2 }}>HÓA ĐƠN BÁN HÀNG</Typography>
        <Typography variant="body2">Ngày: {new Date(order.createdAt).toLocaleString('vi-VN')}</Typography>
        <Typography variant="body2">Số HĐ: {order._id.slice(-6).toUpperCase()}</Typography>
        <Divider sx={{ my: 1 }} />
        
        {/* Chi tiết sản phẩm */}
        <Table size="small">
            <TableBody>
                {order.orderItems.map(item => (
                    <TableRow key={item._id}>
                        <TableCell sx={{ border: 0, p: 0.5 }}>
                            <Typography variant="body2">{item.name}</Typography>
                            <Typography variant="caption">{item.quantity} x {new Intl.NumberFormat('vi-VN').format(item.price)}</Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ border: 0, p: 0.5, fontWeight: 'bold' }}>
                            {new Intl.NumberFormat('vi-VN').format(item.quantity * item.price)}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
        <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
        
        {/* Tổng tiền */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>TỔNG CỘNG:</Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {new Intl.NumberFormat('vi-VN').format(order.totalAmount)} ₫
            </Typography>
        </Box>
        
        <Typography variant="caption" sx={{ textAlign: 'center', display: 'block', mt: 3 }}>
            Cảm ơn quý khách!
        </Typography>
    </Box>
));

const PrintOrderPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const componentRef = useRef();

    // Lấy dữ liệu đơn hàng và cửa hàng được truyền qua từ trang POS
    const { order, storeInfo } = location.state || {};

    useEffect(() => {
        if (!order) {
            navigate('/');
            return;
        }

        // 1. Định nghĩa hàm xử lý sau khi in
        const handleAfterPrint = () => {
            // Quay trở lại trang bán hàng
            navigate('/');
        };

        // 2. "Lắng nghe" sự kiện onafterprint
        window.addEventListener('afterprint', handleAfterPrint);

        // 3. Kích hoạt hộp thoại in
        const timer = setTimeout(() => {
            window.print();
        }, 500);

        // 4. Quan trọng: Dọn dẹp khi component bị hủy
        // Hàm này sẽ chạy khi người dùng rời khỏi trang in
        return () => {
            clearTimeout(timer);
            // Gỡ bỏ trình lắng nghe sự kiện để tránh rò rỉ bộ nhớ
            window.removeEventListener('afterprint', handleAfterPrint);
        };

    }, [order, navigate]);  // Dependencies

    if (!order) {
        return null; // Hoặc một trang loading/lỗi
    }

    // CSS đặc biệt để chỉ in phần hóa đơn
    const printStyles = `
         @page {
            size: auto; /* Để trình duyệt tự xác định kích thước */
            margin: 0mm; /* Đặt lề về 0 để xóa header/footer */
        }

        @media print {
            body {
                margin: 0;
                padding: 0;
            }
            body * {
                visibility: hidden;
            }
            #printableArea, #printableArea * {
                visibility: visible;
            }
            #printableArea {
                position: absolute;
                left: 0;
                top: 0;;
                width: 100%; /* Đảm bảo nó chiếm đúng chiều rộng */
            }
        }
    `;

    return (
        <>
            <style>{printStyles}</style>
            <Box id="printableArea" sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
                <Invoice order={order} storeInfo={storeInfo} ref={componentRef} />
            </Box>
        </>
    );
};

export default PrintOrderPage;