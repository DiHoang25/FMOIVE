// src/config/vnpayConfig.js vnPay Credentials configuration
require('dotenv').config(); // Load environment variables

module.exports = {
    vnp_TmnCode: process.env.VNP_TMNCODE,
    vnp_HashSecret: process.env.VNP_HASHSECRET,
    vnp_Url: process.env.VNP_URL_SANDBOX || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.htm",
    vnp_ReturnUrl: process.env.VNP_RETURN_URL_FRONTEND, // URL frontend sau khi thanh toán thành công/thất bại
    vnp_Ip_Address: '127.0.0.1', // Địa chỉ IP của máy chủ gọi VNPAY (hoặc IP của người dùng)
    vnp_Api: process.env.VNP_API || "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction", // API để truy vấn trạng thái giao dịch (nếu cần)

    // Your backend IPN URL where VNPAY sends callbacks
    vnp_IpnUrl: process.env.VNP_IPN_URL_BACKEND || "http://localhost:5000/api/payment/vnpay_ipn", // Sẽ định nghĩa sau
};