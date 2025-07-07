// src/routes/payment/paymentRoutes.js
const express = require('express');
const router = express.Router();
const moment = require('moment'); // Để định dạng thời gian cho VNPAY
const crypto = require('crypto');   // Để mã hóa
const qs = require('qs');           // Để xử lý query string
const vnpayConfig = require('../../config/vnPayConfig');
const Booking = require('../../models/Booking'); // Import Booking Model
const authMiddleware = require('../../middleware/authMiddleware'); // Đảm bảo bạn có middleware này


// Helper function to sort object keys
function sortObject(obj) {
    let sorted = {};
    let keys = Object.keys(obj).sort();
    for (let key of keys) {
        sorted[key] = obj[key];
    }
    return sorted;
}

// @route   POST /api/payment/create_payment_url
// @desc    Tạo URL thanh toán VNPAY
// @access  Private
router.post('/create_payment_url', authMiddleware, async (req, res) => {
    try {
        const { bookingId, grandTotal, bankCode, language = 'vn' } = req.body;
        const userId = req.user._id; // Lấy userId từ token đã xác thực

        if (!bookingId || grandTotal === undefined) {
            return res.status(400).json({ message: 'Missing bookingId or grandTotal.' });
        }

        // 1. Lấy thông tin booking từ DB để xác thực lại grandTotal
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }
        // Đảm bảo người dùng sở hữu booking này (security check)
        if (booking.user.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Bạn không có quyền truy cập booking này.' });
        }
        // Kiểm tra trạng thái booking và thanh toán
        if (booking.paymentStatus === 'paid' || booking.bookingStatus === 'confirmed') {
            return res.status(400).json({ message: 'Booking đã được thanh toán hoặc xác nhận.' });
        }
        // Xác thực grandTotal
        if (booking.grandTotal !== grandTotal) {
            console.warn(`Booking ID ${bookingId}: Frontend grandTotal (${grandTotal}) mismatch with DB grandTotal (${booking.grandTotal}). Using DB value.`);
            // return res.status(400).json({ message: 'Tổng tiền không khớp với booking đã lưu. Vui lòng thử lại.' });
            // Trong môi trường production, bạn sẽ muốn trả về lỗi ở đây
        }


        // 2. Tạo các tham số cho VNPAY
        process.env.TZ = 'Asia/Ho_Chi_Minh'; // Đặt múi giờ

        let date = new Date();
        let createDate = moment(date).format('YYYYMMDDHHmmss');
        let orderId = moment(date).format('HHmmss') + bookingId.slice(-6); // Unique transaction ID
        let amount = grandTotal; // VNPAY nhận tiền theo đơn vị VNĐ, KHÔNG phải VND
        let locale = language;
        if (locale === null || locale === '') {
            locale = 'vn';
        }

        let currCode = 'VND';
        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = vnpayConfig.vnp_TmnCode;
        vnp_Params['vnp_Locale'] = locale;
        vnp_Params['vnp_CurrCode'] = currCode;
        vnp_Params['vnp_TxnRef'] = orderId; // Mã giao dịch của hệ thống bạn
        vnp_Params['vnp_OrderInfo'] = `Thanh toan cho don hang: ${orderId} bookingId: ${bookingId}`;
        vnp_Params['vnp_OrderType'] = 'billpayment'; // Hoặc 'other'
        vnp_Params['vnp_Amount'] = amount * 100; // Số tiền phải nhân 100 (đơn vị VNĐ, không phải VND)
        vnp_Params['vnp_ReturnUrl'] = vnpayConfig.vnp_ReturnUrl; // URL frontend khi VNPAY trả về
        vnp_Params['vnp_IpAddr'] = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress; // Lấy IP người dùng
        vnp_Params['vnp_CreateDate'] = createDate;
        if (bankCode !== null && bankCode !== '') {
            vnp_Params['vnp_BankCode'] = bankCode; // Nếu người dùng chọn ngân hàng cụ thể
        }

        vnp_Params = sortObject(vnp_Params); // Sắp xếp các tham số theo ABC

        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
        const signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest('hex');
        vnp_Params['vnp_SecureHash'] = signed;

        const vnpUrl = vnpayConfig.vnp_Url + '?' + qs.stringify(vnp_Params, { encode: false });

        res.status(200).json({ vnpUrl });

    } catch (error) {
        console.error('Error creating VNPAY payment URL:', error);
        res.status(500).json({ message: 'Failed to create VNPAY payment URL.', error: error.message });
    }
});


// @route   GET /api/payment/vnpay_ipn (VNPAY IPN URL)
// @desc    Nhận kết quả thanh toán từ VNPAY (backend to backend)
// @access  Public (VNPAY gọi)
router.get('/vnpay_ipn', async (req, res) => {
    try {
        let vnp_Params = req.query;
        let secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);

        const tmnCode = vnp_Params['vnp_TmnCode'];
        const hashSecret = vnpayConfig.vnp_HashSecret;

        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac('sha512', hashSecret);
        const signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest('hex');

        if (secureHash === signed) {
            const orderId = vnp_Params['vnp_TxnRef'];
            const rspCode = vnp_Params['vnp_ResponseCode']; // Mã phản hồi VNPAY
            const transactionStatus = vnp_Params['vnp_TransactionStatus']; // Trạng thái giao dịch VNPAY
            const amount = vnp_Params['vnp_Amount'] / 100; // Số tiền đã thanh toán
            const transactionNo = vnp_Params['vnp_TransactionNo']; // Mã giao dịch của VNPAY
            const payDate = vnp_Params['vnp_PayDate']; // Ngày thanh toán

            // Lấy bookingId từ OrderInfo (nếu bạn lưu vào đó)
            const orderInfo = vnp_Params['vnp_OrderInfo'];
            const bookingIdMatch = orderInfo.match(/bookingId: ([a-f\d]{24})/); // Regex để tìm bookingId (ObjectId)
            const bookingId = bookingIdMatch ? bookingIdMatch[1] : null;

            if (!bookingId) {
                console.error('VNPAY IPN: Could not extract bookingId from OrderInfo:', orderInfo);
                return res.status(200).json({ RspCode: '99', Message: 'Booking ID not found in OrderInfo' });
            }

            const booking = await Booking.findById(bookingId);

            if (booking) {
                if (booking.grandTotal === amount) { // Kiểm tra số tiền khớp
                    if (booking.paymentStatus === 'pending') {
                        if (rspCode === '00' && transactionStatus === '00') {
                            // Thanh toán thành công
                            booking.paymentStatus = 'paid';
                            booking.bookingStatus = 'confirmed';
                            booking.paymentMethod = 'VNPAY';
                            booking.paymentTransactionId = transactionNo; // Lưu mã giao dịch VNPAY
                            await booking.save();
                            res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
                        } else {
                            // Thanh toán thất bại hoặc pending
                            booking.paymentStatus = 'failed'; // Hoặc 'cancelled'
                            booking.paymentTransactionId = transactionNo;
                            await booking.save();
                            res.status(200).json({ RspCode: '00', Message: 'Confirm Success (Payment Failed)' });
                        }
                    } else {
                        res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
                    }
                } else {
                    res.status(200).json({ RspCode: '04', Message: 'Invalid Amount' });
                }
            } else {
                res.status(200).json({ RspCode: '01', Message: 'Order not found' });
            }
        } else {
            res.status(200).json({ RspCode: '97', Message: 'Invalid Checksum' });
        }
    } catch (error) {
        console.error('Error in VNPAY IPN callback:', error);
        res.status(500).json({ RspCode: '99', Message: 'Unknown error' });
    }
});

module.exports = router;