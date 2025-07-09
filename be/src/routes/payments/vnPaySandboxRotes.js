// src/routes/payment/paymentRoutes.js
const express = require('express');
const router = express.Router();
const moment = require('moment'); // Sử dụng moment để định dạng ngày tháng
const crypto = require('crypto'); // Để tạo chữ ký hash
const querystring = require('qs'); // Để xử lý query string

const authMiddleware = require('../../middleware/authMiddleware'); // Đảm bảo đường dẫn đúng
const Booking = require('../../models/Booking'); // Import Booking Model
const VnPayConfig = require('../../config/VnPayConfig'); // Import cấu hình VNPAY

// Hàm sắp xếp đối tượng theo key (quan trọng cho VNPay)
// Lưu ý: Hàm này mã hóa key trước khi sắp xếp và mã hóa giá trị sau đó.
// VNPAY thường yêu cầu sắp xếp key KHÔNG MÃ HÓA, sau đó nối chuỗi và mã hóa GIÁ TRỊ.
// Tôi sẽ điều chỉnh hàm này để phù hợp hơn với cách làm phổ biến của VNPAY.
function sortObject(obj) {
    let sorted = {};
    let keys = Object.keys(obj).sort(); // Sắp xếp key chưa mã hóa
    keys.forEach(key => {
        sorted[key] = obj[key];
    });
    return sorted;
}

/**
 * @route POST /api/payment/create_payment_url
 * @desc Tạo URL thanh toán VNPAY cho một Booking
 * @access Private (Chỉ người dùng đã xác thực mới có thể tạo URL thanh toán)
 */
