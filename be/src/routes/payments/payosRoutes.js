// src/routes/payosRoutes.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');

// Import models
const Booking = require('../../models/Booking');
const Invoice = require('../../models/Invoice');

// Import PayOS config
const PAYOS_CONFIG = require('../../config/payOSConfig');

// --- Hàm tạo chữ ký (checksum) cho PayOS ---
const createSignature = (data, key) => {
    // 1. Chỉ chọn các trường PayOS yêu cầu ký theo tài liệu
    const fieldsToSign = {};

    // Chỉ thêm vào fieldsToSign nếu trường đó tồn tại và không phải null/undefined
    // Điều này đảm bảo chuỗi ký không bị sai nếu một trường tùy chọn không có giá trị
    if (data.amount !== undefined && data.amount !== null) fieldsToSign.amount = data.amount;
    if (data.cancelUrl !== undefined && data.cancelUrl !== null) fieldsToSign.cancelUrl = data.cancelUrl;
    if (data.description !== undefined && data.description !== null) fieldsToSign.description = data.description;
    if (data.orderCode !== undefined && data.orderCode !== null) fieldsToSign.orderCode = data.orderCode;
    if (data.returnUrl !== undefined && data.returnUrl !== null) fieldsToSign.returnUrl = data.returnUrl;

    // 2. Sắp xếp các khóa của CHỈ CÁC TRƯỜNG ĐƯỢC KÝ theo alphabet
    const sortedKeys = Object.keys(fieldsToSign).sort();

    // 3. Tạo chuỗi để ký theo định dạng key=value&key=value
    const stringToSign = sortedKeys.map(k => {
        let value = fieldsToSign[k];
        // Đảm bảo xử lý các kiểu dữ liệu phức tạp (như object/array) nếu PayOS yêu cầu ký chúng.
        // Tuy nhiên, với 5 trường trên, chúng thường là primitive types (số, chuỗi).
        if (typeof value === 'object' && value !== null) {
            value = JSON.stringify(value);
            // Ký tự escape (nếu có từ JSON.stringify) đã được bạn xử lý bằng cách bỏ dòng .replace,
            // điều này là đúng nếu các trường này không chứa các ký tự cần escape.
        }
        return `${k}=${value}`;
    }).join('&');

    console.log('[DEBUG] Final String to Sign (STRICTLY as per PayOS docs):', stringToSign);

    // 4. Tính toán HMAC SHA256
    return crypto.createHmac('sha256', key).update(stringToSign).digest('hex');
};


// const createSignature = (data, key) => {
//     const sortedKeys = Object.keys(data).sort();
//     const stringToSign = sortedKeys.map(k => `${k}=${data[k]}`).join('&');
//     return crypto.createHmac('sha256', key).update(stringToSign).digest('hex');
// };

