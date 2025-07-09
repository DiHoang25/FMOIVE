import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { message } from 'antd'; // Import Ant Design message for notifications

// Path to your VNPAY icon (replace with actual path)
import VnpayIcon from '../../assets/vnpay-icon.png'; // Example: Assuming you have an icon in assets

const PaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [selectedMethod, setSelectedMethod] = useState('vnpay'); // Mặc định VNPAY
    const [isProcessingPayment, setIsProcessingPayment] = useState(false); // Ngăn chặn nhấp đúp
    // const [paymentError, setPaymentError] = useState(''); // Thay bằng Ant Design message

    // Lấy bookingId và grandTotal đã được tạo từ trang ConfirmBooking thông qua location.state
    const { bookingId: confirmedBookingId, grandTotal: grandTotalFromLocation } = location.state || {};

    // Lấy thông tin booking từ Redux để hiển thị chi tiết đơn hàng
    // Dữ liệu này dùng để hiển thị lại thông tin booking cho người dùng xem
    const {
        grandTotal: grandTotalFromRedux, // Redux grandTotal for display
        totalSeatPrice,
        totalComboPrice,
        selectedSeats,
        selectedCombos,
        serviceFee, // Ensure serviceFee is available in Redux bookingSlice
    } = useSelector((state) => state.booking);

    // Sử dụng grandTotal từ location.state làm nguồn chính cho số tiền thanh toán
    // Nếu không có trong location.state (trường hợp hiếm, ví dụ refresh trang), fallback về Redux
    const finalPaymentAmount = grandTotalFromLocation || grandTotalFromRedux || 0;

    const ticketCount = selectedSeats ? selectedSeats.length : 0;
    const comboCount = selectedCombos ? selectedCombos.reduce((sum, combo) => sum + combo.quantity, 0) : 0;

    const paymentMethods = [
        {
            id: 'vnpay',
            label: 'VN Pay',
            desc: 'Scan to pay with VN Pay (Sandbox)',
            icon: VnpayIcon // Use the imported icon
        },
        // Thêm các phương thức khác (ví dụ: MoMo, Credit Card)
    ];

    // Optional: useEffect để kiểm tra nếu không có bookingId
    useEffect(() => {
        if (!confirmedBookingId) {
            message.error('Booking details missing. Please go back to confirm your booking.');
            // Có thể navigate người dùng trở lại trang ConfirmBooking
            // navigate('/confirm-booking'); // Uncomment this if you want to force redirect
        }
    }, [confirmedBookingId, navigate]);


    const handleInitiatePayment = async () => {
        if (isProcessingPayment) return;

        if (!confirmedBookingId) {
            message.error('Booking ID is missing. Please go back to confirm your booking.');
            return;
        }

        setIsProcessingPayment(true);
        // setPaymentError(''); // No need if using Ant Design message

        try {
            const token = localStorage.getItem('token'); // Lấy JWT token
            if (!token) {
                message.error('Authentication required. Please log in.');
                setIsProcessingPayment(false);
                return;
            }

            const response = await fetch('http://localhost:5000/api/payment/create_payment_url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Gửi token
                },
                body: JSON.stringify({
                    bookingId: confirmedBookingId,
                    grandTotal: finalPaymentAmount, // Gửi số tiền cuối cùng để thanh toán
                    bankCode: selectedMethod === 'vnpay' ? '' : '', // Để trống nếu VNPAY sẽ hiển thị danh sách bank
                    language: 'vn'
                }),
            });

            const data = await response.json();

            if (response.ok) {
                message.loading('Redirecting to VNPAY...', 1.5); // Show loading message
                // Chuyển hướng người dùng đến URL VNPAY
                window.location.href = data.vnpUrl;
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
        <div className="min-h-screen bg-black text-white flex items-center justify-center py-10 px-4">
            <div className="max-w-md w-full bg-neutral-900 rounded-xl p-6 space-y-6 shadow-lg relative">

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 text-white bg-gray-700 hover:bg-gray-600 px-4 py-1 rounded"
                >
                    ← Back
                </button>

                <div>
                    <h1 className="text-xl font-bold text-center">Complete Your Payment</h1>
                </div>

                {/* Removed paymentError display here, Ant Design message handles it */}

                {/* Payment Methods */}
                <div className="space-y-3">
                    {paymentMethods.map((method) => (
                        <button
                            key={method.id}
                            onClick={() => setSelectedMethod(method.id)}
                            className={`w-full text-left px-4 py-3 rounded border ${
                                selectedMethod === method.id
                                    ? 'border-red-600 bg-zinc-900'
                                    : 'border-zinc-800 bg-zinc-800'
                            } flex items-center gap-3`}
                        >
                            {method.icon && <img src={method.icon} alt={method.label} className="w-8 h-8 object-contain" />}
                            <div>
                                <p className="font-semibold">{method.label}</p>
                                <p className="text-sm text-gray-400">{method.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Price Summary */}
                <div className="bg-zinc-800 rounded p-4 text-sm space-y-2">
                    <div className="flex justify-between">
                        <span>Movie Tickets ({ticketCount})</span>
                        <span>{(totalSeatPrice || 0).toLocaleString('vi-VN')} VND</span>
                    </div>
                    {comboCount > 0 && (
                        <div className="flex justify-between">
                            <span>Popcorns & Drink ({comboCount})</span>
                            <span>{(totalComboPrice || 0).toLocaleString('vi-VN')} VND</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span>Service Fee</span>
                        <span>{(serviceFee || 0).toLocaleString('vi-VN')} VND</span>
                    </div>
                    {/* Thêm voucher discount nếu có */}
                    {/* Bạn cần lấy voucherDiscount từ Redux hoặc tính lại nếu nó ảnh hưởng đến grandTotal */}
                    {/* Ví dụ:
                    {voucherDiscount > 0 && (
                        <div className="flex justify-between text-green-400">
                            <span>Voucher Discount</span>
                            <span>-${voucherDiscount.toLocaleString('vi-VN')} VND</span>
                        </div>
                    )}
                    */}

                    <hr className="border-gray-700" />
                    <div className="flex justify-between font-bold text-base">
                        <span>Total Amount</span>
                        <span>{finalPaymentAmount.toLocaleString('vi-VN')} VND</span> {/* Display final amount */}
                    </div>
                </div>

                {/* Confirm Notice */}
                <p className="text-xs text-center text-white bg-red-600 rounded py-2 font-semibold">
                    You'll be directed to the third-party payment gateway to complete your transaction.
                </p>

                {/* Payment Button */}
                <button
                    onClick={handleInitiatePayment}
                    className={`w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg text-lg
                                ${isProcessingPayment ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isProcessingPayment}
                >
                    {isProcessingPayment ? 'Redirecting...' : `Pay ${finalPaymentAmount.toLocaleString('vi-VN')} VND`}
                </button>
            </div>
        </div>
    );
};

export default PaymentPage;