import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { resetBooking } from '../../redux/bookingSlice';
import axios from 'axios';

const PaymentStatusPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [paymentStatus, setPaymentStatus] = useState('Processing...');
    const [message, setMessage] = useState('Verifying payment status with the server...');
    const [bookingRef, setBookingRef] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const BACKEND_BASE_URL = 'http://localhost:5000'; 

    const [hasCalledBackend, setHasCalledBackend] = useState(false);
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const txnRefParam = queryParams.get('vnp_TxnRef');
        setBookingRef(txnRefParam || 'N/A');

        // Lấy tất cả các tham số từ URL và tạo thành một đối tượng để dễ dàng làm việc
        const vnpayQueryParams = {};
        for (let pair of queryParams.entries()) {
            vnpayQueryParams[pair[0]] = pair[1];
        }

        // Kiểm tra xem có tham số VNPAY không
        if (Object.keys(vnpayQueryParams).length === 0) {
            setPaymentStatus('No Payment Data Found');
            setMessage('Could not find payment transaction data in the URL.');
            setIsLoading(false);
            return;
        }

        const verifyPaymentWithBackend = async () => {
            setIsLoading(true);
            try {
                // TỰ XÂY DỰNG CHUỖI QUERY STRING TỪ vnpayQueryParams
                const queryString = new URLSearchParams(vnpayQueryParams).toString();
                
                // Nối chuỗi query string vào URL của backend
                const requestUrl = `${BACKEND_BASE_URL}/api/payment/vnpay_return?${queryString}`;
                console.log('Frontend is attempting to call Backend URL:', requestUrl); //debug lỏd
                const response = await axios.get(requestUrl); // KHÔNG CẦN DÙNG params: vnpayQueryParams ở đây nữa
                
                // Logic xử lý phản hồi vẫn giữ nguyên
                const statusParam = queryParams.get('vnp_ResponseCode');
                const transactionStatusParam = queryParams.get('vnp_TransactionStatus');

                if (statusParam === '00' && transactionStatusParam === '00') {
                    setPaymentStatus('Payment Successful!');
                    setMessage('Your booking has been successfully confirmed and paid. Database updated.');
                    dispatch(resetBooking());
                } else {
                    setPaymentStatus('Payment Failed or Cancelled');
                    let errorMessage = `Payment could not be completed.`;
                    if (statusParam) errorMessage += ` VNPAY Response Code: ${statusParam}.`;
                    if (transactionStatusParam) errorMessage += ` Transaction Status: ${transactionStatusParam}.`;
                    setMessage(errorMessage + " Please check your transaction history.");
                }

            } catch (error) {
                console.error('Error verifying payment with backend:', error);
                setPaymentStatus('Verification Error');
                setMessage('An error occurred while verifying your payment with the server. Please check your transaction history or contact support.');
            } finally {
                setIsLoading(false);
            }
        };

        verifyPaymentWithBackend();

    }, [location.search, dispatch, navigate]);

    const handleGoToBookings = () => {
        navigate('/viewbookedticket'); // Chuyển đến trang lịch sử booking của người dùng
    };

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center py-10 px-4">
            <div className="max-w-xl w-full bg-neutral-900 rounded-xl p-8 space-y-6 shadow-lg text-center">
                {isLoading ? (
                    <>
                        <h1 className="text-3xl font-bold text-yellow-500">Processing Payment...</h1>
                        <p className="text-lg text-gray-300">Please wait while we verify your transaction.</p>
                        <p className="text-gray-400">Transaction Reference: <span className="font-semibold">{bookingRef}</span></p>
                    </>
                ) : (
                    <>
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
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentStatusPage;