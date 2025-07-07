// src/pages/Users/PaymentStatusPage.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { resetBooking } from '../../redux/bookingSlice'; // Cần thêm action này vào bookingSlice

const PaymentStatusPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [paymentStatus, setPaymentStatus] = useState('Processing...');
    const [message, setMessage] = useState('');
    const [bookingRef, setBookingRef] = useState(''); // Để hiển thị mã booking hoặc giao dịch

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const vnp_ResponseCode = queryParams.get('vnp_ResponseCode');
        const vnp_TransactionStatus = queryParams.get('vnp_TransactionStatus');
        const vnp_TxnRef = queryParams.get('vnp_TxnRef'); // Mã giao dịch của bạn

        // Trong một hệ thống thực tế, bạn sẽ gửi vnp_TxnRef (hoặc bookingId từ OrderInfo)
        // và vnp_Amount, v.v. trở lại backend để xác nhận cuối cùng
        // bằng API truy vấn của VNPAY (vnp_Api).
        // Tuy nhiên, vì VNPAY IPN đã xử lý cập nhật trạng thái,
        // trang này chỉ cần hiển thị kết quả từ URL.

        setBookingRef(vnp_TxnRef || 'N/A');

        if (vnp_ResponseCode === '00' && vnp_TransactionStatus === '00') {
            setPaymentStatus('Payment Successful!');
            setMessage('Your booking has been confirmed.');
            // Reset booking state trong Redux sau khi thanh toán thành công
            dispatch(resetBooking());
        } else {
            setPaymentStatus('Payment Failed or Cancelled');
            // Bạn có thể parse các mã lỗi VNPAY chi tiết hơn ở đây
            setMessage(`Payment could not be completed. Response Code: ${vnp_ResponseCode}. Transaction Status: ${vnp_TransactionStatus}.`);
        }
    }, [location.search, dispatch]);

    const handleGoToBookings = () => {
        navigate('/user-bookings'); // Chuyển đến trang lịch sử booking của người dùng
    };

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center py-10 px-4">
            <div className="max-w-xl w-full bg-neutral-900 rounded-xl p-8 space-y-6 shadow-lg text-center">
                <h1 className={`text-3xl font-bold ${paymentStatus.includes('Successful') ? 'text-green-500' : 'text-red-500'}`}>
                    {paymentStatus}
                </h1>
                <p className="text-lg text-gray-300">{message}</p>
                {bookingRef !== 'N/A' && (
                    <p className="text-gray-400">Transaction Reference: <span className="font-semibold">{bookingRef}</span></p>
                )}
                
                <div className="flex justify-center gap-4 mt-8">
                    <button
                        onClick={handleGoToBookings}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold"
                    >
                        View My Bookings
                    </button>
                    <button
                        onClick={handleGoHome}
                        className="bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-2 rounded-lg"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentStatusPage;