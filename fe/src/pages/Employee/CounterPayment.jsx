import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { message } from 'antd'; // Import Ant Design message for notifications

// Path to your VNPAY icon (replace with actual path)
import VnpayIcon from '../../assets/vnpay-icon.png'; // Example: Assuming you have an icon in assets

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";


const PaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [selectedMethod, setSelectedMethod] = useState('vnpay'); // Mặc định VNPAY
    const [isProcessingPayment, setIsProcessingPayment] = useState(false); // Ngăn chặn nhấp đúp

    // Lấy thông tin người dùng từ Redux store
    const user = useSelector((state) => state.booking.user);
    console.log("Thông tin người dùng trên PaymentPage:", user);

    // Lấy TẤT CẢ booking details đã được tạo từ trang CounterConfirm thông qua location.state
    const {
        bookingId: confirmedBookingId,
        grandTotal: grandTotalFromLocation, // This is the finalTotal passed from CounterConfirm
        movieDetails,
        selectedSeats,
        selectedCombos,
        selectedProducts, // New: products passed from CounterConfirm
        ticketPrice,     // New: ticketPrice from CounterConfirm
        combosTotal,     // New: combosTotal from CounterConfirm
        productsTotal,   // New: productsTotal from CounterConfirm
        finalTotal,      // New: finalTotal from CounterConfirm (same as grandTotalFromLocation)
        voucherCode,     // New: voucherCode from CounterConfirm
        voucherDiscount, // New: voucherDiscount from CounterConfirm
        userInformation, // New: userInformation (from Redux, passed via state for consistency)
    } = location.state || {};

    // Use finalTotal from location.state as the primary source for the payment amount
    const finalPaymentAmount = finalTotal || 0;

    // Derived counts for display
    const ticketCount = useMemo(() => selectedSeats ? selectedSeats.length : 0, [selectedSeats]);
    const comboCount = useMemo(() => selectedCombos ? selectedCombos.reduce((sum, combo) => sum + combo.quantity, 0) : 0, [selectedCombos]);
    const productCount = useMemo(() => selectedProducts ? selectedProducts.reduce((sum, product) => sum + product.quantity, 0) : 0, [selectedProducts]);


    const paymentMethods = [
        {
            id: 'vnpay',
            label: 'VN Pay',
            desc: 'Scan to pay with VN Pay (Sandbox)',
            icon: VnpayIcon // Use the imported icon
        },
        // Thêm các phương thức khác (ví dụ: MoMo, Credit Card)
    ];

    // useEffect to check if bookingId is missing
    useEffect(() => {
        if (!confirmedBookingId) {
            message.error('Booking details missing. Please go back to confirm your booking.');
            // Optionally navigate user back
            // navigate('/employee/counter-confirm');
        }
    }, [confirmedBookingId, navigate]);


    const handleInitiatePayment = async () => {
        if (isProcessingPayment) return;

        if (!confirmedBookingId) {
            message.error('Booking ID is missing. Please go back to confirm your booking.');
            return;
        }

        // Kiểm tra thông tin người dùng trước khi gửi yêu cầu thanh toán (tùy chọn)
        // Prefer user from location state, fallback to Redux user if needed
        const currentUser = userInformation || user;

        if (!currentUser || !currentUser._id) { // Kiểm tra _id thay vì userId
            message.error('User information missing. Please ensure you are logged in correctly.');
            setIsProcessingPayment(false);
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

            const response = await fetch(`${API_BASE_URL}/api/payment/create_payment_url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Gửi token
                },
                body: JSON.stringify({
                    bookingId: confirmedBookingId,
                    grandTotal: finalPaymentAmount, // Gửi số tiền cuối cùng để thanh toán
                    bankCode: selectedMethod === 'vnpay' ? '' : '', // Để trống nếu VNPAY sẽ hiển thị danh sách bank
                    language: 'vn',
                    userId: currentUser._id, // Truyền userId từ thông tin người dùng
                }),
            });

            const data = await response.json();

            if (response.ok) {
                message.loading('Redirecting to VNPAY...', 1.5); // Show loading message
                // Chuyển hướng người dùng đến URL VNPAY
                window.location.href = data.paymentUrl;
            } else {
                message.error(data.message || 'Failed to initiate payment.');
                console.error('Payment initiation failed:', data.message);
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
                        <span>{(ticketPrice || 0).toLocaleString('vi-VN')} VND</span>
                    </div>
                    {comboCount > 0 && (
                        <div className="flex justify-between items-center text-gray-300">
                            <span>Popcorns & Drinks ({comboCount})</span>
                            <span>{(combosTotal || 0).toLocaleString('vi-VN')} VND</span>
                        </div>
                    )}
                    {productCount > 0 && (
                        <div className="flex justify-between items-center text-gray-300">
                            <span>Additional Products ({productCount})</span>
                            <span>{(productsTotal || 0).toLocaleString('vi-VN')} VND</span>
                        </div>
                    )}
                    {voucherDiscount > 0 && (
                        <div className="flex justify-between items-center text-green-400 font-medium border-t border-slate-600/50 pt-3 mt-3">
                            <span>Voucher Discount</span>
                            <span>-${voucherDiscount.toLocaleString('vi-VN')} VND</span>
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