router.post('/create_payment_url', authMiddleware, async (req, res) => {
    try {
        const { bookingId } = req.body; // Chỉ nhận bookingId từ frontend

        if (!bookingId) {
            return res.status(400).json({ message: 'Booking ID is required.' });
        }

        // 1. Lấy thông tin booking từ database
        const booking = await Booking.findOne({ bookingId: bookingId });

        if (!booking) {
            console.error(`Booking with ID ${bookingId} not found.`);
            return res.status(404).json({ message: 'Booking not found.' });
        }

        // Đảm bảo trạng thái booking là PENDING_PAYMENT
        if (booking.status !== 'PENDING_PAYMENT') {
            console.error(`Booking ${bookingId} is not in PENDING_PAYMENT status. Current status: ${booking.status}`);
            return res.status(400).json({ message: 'Booking is not in PENDING_PAYMENT status or has been processed.' });
        }

        const amount = booking.grandTotal; // Lấy tổng tiền từ booking
        const orderRef = booking.bookingId; // Sử dụng bookingId làm mã đơn hàng cho VNPAY (vnp_TxnRef)
        const orderDescription = `Thanh toan ve xem phim cho booking ${orderRef}`;

        // 2. Lấy các tham số cấu hình từ VnPayConfig
        const { vnp_TmnCode, vnp_HashSecret, vnp_Url, vnp_ReturnUrlFrontend, vnp_IpnUrl } = VnPayConfig;

        if (!vnp_TmnCode || !vnp_HashSecret || !vnp_Url || !vnp_ReturnUrlFrontend || !vnp_IpnUrl) {
            console.error("VNPAY configuration is incomplete. Check VnPayConfig.js and .env file.");
            return res.status(500).json({ message: 'VNPAY configuration error. Please contact support.' });
        }

        // Lấy địa chỉ IP của client
        let ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

        // Xử lý IP loopback và IPv4-mapped IPv6 cho môi trường dev/test
        if (ipAddr === '::1') {
            ipAddr = '127.0.0.1';
        }
        if (ipAddr && ipAddr.includes('::ffff:')) {
            ipAddr = ipAddr.split('::ffff:')[1];
        }

        // Định dạng ngày giờ
        const createDate = moment(new Date()).format('YYYYMMDDHHmmss');
        const expireDate = moment(new Date()).add(15, 'minutes').format('YYYYMMDDHHmmss'); // Hết hạn sau 15 phút

        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = vnp_TmnCode;
        vnp_Params['vnp_Locale'] = 'vn'; // Ngôn ngữ hiển thị trên cổng thanh toán
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = orderRef; // Mã giao dịch tại hệ thống của bạn (để đối chiếu)
        vnp_Params['vnp_OrderInfo'] = orderDescription; // Thông tin đơn hàng
        vnp_Params['vnp_OrderType'] = 'billpayment'; // Loại hàng hóa/dịch vụ
        vnp_Params['vnp_Amount'] = amount * 100; // Số tiền phải nhân 100 (đơn vị VNPay là cent)
        vnp_Params['vnp_ReturnUrl'] = vnp_ReturnUrlFrontend; // URL trả về sau khi thanh toán trên VNPay
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        vnp_Params['vnp_ExpireDate'] = expireDate;
        // vnp_Params['vnp_BankCode'] = ''; // Có thể bỏ trống hoặc thêm mã ngân hàng nếu cần

        // Sắp xếp các tham số theo thứ tự bảng chữ cái để tạo chữ ký
        vnp_Params = sortObject(vnp_Params);

        // Tạo chuỗi dữ liệu để băm (hashData)
        // Các giá trị phải được mã hóa URL trước khi nối chuỗi để băm
        let hashData = '';
        let count = 0;
        for (let key in vnp_Params) {
            if (vnp_Params.hasOwnProperty(key)) {
                let value = vnp_Params[key];
                hashData += (count === 0 ? '' : '&') + key + '=' + encodeURIComponent(value).replace(/%20/g, '+');
                count++;
            }
        }

        // Tạo chữ ký SHA512
        const hmac = crypto.createHmac('sha512', vnp_HashSecret);
        const secureHash = hmac.update(hashData).digest('hex');

        vnp_Params['vnp_SecureHash'] = secureHash;

        // Tạo URL thanh toán hoàn chỉnh (mã hóa toàn bộ URL)
        const vnpUrlWithParams = vnp_Url + '?' + querystring.stringify(vnp_Params, { encode: true });

        // Debugging logs
        console.log('--- VNPAY CREATE PAYMENT URL DEBUG ---');
        console.log('VNPAY Params (before hash):', vnp_Params); // Includes secureHash at this point
        console.log('Hash Secret Used:', vnp_HashSecret);
        console.log('Raw Data String for Hashing:', hashData);
        console.log('Generated Secure Hash:', secureHash);
        console.log('Final VNPAY URL:', vnpUrlWithParams);

        res.status(200).json({ paymentUrl: vnpUrlWithParams });

    } catch (error) {
        console.error('Error creating VNPAY payment URL:', error);
        res.status(500).json({ message: 'Server error: Failed to create payment URL.', error: error.message });
    }
});

/**
 * @route GET /api/payment/vnpay_return
 * @desc Xử lý VNPAY Return URL (sau khi người dùng thanh toán trên VNPAY)
 * @access Public (VNPAY gọi về)
 */
router.get('/vnpay_return', async (req, res) => {
    try {
        let vnp_Params = req.query;
        let secureHash = vnp_Params['vnp_SecureHash'];

        let orderId = vnp_Params['vnp_TxnRef'];
        let rspCode = vnp_Params['vnp_ResponseCode'];
        let amount = vnp_Params['vnp_Amount'] / 100; // Số tiền đã trả (nhân 100)

        // Xóa các tham số không dùng để xác thực hash
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType']; // VNPAY có thể gửi thêm tham số này

        // Sắp xếp các tham số nhận về để tạo chữ ký
        vnp_Params = sortObject(vnp_Params);

        const { vnp_HashSecret } = VnPayConfig; // Lấy HashSecret từ config

        // Tạo chuỗi dữ liệu để băm (hashData) từ các tham số nhận về
        let hashData = '';
        let count = 0;
        for (let key in vnp_Params) {
            if (vnp_Params.hasOwnProperty(key)) {
                let value = vnp_Params[key];
                hashData += (count === 0 ? '' : '&') + key + '=' + encodeURIComponent(value).replace(/%20/g, '+');
                count++;
            }
        }

        // Tạo chữ ký từ dữ liệu nhận về và Hash Secret của bạn
        const hmac = crypto.createHmac('sha512', vnp_HashSecret);
        const signed = hmac.update(hashData).digest('hex');

        // URL để redirect về frontend
        let redirectUrl = `${VnPayConfig.vnp_ReturnUrlFrontend}?status=failed&message=${encodeURIComponent('Payment Failed. Invalid signature.')}&bookingId=${orderId}`;

        console.log('--- VNPAY RETURN URL DEBUG ---');
        console.log('Received Query Params:', req.query);
        console.log('Received SecureHash:', secureHash);
        console.log('Hash Secret Used:', vnp_HashSecret);
        console.log('Raw Data String for Hashing (Return):', hashData);
        console.log('Calculated Secure Hash (Return):', signed);

        if (secureHash === signed) {
            // Chữ ký hợp lệ, tiến hành xử lý kết quả giao dịch
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
                            redirectUrl = `${VnPayConfig.vnp_ReturnUrlFrontend}?status=success&message=${encodeURIComponent('Payment Successful!')}&bookingId=${orderId}`;
                            console.log(`VNPAY Return: Booking ${orderId} updated to PAID.`);
                        } else {
                            // Booking đã được xử lý trước đó (VD: IPN đã cập nhật)
                            redirectUrl = `${VnPayConfig.vnp_ReturnUrlFrontend}?status=success&message=${encodeURIComponent('Payment already processed.')}&bookingId=${orderId}`;
                            console.warn(`VNPAY Return: Booking ${orderId} already in status ${booking.status}.`);
                        }
                    } else {
                        // Số tiền không khớp (có thể là lỗi hoặc gian lận)
                        console.error(`VNPAY Return: Amount mismatch for booking ${orderId}. Expected ${booking.grandTotal}, got ${amount}.`);
                        redirectUrl = `${VnPayConfig.vnp_ReturnUrlFrontend}?status=failed&message=${encodeURIComponent('Payment Failed. Amount mismatch.')}&bookingId=${orderId}`;
                    }
                } else {
                    // Giao dịch không thành công hoặc lỗi khác từ VNPAY
                    console.error(`VNPAY Return: Payment failed for booking ${orderId}. VNPAY Response Code: ${rspCode}.`);
                    redirectUrl = `${VnPayConfig.vnp_ReturnUrlFrontend}?status=failed&message=${encodeURIComponent(`Payment Failed. VNPAY Code: ${rspCode}.`)}&bookingId=${orderId}`;
                    // Nếu IPN chưa xử lý, có thể cập nhật trạng thái booking tại đây
                    if (booking.status === 'PENDING_PAYMENT') {
                         booking.status = 'FAILED'; // Hoặc CANCELLED
                         booking.paymentDetails = { vnp_ResponseCode: rspCode, vnp_TxnRef: orderId, message: `Payment failed with VNPAY code ${rspCode}` };
                         await booking.save();
                    }
                }
            } else {
                // Không tìm thấy booking
                console.error(`VNPAY Return: Booking not found for orderId: ${orderId}`);
                redirectUrl = `${VnPayConfig.vnp_ReturnUrlFrontend}?status=failed&message=${encodeURIComponent('Payment Failed. Booking not found in your system.')}&bookingId=${orderId}`;
            }
        } else {
            // Sai chữ ký - quan trọng để báo lỗi
            console.error('VNPAY Return: Invalid Secure Hash. Signature mismatch.');
            // redirectUrl đã là default fail message
        }

        res.redirect(redirectUrl); // Chuyển hướng người dùng về frontend

    } catch (error) {
        console.error('Error handling VNPAY return:', error);
        res.redirect(`${VnPayConfig.vnp_ReturnUrlFrontend}?status=error&message=${encodeURIComponent('Server error during payment processing.')}&bookingId=${req.query['vnp_TxnRef'] || ''}`);
    }
});


/**
 * @route GET /api/payment/vnpay_ipn
 * @desc Xử lý VNPAY IPN (Gọi từ VNPAY server-to-server để xác nhận giao dịch)
 * @access Public (VNPAY gọi về, không phải người dùng)
 */
