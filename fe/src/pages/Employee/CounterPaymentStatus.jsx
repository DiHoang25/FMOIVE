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
    const [reference, setReference] = useState(''); // Sử dụng reference chung cho cả txnRef và invoiceId
    const [isLoading, setIsLoading] = useState(true);

    const hasProcessed = useRef(false);

    useEffect(() => {
        if (hasProcessed.current) {
            return;
        }
        hasProcessed.current = true;

        setIsLoading(true);

        const processPaymentResult = () => {
            // Case 1: Xử lý thanh toán tiền mặt (Cash Payment)
            const { paymentMethod, status, bookingId, invoiceId, message: stateMessage } = location.state || {};

            if (paymentMethod === 'cash') {
                if (status === 'success') {
                    setPaymentStatus('Payment Successful!');
                    setMessage('Your booking has been successfully confirmed and paid with cash. Thank you!');
                    setReference(invoiceId || 'N/A');
                    dispatch(resetBooking()); // Reset booking state
                } else if (status === 'failed') {
                    setPaymentStatus('Payment Failed');
                    setMessage(stateMessage || 'Thanh toán tiền mặt thất bại.');
                    setReference(bookingId || 'N/A');
                } else {
                    setPaymentStatus('Error');
                    setMessage('An unknown error occurred during cash payment confirmation.');
                    setReference(bookingId || 'N/A');
                }
                setIsLoading(false);
                return;
            }

            // Case 2: Xử lý thanh toán online (VNPay)
            const queryParams = new URLSearchParams(location.search);
            const txnRef = queryParams.get('vnp_TxnRef');
            const responseCode = queryParams.get('vnp_ResponseCode');
            const transactionStatus = queryParams.get('vnp_TransactionStatus');

            if (!responseCode || !transactionStatus) {
                setPaymentStatus('No Payment Data Found');
                setMessage('Could not find payment transaction data in the URL.');
                setReference('N/A');
                setIsLoading(false);
                return;
            }

            setReference(txnRef || 'N/A');

            if (responseCode === '00' && transactionStatus === '00') {
                setPaymentStatus('Payment Successful!');
                setMessage('Your booking has been successfully confirmed and paid via VNPay. Thank you for your purchase!');
                dispatch(resetBooking());
            } else if (responseCode === '24') {
                setPaymentStatus('Payment Cancelled');
                setMessage('Payment was cancelled by user. Your booking is not confirmed.');
            } else {
                setPaymentStatus('Payment Failed');
                setMessage(`Payment failed with code: ${responseCode}. Transaction status: ${transactionStatus}. Please try again or contact support.`);
            }

            setIsLoading(false);

        };

        processPaymentResult();

    }, [location.search, location.state, dispatch]); // Thêm location.state vào dependency array

    const handleGoToBookings = () => {
        navigate('/employee/counter-booking-list');
    };

    const handleGoHome = () => {
        navigate('/employee');
    };

    const getStatusStyles = () => {
        if (paymentStatus.includes('Successful')) {
            return {
                icon: (
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                ),
                titleClass: 'text-green-500',
            };
        } else {
            return {
                icon: (
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </div>
                ),
                titleClass: 'text-red-500',
            };
        }
    };

    const { icon, titleClass } = getStatusStyles();

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center py-10 px-4">
            <div className="max-w-xl w-full bg-neutral-900 rounded-xl p-8 space-y-6 shadow-lg text-center">
                {isLoading ? (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
                        <h1 className="text-3xl font-bold text-yellow-500">Processing Payment...</h1>
                        <p className="text-lg text-gray-300">Please wait while we verify your transaction.</p>
                        {reference && <p className="text-gray-400">Transaction Reference: <span className="font-semibold">{reference}</span></p>}
                    </>
                ) : (
                    <>
                        <div className="mb-4">
                            {icon}
                        </div>

                        <h1 className={`text-3xl font-bold ${titleClass}`}>
                            {paymentStatus}
                        </h1>
                        <p className="text-lg text-gray-300">{message}</p>
                        {reference && reference !== 'N/A' && (
                            <p className="text-gray-400">
                                {location.state?.paymentMethod === 'cash' ? 'Invoice ID: ' : 'Transaction Reference: '}
                                <span className="font-semibold">{reference}</span>
                            </p>
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