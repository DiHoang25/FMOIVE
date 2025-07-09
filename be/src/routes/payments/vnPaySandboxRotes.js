// src/routes/payment/paymentRoutes.js
const express = require('express');
const router = express.Router();
const moment = require('moment'); // Sử dụng moment để định dạng ngày tháng
const crypto = require('crypto'); // Để tạo chữ ký hash
const querystring = require('qs'); // Để xử lý query string
const authMiddleware = require('../../middleware/authMiddleware'); // Đảm bảo đường dẫn đúng
const Booking = require('../../models/Booking'); // Import Booking Model
const VnPayConfig = require('../../config/vnPayConfig'); // Import cấu hình VNPAY

// @route   POST /api/payment/create_payment_url
// @desc    Tạo URL thanh toán VNPAY cho một Booking
// @access  Private (Chỉ người dùng đã xác thực mới có thể tạo URL thanh toán)
router.post('/create_payment_url', authMiddleware, async (req, res) => {
    try {
        const { bookingId } = req.body; // Chỉ nhận bookingId từ frontend

        if (!bookingId) {
            return res.status(400).json({ message: 'Booking ID is required.' });
        }

        // 1. Lấy thông tin booking từ database
        const booking = await Booking.findOne({ bookingId: bookingId });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        // Đảm bảo trạng thái booking là PENDING_PAYMENT
        if (booking.status !== 'PENDING_PAYMENT') {
            return res.status(400).json({ message: 'Booking is not in PENDING_PAYMENT status.' });
        }

        const amount = booking.grandTotal; // Lấy tổng tiền từ booking
        const orderId = booking.bookingId; // Sử dụng bookingId làm mã đơn hàng cho VNPAY

        // 2. Lấy các tham số cấu hình từ VnPayConfig
        const { vnp_TmnCode, vnp_HashSecret, vnp_Url, vnp_ReturnUrlFrontend, vnp_IpnUrl } = VnPayConfig;

        if (!vnp_TmnCode || !vnp_HashSecret || !vnp_Url || !vnp_ReturnUrlFrontend || !vnp_IpnUrl) {
            console.error("VNPAY configuration is incomplete. Check VnPayConfig.js and .env file.");
            return res.status(500).json({ message: 'VNPAY configuration error. Please contact support.' });
        }

        // Lấy IP của người dùng
        let ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

        // Nếu là localhost, VNPAY sandbox có thể trả về lỗi.
        // Có thể cần một IP public hoặc một trick nào đó cho localhost.
        // Đối với test, '127.0.0.1' cũng có thể được chấp nhận.
        if (ipAddr === '::1') { // Xử lý IPv6 loopback
            ipAddr = '127.0.0.1';
        }
        if (ipAddr && ipAddr.includes('::ffff:')) { // Xử lý IPv4-mapped IPv6 addresses
            ipAddr = ipAddr.split('::ffff:')[1];
        }

        // Định dạng ngày giờ
        const createDate = moment(new Date()).format('YYYYMMDDHHmmss');
        const expireDate = moment(new Date()).add(15, 'minutes').format('YYYYMMDDHHmmss'); // Hết hạn sau 15 phút

        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = vnp_TmnCode;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = orderId; // Mã đơn hàng của bạn
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho booking: ' + orderId;
        vnp_Params['vnp_OrderType'] = 'billpayment';
        vnp_Params['vnp_Amount'] = amount * 100; // Số tiền phải nhân 100
        vnp_Params['vnp_ReturnUrl'] = vnp_ReturnUrlFrontend; // URL trả về của Frontend
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        vnp_Params['vnp_ExpireDate'] = expireDate;
        // vnp_Params['vnp_BankCode'] = ''; // Có thể bỏ trống hoặc thêm mã ngân hàng nếu cần

        // Sắp xếp các tham số theo thứ tự bảng chữ cái để tạo chữ ký
        vnp_Params = sortObject(vnp_Params);

        const signData = querystring.stringify(vnp_Params, { encode: false }); // Không mã hóa URL ở đây
        const hmac = crypto.createHmac('sha512', vnp_HashSecret);
        const secureHash = hmac.update(signData).digest('hex');

        vnp_Params['vnp_SecureHash'] = secureHash;
        const vnpUrl = vnp_Url + '?' + querystring.stringify(vnp_Params, { encode: true }); // Mã hóa URL ở đây

        res.status(200).json({ paymentUrl: vnpUrl });

    } catch (error) {
        console.error('Error creating VNPAY payment URL:', error);
        res.status(500).json({ message: 'Server error: Failed to create payment URL.', error: error.message });
    }
});

