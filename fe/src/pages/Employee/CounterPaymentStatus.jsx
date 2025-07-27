import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { resetBooking } from '../../redux/bookingSlice';

const CounterPaymentStatusPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [paymentStatus, setPaymentStatus] = useState('Processing...');
    const [message, setMessage] = useState('Processing your payment result...');
    const [bookingRef, setBookingRef] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Sử dụng useRef để tránh gọi useEffect nhiều lần
    const hasProcessed = useRef(false);

    useEffect(() => {
        // Kiểm tra đã xử lý chưa
        if (hasProcessed.current) {
            return;
        }
        hasProcessed.current = true;

        const queryParams = new URLSearchParams(location.search);
        const txnRef = queryParams.get('vnp_TxnRef');
        const responseCode = queryParams.get('vnp_ResponseCode');
        const transactionStatus = queryParams.get('vnp_TransactionStatus');

        setBookingRef(txnRef || 'N/A');

        console.log('Payment Status Page - Query Params:', {
            txnRef,
            responseCode,
            transactionStatus
        });

        const processPaymentResult = () => {
            setIsLoading(true);

            try {
                if (!responseCode || !transactionStatus) {
                    setPaymentStatus('No Payment Data Found');
                    setMessage('Could not find payment transaction data in the URL.');
                    setIsLoading(false);
                    return;
                }

                if (responseCode === '00' && transactionStatus === '00') {
                    setPaymentStatus('Payment Successful!');
                    setMessage('Your booking has been successfully confirmed and paid. Thank you for your purchase!');
                    dispatch(resetBooking());
                } else if (responseCode === '24') {
                    setPaymentStatus('Payment Cancelled');
                    setMessage('Payment was cancelled by user. Your booking is not confirmed.');
                } else if (responseCode === '97') {
                    setPaymentStatus('Invalid Signature');
                    setMessage('Payment verification failed due to invalid signature. Please contact support.');
                } else if (responseCode === '99') {
                    setPaymentStatus('System Error');
                    setMessage('A system error occurred during payment processing. Please contact support.');
                } else {
                    setPaymentStatus('Payment Failed');
                    setMessage(`Payment failed with code: ${responseCode}. Transaction status: ${transactionStatus}. Please try again or contact support.`);
                }

            } catch (error) {
                console.error('Error processing payment result:', error);
                setPaymentStatus('Processing Error');
                setMessage('An error occurred while processing the payment result.');
            } finally {
                setIsLoading(false);
            }
        };

        // Xử lý ngay khi có đủ thông tin từ URL params
        processPaymentResult();

    }, [location.search, dispatch]);

    const handleGoToBookings = () => {
        navigate('/employee/counter-booking-list');
    };

    const handleGoHome = () => {
        navigate('/employee');
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center py-10 px-4">
            <div className="max-w-xl w-full bg-neutral-900 rounded-xl p-8 space-y-6 shadow-lg text-center">
                {isLoading ? (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
                        <h1 className="text-3xl font-bold text-yellow-500">Processing Payment...</h1>
                        <p className="text-lg text-gray-300">Please wait while we verify your transaction.</p>
                        <p className="text-gray-400">Transaction Reference: <span className="font-semibold">{bookingRef}</span></p>
                    </>
                ) : (
                    <>
                        <div className="mb-4">
                            {paymentStatus.includes('Successful') ? (
                                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                            ) : (
                                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </div>
                            )}
                        </div>

                        <h1 className={`text-3xl font-bold ${paymentStatus.includes('Successful') ? 'text-green-500' : 'text-red-500'}`}>
                            {paymentStatus}
                        </h1>
                        <p className="text-lg text-gray-300">{message}</p>
                        {bookingRef !== 'N/A' && (
                            <p className="text-gray-400">Transaction Reference: <span className="font-semibold">{bookingRef}</span></p>
                        )}
                        
                        <div className="flex justify-center gap-4 mt-8">
                            {paymentStatus.includes('Successful') && (
                                <button
                                    onClick={handleGoToBookings}
                                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                                >
                                    View Bookings List
                                </button>
                            )}
                            <button
                                onClick={handleGoHome}
                                className="bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-2 rounded-lg transition-colors"
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

export default CounterPaymentStatusPage;