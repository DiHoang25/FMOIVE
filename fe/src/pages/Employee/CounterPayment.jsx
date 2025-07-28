// src/pages/User/PaymentPage/paymentMethod.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { message } from 'antd'; // Import Ant Design message for notifications

// icon
import VnpayIcon from '../../assets/vnpay-icon.png';
import PayosIcon from '../../assets/payos.png';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const PaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Mặc định PayOS
    const [selectedMethod, setSelectedMethod] = useState('payos');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    // Lấy bookingId và grandTotal đã được tạo từ trang CounterConfirm thông qua location.state
    const { bookingId: confirmedBookingId, grandTotal: grandTotalFromLocation } = location.state || {};

    // Lấy thông tin booking từ Redux để hiển thị chi tiết đơn hàng
    const {
        grandTotal: grandTotalFromRedux, // Redux grandTotal for display
        totalSeatPrice,
        totalComboPrice,
        selectedSeats,
        selectedCombos,
        user // Lấy thông tin user từ Redux booking slice
    } = useSelector((state) => state.booking);

    // Sử dụng grandTotal từ location.state làm nguồn chính cho số tiền thanh toán
    // Nếu không có trong location.state (trường hợp hiếm, ví dụ refresh trang), fallback về Redux
    const finalPaymentAmount = grandTotalFromLocation || grandTotalFromRedux || 0;

    const ticketCount = useMemo(() => selectedSeats ? selectedSeats.length : 0, [selectedSeats]);
    const comboCount = useMemo(() => selectedCombos ? selectedCombos.reduce((sum, combo) => sum + combo.quantity, 0) : 0, [selectedCombos]);

    const paymentMethods = [
        {
            id: 'payos',
            label: 'PayOS (Napas)',
            desc: 'Secure payment via PayOS with various methods',
            icon: PayosIcon // Use the imported PayOS icon
        },
        {
            id: 'vnpay',
            label: 'VN Pay',
            desc: 'Scan to pay with VN Pay (Sandbox)',
            icon: VnpayIcon
        },
        // Thêm các phương thức khác (ví dụ: MoMo, Credit Card) nếu cần
    ];

    // useEffect để kiểm tra nếu không có bookingId
    useEffect(() => {
        if (!confirmedBookingId) {
            message.error('Booking details missing. Please go back to confirm your booking.');
            // Có thể navigate người dùng trở lại trang CounterConfirm nếu muốn bắt buộc
            // navigate('/employee/counter-confirm');
        }
    }, [confirmedBookingId, navigate]);

    const handleInitiatePayment = async () => {
        if (isProcessingPayment) return;

        if (!confirmedBookingId) {
            message.error('Booking ID is missing. Please go back to confirm your booking.');
            return;
        }

        if (finalPaymentAmount <= 0) {
            message.error('Payment amount must be greater than zero.');
            return;
        }

        // Kiểm tra thông tin người dùng từ Redux
        if (!user || !user._id) {
            message.error('User information missing. Please ensure you are logged in correctly.');
            return;
        }

        setIsProcessingPayment(true);
        try {
            const token = localStorage.getItem('token'); // Lấy JWT token
            if (!token) {
                message.error('Authentication required. Please log in.');
                setIsProcessingPayment(false);
                return;
            }

            let response;
            let data;

            if (selectedMethod === 'vnpay') {
                response = await fetch(`${API_BASE_URL}/api/vnpay-payment/create_payment_url`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        bookingId: confirmedBookingId,
                        grandTotal: finalPaymentAmount,
                        bankCode: '', // Để trống nếu VNPAY sẽ hiển thị danh sách bank
                        language: 'vn',
                        userId: user._id
                    }),
                });
                data = await response.json();

                if (response.ok) {
                    message.loading('Redirecting to VNPAY...', 1.5);
                    window.location.href = data.paymentUrl;
                } else {
                    message.error(data.message || 'Failed to initiate VNPAY payment.');
                    console.error('VNPAY payment initiation failed:', data.message);
                }
            } else if (selectedMethod === 'payos') {
                response = await fetch(`${API_BASE_URL}/api/payos-payment/create-payment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        bookingId: confirmedBookingId, // Gửi bookingId
                        // grandTotal không cần gửi ở đây vì backend sẽ lấy từ booking
                        // userId không cần gửi ở đây vì backend sẽ lấy từ booking
                    }),
                });
                data = await response.json();

                if (response.ok) {
                    message.loading('Redirecting to PayOS...', 1.5);
                    window.location.href = data.payosPaymentUrl; // PayOS trả về checkoutUrl
                } else {
                    message.error(data.message || 'Failed to initiate PayOS payment.');
                    console.error('PayOS payment initiation failed:', data.message);
                }
            } else {
                message.error('Please select a payment method.');
            }

        } catch (error) {
            console.error('Error initiating payment:', error);
            message.error('An unexpected error occurred. Please try again.');
        } finally {
            setIsProcessingPayment(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col items-center justify-center py-10 px-4">
            <div className="max-w-md w-full bg-slate-800 rounded-2xl p-8 space-y-8 shadow-2xl relative border border-slate-700">

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-6 left-6 text-gray-300 hover:text-white bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition duration-200 flex items-center gap-2 text-sm font-medium"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Confirm
                </button>

                {/* Header */}
                <div className="text-center pt-8 pb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h10m-2 5h-6M12 4v16" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                        Complete Your Payment
                    </h1>
                    <p className="text-gray-400 text-md">Choose your preferred payment method</p>
                </div>

                {/* Payment Methods */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-200">Select Method</h2>
                    {paymentMethods.map((method) => (
                        <button
                            key={method.id}
                            onClick={() => setSelectedMethod(method.id)}
                            className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.01]
                                ${selectedMethod === method.id
                                    ? 'border-red-600 bg-zinc-900 shadow-lg'
                                    : 'border-slate-700 bg-slate-700/60 hover:bg-slate-700/80'
                                } flex items-center gap-4`}
                        >
                            {method.icon && <img src={method.icon} alt={method.label} className="w-10 h-10 object-contain rounded-md" />}
                            <div>
                                <p className="font-semibold text-lg text-white">{method.label}</p>
                                <p className="text-sm text-gray-400">{method.desc}</p>
                            </div>
                            {selectedMethod === method.id && (
                                <svg className="w-6 h-6 text-red-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="bg-slate-700/50 rounded-xl p-6 text-sm space-y-4 border border-slate-600 shadow-md">
                    <h2 className="text-xl font-semibold text-gray-200 mb-4">Order Summary</h2>
                    <div className="flex justify-between items-center text-gray-300">
                        <span>Movie Tickets ({ticketCount})</span>
                        <span>{(totalSeatPrice || 0).toLocaleString('vi-VN')} VND</span>
                    </div>
                    {comboCount > 0 && (
                        <div className="flex justify-between items-center text-gray-300">
                            <span>Popcorns & Drinks ({comboCount})</span>
                            <span>{(totalComboPrice || 0).toLocaleString('vi-VN')} VND</span>
                        </div>
                    )}

                    <div className="pt-4 border-t border-slate-600/50 flex justify-between items-center font-bold text-xl text-white">
                        <span>Total Amount</span>
                        <span className="text-red-500">
                            {finalPaymentAmount.toLocaleString('vi-VN')} VND
                        </span>
                    </div>
                </div>

                {/* Confirm Notice */}
                <p className="text-xs text-center text-white bg-red-700/80 rounded-lg py-3 px-4 font-semibold border border-red-600 shadow-lg">
                    <span className="font-bold">Important:</span> You'll be securely redirected to the selected third-party payment gateway to complete your transaction.
                </p>

                {/* Payment Button */}
                <button
                    onClick={handleInitiatePayment}
                    className={`w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl text-xl transition-all duration-300 transform hover:scale-[1.02] shadow-xl
                                ${isProcessingPayment ? 'opacity-60 cursor-not-allowed flex items-center justify-center' : ''}`}
                    disabled={isProcessingPayment}
                >
                    {isProcessingPayment ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </>
                    ) : (
                        `Pay ${finalPaymentAmount.toLocaleString('vi-VN')} VND`
                    )}
                </button>
            </div>
        </div>
    );
};

export default PaymentPage;