// [POST] /api/payos/create-payment - Bắt đầu quá trình thanh toán PayOS
// Yêu cầu bookingId từ frontend
router.post('/create-payment', async (req, res) => {
    const { bookingId } = req.body;

    if (!bookingId) {
        return res.status(400).json({ message: 'Booking ID là bắt buộc.' });
    }

    try {
        const booking = await Booking.findOne({ bookingId: bookingId });

        if (!booking) {
            return res.status(404).json({ message: 'Booking không tìm thấy.' });
        }

        if (booking.status !== 'PENDING_PAYMENT') {
            return res.status(400).json({ message: 'Booking không ở trạng thái chờ thanh toán.' });
        }

        // --- Tạo Yêu cầu Thanh toán PayOS ---
        // Sử dụng _id của booking làm orderCode cho PayOS để dễ dàng đối chiếu sau này.
        // PayOS yêu cầu orderCode là số.
        // Cân nhắc sử dụng Date.now() hoặc một cơ chế sinh số duy nhất khác nếu _id không phù hợp.
        // Ví dụ: const payosOrderCode = Date.now();
        const payosOrderCode = Number(booking._id.toString().replace(/[^0-9]/g, '').slice(-10));
        //const payosOrderCode = Date.now(); // Sử dụng timestamp làm orderCode
        // Đảm bảo orderCode là số nguyên dương và có độ dài hợp lý theo PayOS
        // Nếu PayOS yêu cầu orderCode là số lớn, Date.now() là một lựa chọn tốt.
        // const payosOrderCode = Date.now(); // Ví dụ sử dụng timestamp

        console.log(`[PayOS] Mapping Booking ID ${booking._id} to PayOS Order Code: ${payosOrderCode}`);

        const amount = booking.grandTotal;
        // Đảm bảo amount là số nguyên nếu PayOS yêu cầu.
        // Nếu PayOS yêu cầu đơn vị nhỏ nhất (ví dụ: xu), bạn cần nhân thêm: amount: Math.round(booking.grandTotal * 100)
        console.log(`[DEBUG] Amount: ${amount}`);

        // const description = `Thanh toán cho Booking ID: ${booking.bookingId || booking._id}`; // Mô tả chi tiết hơn
        const description = `TestDonHang`; // Mô tả chi tiết hơn

        const { name: userName, email: userEmail } = booking.user;
        // Kiểm tra sự tồn tại của userName và userEmail
        if (!userName || !userEmail) {
            console.error('[ERROR] Missing buyerName or buyerEmail from booking.user');
            return res.status(400).json({ message: 'Thông tin người mua không đầy đủ.' });
        }

        // URL trả về và callback từ PayOS.
        // Giữ localhost như bạn đã chỉ ra, nhưng cần lưu ý về môi trường thực tế.
        const returnUrl = `${PAYOS_CONFIG.FRONTEND_URL}/payment-status?bookingId=${booking._id}&payosOrderCode=${payosOrderCode}`;
        const cancelUrl = `${PAYOS_CONFIG.FRONTEND_URL}/payment-status?bookingId=${booking._id}&payosOrderCode=${payosOrderCode}&status=cancelled`;
        const callbackUrl = `${PAYOS_CONFIG.BACKEND_URL}/api/payos-payment/webhook`; // URL webhook của backend

        console.log(`[DEBUG] Return URL: ${returnUrl}`);
        console.log(`[DEBUG] Cancel URL: ${cancelUrl}`);
        console.log(`[DEBUG] Callback URL: ${callbackUrl}`);

        const orderData = {
            orderCode: payosOrderCode,
            amount: amount,
            description: description,
            returnUrl: returnUrl,
            cancelUrl: cancelUrl,
            expiredAt: Math.floor(Date.now() / 1000) + 900, // Hết hạn sau 15 phút (900 giây)
            buyerName: userName,
            buyerEmail: userEmail,
            callbackUrl: callbackUrl
            // Thêm items nếu PayOS yêu cầu và có trong booking
            // items: booking.selectedCombos.map(combo => ({
            //     name: combo.name,
            //     quantity: combo.quantity,
            //     price: combo.price
            // })),
            // shippingAddress: booking.user.address, // Thêm địa chỉ vận chuyển nếu có
        };
        console.log('[DEBUG] orderData for signature:', orderData);
        // --- Tạo chữ ký cho yêu cầu PayOS ---
        // Dựa trên logic mới của bạn, signature được thêm vào body, không phải header x-checksum.
        const signature = createSignature(orderData, PAYOS_CONFIG.CHECKSUM_KEY);
        console.log('[PayOS] Created signature for order:', signature);

        // Chuẩn bị payload cho PayOS API
        const payosRequestPayload = {
            ...orderData,
            callbackUrl: callbackUrl,
            signature: signature, // Thêm signature vào body theo logic mới của bạn
            // Thêm callbackUrl vào đây nếu PayOS yêu cầu nó trong body API call
            // Ví dụ: callbackUrl: callbackUrl,
        };

        console.log('[DEBUG] Full Payload sent to PayOS API:', payosRequestPayload);

        const headers = {
            'x-client-id': PAYOS_CONFIG.CLIENT_ID,
            'x-api-key': PAYOS_CONFIG.API_KEY,
            //'x-checksum': signature, // Bỏ dòng này nếu signature được gửi trong body
            'Content-Type': 'application/json'
        };

        // Gọi API PayOS để tạo yêu cầu thanh toán
        const payosResponse = await axios.post(PAYOS_CONFIG.API_URL, payosRequestPayload, { headers });
        const responseData = payosResponse.data; // Lấy toàn bộ data từ response
        console.log('PayOS API Raw Response:', responseData);

        if (responseData && responseData.code === '00') {
            const paymentLinkData = responseData.data;
            console.log('[PayOS] Payment request created successfully:', paymentLinkData);

            // KHÔNG TẠO INVOICE TẠI ĐÂY. INVOICE CHỈ ĐƯỢC TẠO KHI THANH TOÁN THÀNH CÔNG TỪ WEBHOOK.

            // Cập nhật booking với payment link ID nếu cần
            booking.payosOrderCode = payosOrderCode; // Lưu orderCode của PayOS vào booking
            await booking.save(); // Lưu lại booking đã cập nhật vào database
            console.log(`[PayOS] Booking ${booking._id} updated with PayOS orderCode ${payosOrderCode}.`); // Lưu lại booking với thông tin payment link

            res.status(200).json({
                message: 'Yêu cầu thanh toán đã được tạo thành công.',
                payosPaymentUrl: paymentLinkData.checkoutUrl, // URL để redirect người dùng
                qrCodeUrl: paymentLinkData.qrCode, // Mã QR nếu có
                bookingId: booking.bookingId // Trả về bookingId để frontend dễ xử lý
            });
        } else {
            console.error('Lỗi khi tạo yêu cầu thanh toán PayOS API:', responseData);
            res.status(500).json({
                message: 'Lỗi khi tạo yêu cầu thanh toán PayOS API.',
                error: responseData
            });
        }

    } catch (error) {
        console.error('Lỗi khi xử lý tạo thanh toán PayOS:', error.response ? error.response.data : error.message);
        res.status(500).json({
            message: 'Đã xảy ra lỗi hệ thống khi tạo yêu cầu thanh toán.',
            error: error.response ? error.response.data : error.message
        });
    }
});

// [POST] /api/payos-payment/webhook - Xử lý webhook từ PayOS (QUAN TRỌNG NHẤT)
router.post('/webhook', async (req, res) => {
    const webhookData = req.body;
    const receivedChecksum = req.headers['x-checksum'] ||
        req.headers['x-signature'] ||
        req.headers['signature'] ||
        req.headers['checksum'];
    console.log('[DEBUG] All headers:', req.headers);

    console.log('[PayOS Webhook] Received Data:', webhookData);
    console.log('[PayOS Webhook] Received Checksum (Header):', receivedChecksum);

    try {
        // --- 1. XÁC MINH CHỮ KÝ WEBHOOK ---
        const dataToVerify = { ...webhookData };
        if (dataToVerify.signature) { // PayOS có thể gửi signature trong body hoặc chỉ header
            delete dataToVerify.signature;
        }

        const calculatedChecksum = createSignature(dataToVerify, PAYOS_CONFIG.WEBHOOK_SECRET);
        console.log('Secret khúi rùm :', PAYOS_CONFIG.WEBHOOK_SECRET);
        console.log('Key:', PAYOS_CONFIG.CHECKSUM_KEY);

        if (receivedChecksum !== calculatedChecksum) {
            console.warn('[PayOS Webhook] Chữ ký webhook không hợp lệ.');
            return res.status(200).json({ status: 'Failed', message: 'Invalid checksum.' });
        }

        // --- 2. XỬ LÝ DỮ LIỆU WEBHOOK ---
        //const { code, desc, data: payosTransactionData } = webhookData;
        console.log('[DEBUG] Full webhook data:', JSON.stringify(webhookData, null, 2));
        const code = webhookData.code || webhookData.status;
        const desc = webhookData.desc || webhookData.message;
        const payosTransactionData = webhookData.data || webhookData;


        const payosOrderCode = payosTransactionData.orderCode;
        const transactionStatus = payosTransactionData.status; // 'PAID', 'CANCELLED', 'EXPIRED', 'PENDING'

        
        booking.payosOrderCode = payosOrderCode; // -> save db, đảm bảo nó primary key
                await booking.save();
                const booking = await Booking.findOne({ payosOrderCode: payosOrderCode });

        if (!booking) {
            console.warn(`[PayOS Webhook] Booking for PayOS orderCode ${payosOrderCode} (amount ${payosTransactionData.amount}) not found.`);
            return res.status(200).json({ status: 'Failed', message: 'Booking not found.' });
        }

        // --- 3. CẬP NHẬT TRẠNG THÁI BOOKING VÀ TẠO/CẬP NHẬT INVOICE ---
        if (code === '00' && transactionStatus === 'PAID') { // Thanh toán thành công
                    if (booking.status !== 'PAID') { // Chỉ cập nhật nếu booking chưa được thanh toán
                        booking.status = 'PAID';
                        await booking.save();
                        console.log(`[PayOS Webhook] Booking ${booking.bookingId || booking._id} updated to PAID.`);
        
                        // Tạo Invoice mới chỉ khi thanh toán thành công
                        const newInvoice = new Invoice({
                            invoiceId: `INV-${Date.now()}-${booking._id.toString().slice(-4)}`, // Mã hóa đơn duy nhất
                            booking: booking._id,
                            user: {
                                _id: booking.user._id._id,
                                name: booking.user.name,
                                email: booking.user.email
                            },
                            amount: booking.grandTotal,
                            status: 'PAID',
                            paymentMethod: 'PAYOS',
                            payosDetails: {
                                orderCode: payosOrderCode, // Hoặc payosTransactionData.orderCode
                                transactionId: payosTransactionData.transactionId || null,
                                amount: payosTransactionData.amount,
                                description: payosTransactionData.description,
                                status: transactionStatus,
                                paymentMethod: payosTransactionData.paymentMethod || 'UNKNOWN',
                                paidAt: new Date(),
                                checksum: receivedChecksum,
                            }
                        });
                        await newInvoice.save();
                        console.log(`[PayOS Webhook] Invoice ${newInvoice.invoiceId} created for Booking ${booking.bookingId || booking._id}.`);
        
                        // Thực hiện các logic sau thanh toán thành công (gửi email, SMS, WebSocket notification)
                    } else {
                        console.log(`[PayOS Webhook] Booking ${booking.bookingId || booking._id} đã là PAID, không cần cập nhật Invoice.`);
                    }
        
                } else { // Thanh toán thất bại, hủy, hết hạn
                    if (booking.status === 'PENDING_PAYMENT') { // Chỉ cập nhật nếu booking đang chờ thanh toán
                        if (transactionStatus === 'CANCELLED') booking.status = 'CANCELLED';
                        else if (transactionStatus === 'EXPIRED') booking.status = 'CANCELLED'; // Hoặc 'FAILED'
                        else booking.status = 'FAILED';
                        await booking.save();
                        console.log(`[PayOS Webhook] Booking ${booking.bookingId || booking._id} updated to ${booking.status}.`);
                        // KHÔNG TẠO INVOICE NẾU THANH TOÁN THẤT BẠI
                    }
                }
        
                res.status(200).json({ message: 'Webhook đã được xử lý thành công.' });
        
    } catch (error) {
        console.error('[PayOS Webhook] Lỗi khi xử lý PayOS webhook:', error);
        res.status(200).json({ status: 'Failed', message: 'Lỗi nội bộ khi xử lý webhook.' });
    }
});

// [GET] /api/payos/status/:bookingId - Lấy trạng thái Booking và Invoice liên quan
// Frontend sẽ gọi API này để kiểm tra trạng thái sau khi chuyển hướng từ PayOS
router.get('/status/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId).populate('user._id');

        if (!booking) {
            return res.status(404).json({ message: 'Booking không tìm thấy.' });
        }

        // Tìm invoice liên quan đến booking này (chỉ tồn tại nếu thanh toán thành công)
        const invoice = await Invoice.findOne({ booking: booking._id });

        res.status(200).json({
            bookingId: booking._id,
            bookingStatus: booking.status,
            totalAmount: booking.grandTotal,
            paymentInfo: invoice ? { // Chỉ trả về thông tin invoice nếu nó tồn tại
                invoiceId: invoice.invoiceId,
                invoiceStatus: invoice.status,
                paymentMethod: invoice.paymentMethod,
                payosDetails: invoice.payosDetails,
                createdAt: invoice.createdAt
            } : null,
            message: invoice ? (invoice.status === 'PAID' ? 'Thanh toán thành công!' : `Hóa đơn: ${invoice.status}.`) : `Booking đang ở trạng thái ${booking.status}.`
        });
    } catch (error) {
        console.error('Lỗi khi lấy trạng thái booking/invoice:', error.message);
        res.status(500).json({ message: 'Lỗi hệ thống khi lấy trạng thái.' });
    }
});


