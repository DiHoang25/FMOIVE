// src/pages/User/PaymentPage/paymentStatus.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetBooking, setUser } from '../../redux/bookingSlice';
import axios from 'axios';

const PaymentStatusPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [paymentStatus, setPaymentStatus] = useState('Processing...');
    const [message, setMessage] = useState('Verifying payment status with the server...');
    const [transactionRef, setTransactionRef] = useState(''); // Để hiển thị mã giao dịch chung
    const [isLoading, setIsLoading] = useState(true);

    const user = useSelector((state) => state.booking.user);
    const hasFetched = useRef(false);

    const BACKEND_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

    const loadUserProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            if (token) {
                const response = await axios.get(`${BACKEND_BASE_URL}/api/user/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const fetchedUser = response.data.user;
                dispatch(setUser({
                    name: fetchedUser.fullname,
                    email: fetchedUser.email,
                    _id: fetchedUser._id,
                    phone: fetchedUser.phone,
                    username: fetchedUser.username,
                    gender: fetchedUser.gender,
                    address: fetchedUser.address,
                    id_card: fetchedUser.id_card,
                    role: fetchedUser.role,
                }));
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    }

    useEffect(() => {
        loadUserProfile();

        if (hasFetched.current) {
            return;
        }

        const queryParams = new URLSearchParams(location.search);

        // --- Kiểm tra xem đây là phản hồi từ VNPAY hay PayOS ---
        const vnpay_TxnRef = queryParams.get('vnp_TxnRef'); // VNPAY
        const payosOrderCode = queryParams.get('orderCode'); // PayOS

        if (vnpay_TxnRef) { // Đây là phản hồi từ VNPAY (GIỮ NGUYÊN)
            setTransactionRef(vnpay_TxnRef);
            const vnpayQueryParams = {};
            for (let pair of queryParams.entries()) {
                vnpayQueryParams[pair[0]] = pair[1];
            }

            if (Object.keys(vnpayQueryParams).length === 0) {
                setPaymentStatus('No VNPAY Data Found');
                setMessage('Could not find VNPAY transaction data in the URL.');
                setIsLoading(false);
                return;
            }

            const verifyVnPayPayment = async () => {
                setIsLoading(true);
                try {
                    hasFetched.current = true;
                    const queryString = new URLSearchParams(vnpayQueryParams).toString();
                    const requestUrl = `${BACKEND_BASE_URL}/api/vnpay-payment/vnpay_return?${queryString}`;
                    console.log('[VNPAY Status] Frontend calling Backend URL:', requestUrl);
                    const response = await axios.get(requestUrl);

                    const statusParam = queryParams.get('vnp_ResponseCode');
                    const transactionStatusParam = queryParams.get('vnp_TransactionStatus');

                    if (statusParam === '00' && transactionStatusParam === '00') {
                        setPaymentStatus('Payment Successful!');
                        setMessage('Your booking has been successfully confirmed and paid via VNPAY. Database updated.');
                        dispatch(resetBooking());
                    } else {
                        setPaymentStatus('Payment Failed or Cancelled');
                        let errorMessage = `VNPAY payment could not be completed.`;
                        if (statusParam) errorMessage += ` VNPAY Response Code: ${statusParam}.`;
                        if (transactionStatusParam) errorMessage += ` Transaction Status: ${transactionStatusParam}.`;
                        setMessage(errorMessage + " Please check your transaction history.");
                    }

                    if (response.data && response.data.redirectUrl) {
                        console.log('[VNPAY Status] Redirecting to URL from backend:', response.data.redirectUrl);
                        navigate(response.data.redirectUrl);
                        return;
                    }
                } catch (error) {
                    console.error('[VNPAY Status] Error verifying payment with backend:', error);
                    if (axios.isAxiosError(error) && error.response) {
                        setPaymentStatus('Verification Error (Backend Response)');
                        setMessage(`Server responded with error: ${error.response.status} - ${error.response.data?.message || error.message}. Please check your transaction history.`);
                    } else {
                        setPaymentStatus('Verification Error (Network/Client)');
                        setMessage('An error occurred while communicating with the server. Please check your transaction history or contact support.');
                    }
                } finally {
                    setIsLoading(false);
                }
            };
            verifyVnPayPayment();

        } else if (payosOrderCode) { // Xử lý phản hồi từ PayOS
            setTransactionRef(payosOrderCode);
            const checkPayosStatus = async () => {
                setIsLoading(true);
                hasFetched.current = true;

                try {
                    // Gọi tuyến API của backend để lấy trạng thái giao dịch từ PayOS
                    // Tuyến này sẽ tự động cập nhật database
                    const requestUrl = `${BACKEND_BASE_URL}/api/payos-payment/payment-link/${payosOrderCode}`;
                    console.log('[PayOS Status] Frontend calling Backend URL:', requestUrl);

                    const response = await axios.get(requestUrl);
                    const payosData = response.data;

                    // Giả định backend trả về status của giao dịch PayOS
                    if (payosData.status === 'PAID') {
                        setPaymentStatus('Payment Successful!');
                        setMessage('Your booking has been successfully confirmed and paid via PayOS.');
                        dispatch(resetBooking()); // Reset giỏ hàng
                    } else if (payosData.status === 'CANCELLED' || payosData.status === 'FAILED') {
                        setPaymentStatus('Payment Failed or Cancelled');
                        setMessage('Your PayOS payment failed, was cancelled, or expired. Please try again.');
                    } else if (payosData.status === 'PENDING') {
                        setPaymentStatus('Payment Pending');
                        setMessage('Your payment is being processed. We will notify you once confirmed.');
                    } else {
                        setPaymentStatus('Unknown Status');
                        setMessage('An unknown error occurred. Please check your bookings page or contact support.');
                    }
                } catch (error) {
                    console.error('[PayOS Status] Error checking payment status with backend:', error);
                    setPaymentStatus('Verification Error');
                    setMessage('An error occurred while verifying your payment status. Please check your bookings page or contact support.');
                } finally {
                    setIsLoading(false);
                }
            };
            checkPayosStatus();
        } else {
            // Không có tham số VNPAY hoặc PayOS
            setPaymentStatus('No Payment Data Found');
            setMessage('Could not find payment transaction data in the URL. Please ensure you were redirected correctly.');
            setIsLoading(false);
        }

    }, [location.search, dispatch, navigate]);

    const handleGoToBookings = () => {
        const userRole = user?.role;
        if (userRole === 'employee') {
            navigate('/employee/counter-booking-list');
        } else {
            navigate('/viewbookedticket');
        }
    };

    const handleGoHome = () => {
        const userRole = user?.role;
        if (userRole === 'employee') {
            navigate('/employee');
        } else {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl w-full bg-gradient-to-br from-neutral-800 to-neutral-950 rounded-2xl p-8 sm:p-10 space-y-8 shadow-2xl border border-gray-700 transform hover:scale-105 transition duration-300 ease-in-out">
                {isLoading ? (
                    <div className="flex flex-col items-center space-y-6">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500"></div>
                        <h1 className="text-4xl font-extrabold text-yellow-400 animate-pulse tracking-wide">Processing Payment...</h1>
                        <p className="text-lg text-gray-300 font-light text-center">
                            Please wait while we verify your transaction. This may take a few moments.
                        </p>
                        <p className="text-md text-gray-400 mt-4">
                            Transaction Reference: <span className="font-semibold text-yellow-300">{transactionRef || 'N/A'}</span>
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center space-y-8">
                        {paymentStatus.includes('Successful') ? (
                            <svg className="w-20 h-20 text-green-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        ) : (
                            <svg className="w-20 h-20 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        )}
                        <h1 className={`text-4xl font-extrabold tracking-wide ${paymentStatus.includes('Successful') ? 'text-green-400' : 'text-red-400'}`}>
                            {paymentStatus}
                        </h1>
                        <p className="text-lg text-gray-300 font-light text-center leading-relaxed">
                            {message}
                        </p>
                        {transactionRef && transactionRef !== 'N/A' && (
                            <p className="text-md text-gray-400 mt-4">
                                Transaction Reference: <span className="font-semibold text-yellow-300">{transactionRef}</span>
                            </p>
                        )}

                        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10 w-full">
                            <button
                                onClick={handleGoToBookings}
                                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-semibold text-lg shadow-lg transform hover:scale-105 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                            >
                                View My Bookings
                            </button>
                            <button
                                onClick={handleGoHome}
                                className="w-full sm:w-auto bg-zinc-700 hover:bg-zinc-600 text-white px-8 py-3 rounded-xl font-medium text-lg shadow-lg transform hover:scale-105 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-opacity-75"
                            >
                                Go Home
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentStatusPage;