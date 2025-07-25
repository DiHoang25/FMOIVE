import React, { useEffect, useState, useRef } from 'react'; // Thêm useRef
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetBooking } from '../../redux/bookingSlice';
import axios from 'axios';
import {
  setUser,
} from "../../redux/bookingSlice";

const PaymentStatusPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [paymentStatus, setPaymentStatus] = useState('Processing...');
    const [message, setMessage] = useState('Verifying payment status with the server...');
    const [bookingRef, setBookingRef] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const user = useSelector((state) => state.booking.user);
    const roleRef = useRef(user?.role || 'customer');


    // Sử dụng useRef để tạo cờ chỉ gọi một lần, không kích hoạt re-render
    const hasFetched = useRef(false);

    // Đảm bảo URL này CHÍNH XÁC là URL của BACKEND của bạn
    const BACKEND_BASE_URL = 'http://localhost:5000';


const loadAllData = async () => {
    try {
    const token = localStorage.getItem("token");
        if (token) {
          const response = await axios.get("http://localhost:5000/api/user/profile", {
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
        // console.count('useEffect triggered'); // Dùng để debug số lần useEffect chạy

        // Dùng cờ useRef để đảm bảo API chỉ gọi 1 lần khi component mount
        if (hasFetched.current) {
            console.log('API call already initiated, skipping.');
            return;
        }

        const queryParams = new URLSearchParams(location.search);
        const txnRefParam = queryParams.get('vnp_TxnRef');
        setBookingRef(txnRefParam || 'N/A');

        const vnpayQueryParams = {};
        for (let pair of queryParams.entries()) {
            vnpayQueryParams[pair[0]] = pair[1];
        }

        if (Object.keys(vnpayQueryParams).length === 0) {
            setPaymentStatus('No Payment Data Found');
            setMessage('Could not find payment transaction data in the URL.');
            setIsLoading(false);
            return;
        }

        const verifyPaymentWithBackend = async () => {
            setIsLoading(true);
            try {
                // Đặt cờ này để không gọi lại trong các lần render sau
                hasFetched.current = true; // <-- Cập nhật cờ useRef

                const queryString = new URLSearchParams(vnpayQueryParams).toString();
                const requestUrl = `${BACKEND_BASE_URL}/api/payment/vnpay_return?${queryString}`;

                console.log('Frontend is attempting to call Backend URL:', requestUrl); // Giữ lại log này

                // Lời gọi axios.get ĐÚNG ĐỊA CHỈ
                const response = await axios.get(requestUrl);

                // Logic xử lý phản hồi từ Backend (status 200 OK)
                const statusParam = queryParams.get('vnp_ResponseCode');
                console.log("statusParam:", statusParam);
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

                // Kiểm tra xem backend có gửi redirectUrl về không
                if (response.data && response.data.redirectUrl) {
                    console.log('Redirecting to URL from backend:', response.data.redirectUrl);
                    navigate(response.data.redirectUrl); // Frontend điều hướng tới URL nhận được
                    return; // Dừng xử lý tiếp trong component này
                }
            } catch (error) {
                console.error('Error verifying payment with backend:', error);
                // Xử lý lỗi cụ thể nếu backend trả về 404/500
                if (axios.isAxiosError(error) && error.response) {
                    // Lỗi từ phản hồi của backend (ví dụ: backend cũng trả về 404 cho booking không tồn tại)
                    setPaymentStatus('Verification Error (Backend Response)');
                    setMessage(`Server responded with error: ${error.response.status} - ${error.response.data?.message || error.message}. Please check your transaction history.`);
                } else {
                    // Lỗi mạng hoặc lỗi không xác định
                    setPaymentStatus('Verification Error (Network/Client)');
                    setMessage('An error occurred while communicating with the server. Please check your transaction history or contact support.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        verifyPaymentWithBackend();

    }, [location.search, dispatch, navigate]);

    // hasFetched không cần trong dependencies vì nó là useRef

    // ... (các hàm handleGoToBookings, handleGoHome và JSX render phần còn lại) ...
    const handleGoToBookings = () => {
        if (roleRef.current === 'employee') {
            navigate('/employee/counter-booking-list');
        } else {
            navigate('/viewbookedticket');
        }
    };

    const handleGoHome = () => {
        if (roleRef.current === 'employee') {
            navigate('/employee');
        } else {
            navigate('/');
        }
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