// @route   GET /api/payment/vnpay_return
// @desc    Xử lý VNPAY Return URL (sau khi người dùng thanh toán trên VNPAY)
// @access  Public (VNPAY gọi về)
router.get('/vnpay_return', async (req, res) => {
    try {
        let vnp_Params = req.query;
        let secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_HashSecret']; // Đảm bảo không có HashSecret trong params để xác thực

        vnp_Params = sortObject(vnp_Params);

        const { vnp_HashSecret } = VnPayConfig; // Lấy HashSecret từ config

        const signData = querystring.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac('sha512', vnp_HashSecret);
        const signed = hmac.update(signData).digest('hex');

        let redirectUrl = `${VnPayConfig.vnp_ReturnUrlFrontend}?status=failed&message=Payment Failed. Invalid signature.`; // Default fail

        if (secureHash === signed) {
            // Kiểm tra trạng thái giao dịch từ VNPAY
            const orderId = vnp_Params['vnp_TxnRef'];
            const rspCode = vnp_Params['vnp_ResponseCode']; // Mã phản hồi VNPAY
            const amount = vnp_Params['vnp_Amount'] / 100; // Số tiền đã trả (nhân 100)

            const booking = await Booking.findOne({ bookingId: orderId });

            if (booking) {
                if (rspCode === '00') { // Giao dịch thành công
                    // Kiểm tra số tiền: Đảm bảo số tiền VNPAY trả về khớp với số tiền booking
                    if (booking.grandTotal === amount) {
                        if (booking.status === 'PENDING_PAYMENT') {
                            booking.status = 'PAID'; // Cập nhật trạng thái booking
                            booking.paymentDetails = { // Lưu chi tiết giao dịch
                                vnp_Amount: amount,
                                vnp_BankCode: vnp_Params['vnp_BankCode'],
                                vnp_CardType: vnp_Params['vnp_CardType'],
                                vnp_OrderInfo: vnp_Params['vnp_OrderInfo'],
                                vnp_PayDate: vnp_Params['vnp_PayDate'],
                                vnp_ResponseCode: rspCode,
                                vnp_TmnCode: vnp_Params['vnp_TmnCode'],
                                vnp_TransactionNo: vnp_Params['vnp_TransactionNo'],
                                vnp_TransactionStatus: vnp_Params['vnp_TransactionStatus'], // '00'
                                vnp_TxnRef: orderId,
                                vnp_SecureHash: secureHash,
                            };
                            await booking.save();
                            redirectUrl = `${VnPayConfig.vnp_ReturnUrlFrontend}?status=success&message=Payment Successful!&bookingId=${orderId}`;
                        } else {
                            // Booking đã được xử lý trước đó (VD: IPN đã cập nhật)
                            redirectUrl = `${VnPayConfig.vnp_ReturnUrlFrontend}?status=success&message=Payment already processed.&bookingId=${orderId}`;
                        }
                    } else {
                        // Số tiền không khớp (có thể là lỗi hoặc gian lận)
                        console.error(`VNPAY Return: Amount mismatch for booking ${orderId}. Expected ${booking.grandTotal}, got ${amount}`);
                        redirectUrl = `${VnPayConfig.vnp_ReturnUrlFrontend}?status=failed&message=Payment Failed. Amount mismatch.&bookingId=${orderId}`;
                    }
                } else {
                    // Giao dịch không thành công hoặc lỗi khác từ VNPAY
                    redirectUrl = `${VnPayConfig.vnp_ReturnUrlFrontend}?status=failed&message=Payment Failed. VNPAY Response Code: ${rspCode}.&bookingId=${orderId}`;
                }
            } else {
                // Không tìm thấy booking
                console.error(`VNPAY Return: Booking not found for orderId: ${orderId}`);
                redirectUrl = `${VnPayConfig.vnp_ReturnUrlFrontend}?status=failed&message=Payment Failed. Booking not found.&bookingId=${orderId}`;
            }
        } else {
            // Sai chữ ký - quan trọng để báo lỗi
            console.error('VNPAY Return: Invalid Secure Hash.');
            // redirectUrl đã là default fail message
        }

        res.redirect(redirectUrl); // Chuyển hướng người dùng về frontend

    } catch (error) {
        console.error('Error handling VNPAY return:', error);
        res.redirect(`${VnPayConfig.vnp_ReturnUrlFrontend}?status=error&message=Server error during payment processing.&bookingId=${req.query['vnp_TxnRef'] || ''}`);
    }
});


// @route   GET /api/payment/vnpay_ipn
// @desc    Xử lý VNPAY IPN (Gọi từ VNPAY server-to-server để xác nhận giao dịch)
// @access  Public (VNPAY gọi về, không phải người dùng)
router.get('/vnpay_ipn', async (req, res) => {
    try {
        let vnp_Params = req.query;
        let secureHash = vnp_Params['vnp_SecureHash'];

        let orderId = vnp_Params['vnp_TxnRef'];
        let rspCode = vnp_Params['vnp_ResponseCode'];
        let amount = vnp_Params['vnp_Amount'] / 100; // Số tiền đã trả (nhân 100)

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_HashSecret'];

        vnp_Params = sortObject(vnp_Params);

        const { vnp_HashSecret } = VnPayConfig;

        const signData = querystring.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac('sha512', vnp_HashSecret);
        const signed = hmac.update(signData).digest('hex');

        let paymentStatus = '0'; // 0 = Thành công, 1 = Lỗi checksum, 2 = Dữ liệu không hợp lệ

        if (secureHash === signed) {
            const booking = await Booking.findOne({ bookingId: orderId });

            if (booking) {
                if (booking.grandTotal === amount) { // Kiểm tra số tiền
                    if (booking.status === 'PENDING_PAYMENT') { // Chỉ xử lý khi trạng thái còn PENDING_PAYMENT
                        if (rspCode === '00') {
                            booking.status = 'PAID';
                            booking.paymentDetails = { // Lưu chi tiết giao dịch
                                vnp_Amount: amount,
                                vnp_BankCode: vnp_Params['vnp_BankCode'],
                                vnp_CardType: vnp_Params['vnp_CardType'],
                                vnp_OrderInfo: vnp_Params['vnp_OrderInfo'],
                                vnp_PayDate: vnp_Params['vnp_PayDate'],
                                vnp_ResponseCode: rspCode,
                                vnp_TmnCode: vnp_Params['vnp_TmnCode'],
                                vnp_TransactionNo: vnp_Params['vnp_TransactionNo'],
                                vnp_TransactionStatus: vnp_Params['vnp_TransactionStatus'],
                                vnp_TxnRef: orderId,
                                vnp_SecureHash: secureHash,
                            };
                            await booking.save();
                            paymentStatus = '0'; // Giao dịch thành công
                        } else {
                            // VNPAY báo lỗi (không phải 00)
                            booking.status = 'FAILED'; // Đánh dấu booking là FAILED
                            booking.paymentDetails = { // Lưu lại thông tin lỗi
                                vnp_ResponseCode: rspCode,
                                vnp_TxnRef: orderId,
                                message: 'Payment failed with VNPAY response code: ' + rspCode
                            };
                            await booking.save();
                            paymentStatus = '0'; // Trả về 0 để VNPAY biết đã nhận được IPN
                        }
                    } else {
                        // Booking đã được cập nhật trước đó (ví dụ qua Return URL)
                        paymentStatus = '0'; // Vẫn trả về 0 cho VNPAY biết đã nhận được IPN
                        console.warn(`VNPAY IPN: Booking ${orderId} already in status ${booking.status}. No update needed.`);
                    }
                } else {
                    // Số tiền không khớp
                    paymentStatus = '1'; // Dữ liệu không hợp lệ (số tiền)
                    console.error(`VNPAY IPN: Amount mismatch for booking ${orderId}. Expected ${booking.grandTotal}, got ${amount}`);
                }
            } else {
                // Không tìm thấy booking
                paymentStatus = '1'; // Dữ liệu không hợp lệ (không tìm thấy order)
                console.error(`VNPAY IPN: Booking not found for orderId: ${orderId}`);
            }
        } else {
            // Sai chữ ký
            paymentStatus = '1'; // Lỗi checksum (dữ liệu không hợp lệ)
            console.error('VNPAY IPN: Invalid Secure Hash.');
        }

        res.status(200).json({ RspCode: paymentStatus, Message: 'success' }); // Trả về cho VNPAY

    } catch (error) {
        console.error('Error handling VNPAY IPN:', error);
        res.status(200).json({ RspCode: '99', Message: 'Unknown error' }); // Lỗi không xác định
    }
});

// Helper function to sort object keys alphabetically
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[decodeURIComponent(str[key])]).replace(/%20/g, "+");
    }
    return sorted;
}

module.exports = router;