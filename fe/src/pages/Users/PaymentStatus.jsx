import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { resetBooking } from '../../redux/bookingSlice'; // Đảm bảo action này được định nghĩa

const PaymentStatusPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [paymentStatus, setPaymentStatus] = useState('Processing...');
    const [message, setMessage] = useState('');
    const [bookingRef, setBookingRef] = useState(''); // Để hiển thị mã booking hoặc giao dịch

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const statusParam = queryParams.get('vnp_ResponseCode'); // Lấy vnp_ResponseCode
        const transactionStatusParam = queryParams.get('vnp_TransactionStatus'); // Lấy vnp_TransactionStatus
        const txnRefParam = queryParams.get('vnp_TxnRef'); // Lấy vnp_TxnRef (chính là bookingId của bạn)

        setBookingRef(txnRefParam || 'N/A');

        // Logic hiển thị trạng thái dựa trên VNPAY Response Code và Transaction Status
        if (statusParam === '00' && transactionStatusParam === '00') {
            setPaymentStatus('Payment Successful!');
            setMessage('Your booking has been successfully confirmed and paid.');
            // Reset booking state trong Redux sau khi thanh toán thành công
            dispatch(resetBooking());
        } else {
            setPaymentStatus('Payment Failed or Cancelled');
            let errorMessage = `Payment could not be completed.`;
            if (statusParam) errorMessage += ` VNPAY Response Code: ${statusParam}.`;
            if (transactionStatusParam) errorMessage += ` Transaction Status: ${transactionStatusParam}.`;
            // Bạn có thể thêm các thông báo chi tiết hơn dựa vào bảng mã lỗi VNPAY nếu muốn
            setMessage(errorMessage);
        }

        // Tùy chọn: Sau khi hiển thị trạng thái, bạn có thể chuyển hướng sau một thời gian
        // setTimeout(() => {
        //     navigate('/user-bookings');
        // }, 5000); // Ví dụ: chuyển hướng sau 5 giây
        
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