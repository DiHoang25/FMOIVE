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

/**
 * [GET] /api/payos/payment-link/:paymentLinkId
 * Lấy thông tin chi tiết của một link thanh toán đã tạo.
 */
router.get('/payment-link/:paymentLinkId', async (req, res) => {
    const { paymentLinkId } = req.params;

    if (!paymentLinkId) {
        return res.status(400).json({ message: 'Payment Link ID là bắt buộc.' });
    }

    try {
        const headers = {
            'x-client-id': PAYOS_CONFIG.CLIENT_ID,
            'x-api-key': PAYOS_CONFIG.API_KEY,
            'Content-Type': 'application/json'
        };

        const url = `${PAYOS_CONFIG.API_URL}/v2/payment-requests/${paymentLinkId}`;
        console.log(`[PayOS] Getting payment link info for ID: ${paymentLinkId}`);

        const payosResponse = await axios.get(url, { headers });

        if (payosResponse.data && payosResponse.data.code === '00') {
            res.status(200).json(payosResponse.data.data);
        } else {
            res.status(404).json({ message: 'Không tìm thấy link thanh toán hoặc có lỗi xảy ra.', error: payosResponse.data });
        }
    } catch (error) {
        console.error(`Lỗi khi lấy thông tin link thanh toán ${paymentLinkId}:`, error.response ? error.response.data : error.message);
        res.status(error.response?.status || 500).json({
            message: 'Lỗi hệ thống khi lấy thông tin link thanh toán.',
            error: error.response ? error.response.data : error.message
        });
    }
});

/**
 * [POST] /api/payos/payment-link/:paymentLinkId/cancel
 * Hủy một link thanh toán chưa được hoàn thành.
 */
router.post('/payment-link/:paymentLinkId/cancel', async (req, res) => {
    const { paymentLinkId } = req.params;
    // Bỏ dòng lấy cancellationReason từ req.body
    // const { cancellationReason } = req.body; // Lý do hủy (tùy chọn)

    if (!paymentLinkId) {
        return res.status(400).json({ message: 'Payment Link ID là bắt buộc.' });
    }

    try {
        const headers = {
            'x-client-id': PAYOS_CONFIG.CLIENT_ID,
            'x-api-key': PAYOS_CONFIG.API_KEY,
            'Content-Type': 'application/json'
        };

        // Loại bỏ body nếu không có lý do hủy, hoặc gửi body rỗng {} nếu API yêu cầu body POST
        const body = {}; // Gửi body rỗng
        const url = `${PAYOS_CONFIG.API_URL}/v2/payment-requests/${paymentLinkId}/cancel`;
        console.log(`[PayOS] Cancelling payment link ID: ${paymentLinkId}`);

        const payosResponse = await axios.post(url, body, { headers }); // Đảm bảo gửi body rỗng

        if (payosResponse.data && payosResponse.data.code === '00') {
            // Cập nhật trạng thái booking trong DB
            // Nên tìm booking bằng payosOrderCode hoặc trường bạn đã lưu từ PayOS
            // Nếu bạn lưu paymentLinkId trong booking, thì code này hợp lệ
            const booking = await Booking.findOne({ payosOrderCode: orderCode });
            if (booking && booking.status === 'PENDING_PAYMENT') {
                booking.status = 'CANCELLED';
                await booking.save();
                console.log(`[PayOS Cancel] Booking ${booking._id} updated to CANCELLED.`);
            } else if (booking) {
                console.log(`[PayOS Cancel] Booking ${booking._id} đã có trạng thái khác, không cập nhật.`);
            } else {
                console.warn(`[PayOS Cancel] Booking với paymentLinkId ${paymentLinkId} không tìm thấy.`);
            }
            res.status(200).json(payosResponse.data.data);
        } else {
            console.error('Hủy link thanh toán thất bại từ PayOS API:', payosResponse.data);
            res.status(400).json({ message: 'Hủy link thanh toán thất bại.', error: payosResponse.data });
        }
    } catch (error) {
        console.error(`Lỗi khi hủy link thanh toán ${paymentLinkId}:`, error.response ? error.response.data : error.message);
        res.status(error.response?.status || 500).json({
            message: 'Lỗi hệ thống khi hủy link thanh toán.',
            error: error.response ? error.response.data : error.message
        });
    }
});


/**
 * [POST] /api/payos/webhook
 * Xử lý webhook từ PayOS. Đây là tuyến quan trọng nhất để xác nhận thanh toán.
 */
router.post('/webhook', async (req, res) => {
    const webhookPayload = req.body;
    console.log('[PayOS Webhook] Received Data:', JSON.stringify(webhookPayload, null, 2));

    // Theo tài liệu PayOS, webhook payload có dạng { code, desc, data, signature }
    const { code, data, signature } = webhookPayload;

    if (!data || !signature) {
        console.warn('[PayOS Webhook] Thiếu data hoặc signature.');
        // Phản hồi 200 để PayOS không gửi lại
        return res.status(200).json({ message: 'Invalid payload' });
    }

    try {
        // 1. XÁC MINH CHỮ KÝ WEBHOOK
        const isVerified = verifyWebhookSignature(data, PAYOS_CONFIG.WEBHOOK_SECRET, signature);

        if (!isVerified) {
            console.warn('[PayOS Webhook] Chữ ký webhook không hợp lệ!');
            return res.status(200).json({ message: 'Invalid signature' });
        }

        console.log('[PayOS Webhook] Chữ ký hợp lệ.');

        // 2. XỬ LÝ DỮ LIỆU WEBHOOK
        const { orderCode, status } = data;

        // Tìm Booking bằng `payosOrderCode` đã lưu trước đó
        const booking = await Booking.findOne({ payosOrderCode: orderCode });

        if (!booking) {
            console.warn(`[PayOS Webhook] Không tìm thấy Booking cho orderCode ${orderCode}.`);
            return res.status(200).json({ message: 'Booking not found' });
        }

        // 3. CẬP NHẬT TRẠNG THÁI BOOKING VÀ TẠO INVOICE (Idempotency Check)
        // Chỉ xử lý nếu booking đang ở trạng thái chờ thanh toán
        if (booking.status !== 'PENDING_PAYMENT') {
            console.log(`[PayOS Webhook] Booking ${booking.bookingId} đã được xử lý trước đó. Trạng thái hiện tại: ${booking.status}. Bỏ qua.`);
            return res.status(200).json({ message: 'Booking already processed' });
        }

        if (code === '00' && status === 'PAID') {
            booking.status = 'PAID';
            await booking.save();
            console.log(`[PayOS Webhook] Booking ${booking.bookingId} đã được cập nhật thành PAID.`);

            // Tạo Invoice mới
            const newInvoice = new Invoice({
                invoiceId: `INV-${Date.now()}`,
                booking: booking._id,
                user: booking.user,
                amount: booking.grandTotal,
                status: 'PAID',
                paymentMethod: 'PAYOS',
                payosDetails: data // Lưu toàn bộ chi tiết giao dịch từ PayOS
            });
            await newInvoice.save();
            console.log(`[PayOS Webhook] Invoice ${newInvoice.invoiceId} đã được tạo.`);

            // TODO: Gửi email, SMS, hoặc thông báo WebSocket cho người dùng tại đây

        } else {
            // Các trạng thái khác: CANCELLED, EXPIRED
            booking.status = 'CANCELLED'; // Hoặc 'FAILED' tùy logic của bạn
            await booking.save();
            console.log(`[PayOS Webhook] Booking ${booking.bookingId} đã được cập nhật thành ${booking.status} do giao dịch thất bại/hủy.`);
        }

        // Phản hồi thành công cho PayOS
        res.status(200).json({ message: 'Webhook processed successfully' });

    } catch (error) {
        console.error('[PayOS Webhook] Lỗi khi xử lý webhook:', error);
        // Luôn trả về 200 để PayOS không gửi lại webhook, tránh vòng lặp lỗi
        res.status(200).json({ message: 'Internal server error' });
    }
});


/**
 * [POST] /api/payos/confirm-webhook
 * API dùng để đăng ký hoặc cập nhật webhook URL với PayOS.
 * Bạn chỉ cần gọi API này một lần khi thiết lập hoặc khi thay đổi URL.
 */
router.post('/confirm-webhook', async (req, res) => {
    const { webhookUrl } = req.body;

    if (!webhookUrl) {
        return res.status(400).json({ message: 'webhookUrl là bắt buộc.' });
    }

    try {
        const headers = {
            'x-client-id': PAYOS_CONFIG.CLIENT_ID,
            'x-api-key': PAYOS_CONFIG.API_KEY,
            'Content-Type': 'application/json'
        };

        const body = { webhookUrl };
        const url = `${PAYOS_CONFIG.API_URL}/v2/webhooks`;
        console.log(`[PayOS] Registering webhook URL: ${webhookUrl}`);

        const payosResponse = await axios.post(url, body, { headers });

        res.status(payosResponse.status).json(payosResponse.data);

    } catch (error) {
        console.error('Lỗi khi đăng ký webhook:', error.response ? error.response.data : error.message);
        res.status(error.response?.status || 500).json({
            message: 'Lỗi hệ thống khi đăng ký webhook.',
            error: error.response ? error.response.data : error.message
        });
    }
});


/**
 * [GET] /api/payos/status/:bookingId
 * Frontend sẽ gọi API này để kiểm tra trạng thái cuối cùng của booking sau khi
 * người dùng được điều hướng từ PayOS về website.
 */
router.get('/status/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;
        // Dùng `findById` vì `bookingId` từ param là `_id` của Mongoose
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking không tìm thấy.' });
        }

        const invoice = await Invoice.findOne({ booking: booking._id });

        res.status(200).json({
            bookingId: booking.bookingId, // Trả về mã booking dễ đọc cho người dùng
            bookingStatus: booking.status,
            totalAmount: booking.grandTotal,
            paymentInfo: invoice ? {
                invoiceId: invoice.invoiceId,
                invoiceStatus: invoice.status,
                paymentMethod: invoice.paymentMethod,
                paidAt: invoice.payosDetails?.paidAt || invoice.createdAt
            } : null,
        });
    } catch (error) {
        console.error('Lỗi khi lấy trạng thái booking/invoice:', error.message);
        res.status(500).json({ message: 'Lỗi hệ thống khi lấy trạng thái.' });
    }
});

module.exports = router;