router.get('/vnpay_ipn', async (req, res) => {
    try {
        let vnp_Params = req.query;
        let secureHash = vnp_Params['vnp_SecureHash'];

        let orderId = vnp_Params['vnp_TxnRef'];
        let rspCode = vnp_Params['vnp_ResponseCode'];
        let amount = vnp_Params['vnp_Amount'] / 100; // Số tiền đã trả (nhân 100)

        // Xóa các tham số không dùng để xác thực hash
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType']; // VNPAY có thể gửi thêm tham số này

        // Sắp xếp các tham số nhận về để tạo chữ ký
        vnp_Params = sortObject(vnp_Params);

        const { vnp_HashSecret } = VnPayConfig;

        // Tạo chuỗi dữ liệu để băm (hashData) từ các tham số nhận về
        let hashData = '';
        let count = 0;
        for (let key in vnp_Params) {
            if (vnp_Params.hasOwnProperty(key)) {
                let value = vnp_Params[key];
                hashData += (count === 0 ? '' : '&') + key + '=' + encodeURIComponent(value).replace(/%20/g, '+');
                count++;
            }
        }

        // Tạo chữ ký từ dữ liệu nhận về và Hash Secret của bạn
        const hmac = crypto.createHmac('sha512', vnp_HashSecret);
        const signed = hmac.update(hashData).digest('hex');

        let responseCode = '99'; // Mặc định lỗi không xác định
        let message = 'Unknown error';

        console.log('--- VNPAY IPN DEBUG ---');
        console.log('Received Query Params:', req.query);
        console.log('Received SecureHash:', secureHash);
        console.log('Hash Secret Used:', vnp_HashSecret);
        console.log('Raw Data String for Hashing (IPN):', hashData);
        console.log('Calculated Secure Hash (IPN):', signed);


        if (secureHash === signed) {
            const booking = await Booking.findOne({ bookingId: orderId });

            if (booking) {
                if (booking.grandTotal === amount) { // Kiểm tra số tiền
                    if (booking.status === 'PENDING_PAYMENT') { // Chỉ xử lý khi trạng thái còn PENDING_PAYMENT
                        if (rspCode === '00') {
                            booking.status = 'PAID';
                            message = 'Confirm Success';
                            console.log(`VNPAY IPN: Booking ${orderId} updated to PAID.`);
                        } else {
                            // VNPAY báo lỗi (không phải 00)
                            booking.status = 'FAILED'; // Đánh dấu booking là FAILED
                            message = 'Confirm Failed';
                            console.log(`VNPAY IPN: Booking ${orderId} updated to FAILED (VNPAY response: ${rspCode}).`);
                        }
                        // Cập nhật chi tiết giao dịch cho cả thành công và thất bại
                        booking.paymentDetails = {
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
                        responseCode = '00'; // Trả về 00 cho VNPAY biết đã nhận và xử lý
                    } else {
                        // Số tiền không khớp
                        responseCode = '04'; // Invalid amount
                        message = 'Invalid amount';
                        console.error(`VNPAY IPN: Amount mismatch for booking ${orderId}. Expected ${booking.grandTotal}, got ${amount}.`);
                    }
                } else {
                    // Booking đã được cập nhật trước đó (ví dụ qua Return URL)
                    responseCode = '02'; // Order already confirmed
                    message = 'Order already confirmed';
                    console.warn(`VNPAY IPN: Booking ${orderId} already in status ${booking.status}. No update needed.`);
                }
            } else {
                // Không tìm thấy booking
                responseCode = '01'; // Order not found
                message = 'Order not found';
                console.error(`VNPAY IPN: Booking not found for orderId: ${orderId}`);
            }
        } else {
            // Sai chữ ký
            responseCode = '97'; // Invalid signature
            message = 'Invalid signature';
            console.error('VNPAY IPN: Invalid Secure Hash. Signature mismatch.');
        }

        res.status(200).json({ RspCode: responseCode, Message: message }); // Trả về cho VNPAY

    } catch (error) {
        console.error('Error handling VNPAY IPN:', error);
        res.status(200).json({ RspCode: '99', Message: 'Unknown error' }); // Lỗi không xác định
    }
});

module.exports = router;