// [GET] /api/payos/success - Trang thông báo thành công (Return URL từ PayOS)
// URL này được gọi khi người dùng được chuyển hướng trở lại từ PayOS
router.get('/success', async (req, res) => {
    // Lấy các tham số từ URL khi PayOS redirect người dùng về
    const { bookingId, payosOrderCode, status } = req.query;

    console.log(`[PayOS Return URL]: Received request for bookingId: ${bookingId}, orderCode: ${payosOrderCode}, status: ${status}`);

    // Kiểm tra xem có payosOrderCode không, nếu không có thì không thể xử lý
    if (!payosOrderCode) {
        console.warn('[PayOS Return URL]: Missing payosOrderCode. Redirecting to frontend with generic error.');
        return res.redirect(`${PAYOS_CONFIG.FRONTEND_URL}/payment-status?status=error&message=${encodeURIComponent('Thiếu thông tin giao dịch.')}`);
    }

    let frontendRedirectStatus = 'error'; // Mặc định là lỗi
    let frontendRedirectMessage = 'Có lỗi xảy ra khi xác nhận thanh toán.';
    let actualBookingId = bookingId || ''; // bookingId từ query params, hoặc chuỗi rỗng nếu không có

    try {
        // Tạo một đối tượng giả định dữ liệu giao dịch PayOS (nếu PayOS không gửi đủ chi tiết qua URL)
        // Lưu ý: Dữ liệu này không đáng tin cậy bằng webhook.
        const payosTransactionData = {
            orderCode: payosOrderCode,
            status: status || 'PAID', // Giả định là PAID nếu không có trạng thái cụ thể
        };

        // Gọi hàm helper để xử lý cập nhật trạng thái booking và tạo invoice
        const result = await processPaymentConfirmation(payosOrderCode, payosTransactionData);

        if (result.success) {
            frontendRedirectStatus = 'success';
            frontendRedirectMessage = 'Thanh toán thành công! Đơn hàng đã được xác nhận.';
            // Tìm lại booking để lấy _id chính xác
            const booking = await Booking.findOne({ payosOrderCode: payosOrderCode });
            if (booking) {
                actualBookingId = booking._id;
            }
        } else {
            // Nếu hàm xử lý trả về thất bại
            frontendRedirectStatus = 'error';
            frontendRedirectMessage = result.message || 'Xác nhận thanh toán thất bại.';
        }

    } catch (error) {
        console.error(`[PayOS Return URL]: Lỗi hệ thống khi xử lý thành công cho ${payosOrderCode}:`, error.message);
        frontendRedirectStatus = 'error';
        frontendRedirectMessage = 'Lỗi hệ thống khi xử lý thanh toán.';
    }

    // Chuyển hướng người dùng về frontend với các tham số trạng thái
    res.redirect(`${PAYOS_CONFIG.FRONTEND_URL}/payment-status?bookingId=${actualBookingId}&payosOrderCode=${payosOrderCode}&status=${frontendRedirectStatus}&message=${encodeURIComponent(frontendRedirectMessage)}`);
});

// [GET] /api/payos/cancel - Trang thông báo hủy/thất bại (Cancel URL từ PayOS)
router.get('/cancel', async (req, res) => {
    // Lấy các tham số từ URL khi PayOS redirect người dùng về
    const { bookingId, payosOrderCode, status } = req.query;

    console.log(`[PayOS Cancel URL]: Received request for bookingId: ${bookingId}, orderCode: ${payosOrderCode}, status: ${status}`);

    // Kiểm tra xem có payosOrderCode không
    if (!payosOrderCode) {
        console.warn('[PayOS Cancel URL]: Missing payosOrderCode. Redirecting to frontend with generic error.');
        return res.redirect(`${PAYOS_CONFIG.FRONTEND_URL}/payment-status?status=error&message=${encodeURIComponent('Thiếu thông tin giao dịch để hủy.')}`);
    }

    let frontendRedirectStatus = 'cancelled'; // Mặc định là hủy
    let frontendRedirectMessage = 'Thanh toán của bạn đã bị hủy.';
    let actualBookingId = bookingId || ''; // bookingId từ query params, hoặc chuỗi rỗng nếu không có

    try {
        // Gọi hàm helper để xử lý cập nhật trạng thái booking thành CANCELLED
        const reason = status || 'CANCELLED'; // Lấy trạng thái từ PayOS hoặc mặc định là CANCELLED
        const result = await processPaymentFailure(payosOrderCode, reason);

        if (result.success) {
            frontendRedirectStatus = reason.toLowerCase();
            frontendRedirectMessage = result.message || `Thanh toán đã ${reason.toLowerCase()}.`;
            // Tìm lại booking để lấy _id chính xác
            const booking = await Booking.findOne({ payosOrderCode: payosOrderCode });
            if (booking) {
                actualBookingId = booking._id;
            }
        } else {
            // Nếu hàm xử lý trả về thất bại (ví dụ: booking không tìm thấy hoặc đã PAID)
            frontendRedirectStatus = 'error';
            frontendRedirectMessage = result.message || 'Xử lý hủy thanh toán thất bại.';
        }

    } catch (error) {
        console.error(`[PayOS Cancel URL]: Lỗi hệ thống khi xử lý hủy cho ${payosOrderCode}:`, error.message);
        frontendRedirectStatus = 'error';
        frontendRedirectMessage = 'Lỗi hệ thống khi xử lý hủy thanh toán.';
    }

    // Chuyển hướng người dùng về frontend với các tham số trạng thái
    res.redirect(`${PAYOS_CONFIG.FRONTEND_URL}/payment-status?bookingId=${actualBookingId}&payosOrderCode=${payosOrderCode}&status=${frontendRedirectStatus}&message=${encodeURIComponent(frontendRedirectMessage)}`);
});

module.exports = router;