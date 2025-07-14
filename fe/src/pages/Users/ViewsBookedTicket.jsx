import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import axios from 'axios'; // Import axios để gọi API

import UserDashboardLayout from '../../components/UserDashboardlayout';
import PaginationControls from '../../components/PaginationHomepage';
import avengers from '../../assets/avengers.jpg'; // Giữ lại ảnh mẫu cho modal

const ITEMS_PER_PAGE = 4;

// Hàm tạo captcha không thay đổi
const generateCaptcha = (length = 6) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
};

const ViewsBookedTicket = () => {
    // State để lưu trữ dữ liệu vé từ API
    const [tickets, setTickets] = useState([]);
    
    // State để quản lý trạng thái tải và lỗi
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Các state khác cho phân trang và modal không thay đổi
    const [pageIndex, setPageIndex] = useState(0);
    const [viewModal, setViewModal] = useState(null);
    const [cancelModal, setCancelModal] = useState(null);
    const [success, setSuccess] = useState(false);
    const [captcha, setCaptcha] = useState(generateCaptcha());
    const [inputCaptcha, setInputCaptcha] = useState('');
    const [captchaError, setCaptchaError] = useState('');

    // Sử dụng useEffect để gọi API khi component được tải lần đầu
    useEffect(() => {
        const fetchBookedTickets = async () => {
            try {
                // Lấy token đã lưu (thường là trong localStorage sau khi đăng nhập)
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("Người dùng chưa xác thực. Vui lòng đăng nhập lại.");
                }
                
                // Gọi API với token trong header Authorization
                const response = await axios.get('http://localhost:5000/api/feature/my-bookings', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                setTickets(response.data); // Lưu dữ liệu vé vào state

            } catch (err) {
                // Xử lý lỗi
                const errorMessage = err.response?.data?.message || err.message || "Không thể tải danh sách vé.";
                setError(errorMessage);
                console.error("Lỗi khi tải vé:", err);
            } finally {
                setLoading(false); // Dừng trạng thái loading dù thành công hay thất bại
            }
        };

        fetchBookedTickets();
    }, []); // Mảng rỗng `[]` đảm bảo useEffect chỉ chạy một lần

    // Tính toán dữ liệu cho trang hiện tại
    const maxPage = Math.ceil(tickets.length / ITEMS_PER_PAGE) - 1;
    const currentTickets = tickets.slice(
        pageIndex * ITEMS_PER_PAGE,
        (pageIndex + 1) * ITEMS_PER_PAGE
    );
    
    // Giao diện khi đang tải dữ liệu
    if (loading) {
        return (
            <UserDashboardLayout>
                <div className="text-center text-white p-10">Đang tải danh sách vé của bạn...</div>
            </UserDashboardLayout>
        );
    }

    // Giao diện khi có lỗi xảy ra
    if (error) {
        return (
            <UserDashboardLayout>
                <div className="text-center text-red-500 p-10">Lỗi: {error}</div>
            </UserDashboardLayout>
        );
    }
    
    return (
        <UserDashboardLayout>
            <div className="bg-black text-white p-6 rounded-md">
                <h2 className="text-2xl font-bold text-center mb-6">Vé Đã Đặt Của Bạn</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[300px]">
                    {/* Sử dụng `tickets.length` thay vì `ticketData.length` */}
                    {tickets.length === 0 ? (
                        <p className="text-center col-span-full mt-10">Bạn chưa đặt vé nào cả.</p>
                    ) : (
                        currentTickets.map((ticket, idx) => (
                            <div key={ticket.id || idx} className="bg-white text-black rounded shadow-md overflow-hidden">
                                <div className="bg-red-600 text-white px-4 py-2 font-bold">
                                    {ticket.movie}<br /><span className="text-sm font-normal">Mã đặt vé: {ticket.id}</span>
                                </div>
                                <div className="p-4 space-y-2">
                                    <p><strong>NGÀY CHIẾU:</strong> {ticket.date}</p>
                                    <p><strong>GIỜ CHIẾU:</strong> {ticket.time}</p>
                                    <p><strong>GHẾ:</strong> {ticket.seats}</p>
                                    <p><strong>RẠP:</strong> {ticket.screen}</p>
                                    <p><strong>TRẠNG THÁI:</strong> <span className={`px-2 py-1 rounded text-xs font-semibold ${ticket.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{ticket.status}</span></p>
                                    <div className="flex gap-2 pt-2">
                                        <button onClick={() => setViewModal(ticket)} className="bg-black hover:bg-gray-800 text-white text-sm px-3 py-1 rounded">Xem Chi Tiết</button>
                                        <button 
                                            onClick={() => {
                                                setCancelModal(ticket);
                                                setCaptcha(generateCaptcha());
                                                setInputCaptcha('');
                                                setCaptchaError('');
                                            }} 
                                            className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded disabled:opacity-40 disabled:cursor-not-allowed"
                                            // Sử dụng `rawShowDate` để so sánh chính xác hơn
                                            disabled={new Date(ticket.rawShowDate) < new Date()}
                                        >
                                            Hủy Vé
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {tickets.length > ITEMS_PER_PAGE && (
                    <PaginationControls
                        currentPage={pageIndex}
                        totalPages={Math.ceil(tickets.length / ITEMS_PER_PAGE)}
                        onPageChange={setPageIndex}
                    />
                )}
            </div>

            {/* Modal xem chi tiết */}
            <Modal open={!!viewModal} onCancel={() => setViewModal(null)} footer={null} centered width={700}>
                {viewModal && (
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                            <img src={avengers} alt="Poster" className="w-48 h-auto rounded object-cover" />
                            <div className="flex-1 space-y-1">
                                <h2 className="text-2xl font-bold mb-2">{viewModal.movie}</h2>
                                <p><strong>NGÀY CHIẾU:</strong> {viewModal.date}</p>
                                <p><strong>GIỜ CHIẾU:</strong> {viewModal.time}</p>
                                <p><strong>RẠP:</strong> {viewModal.screen}</p>
                                <p><strong>GHẾ:</strong> {viewModal.seats}</p>
                                <p><strong>NGÀY ĐẶT:</strong> {viewModal.bookingDate}</p>
                                <p><strong>TỔNG TIỀN:</strong> {viewModal.ticketPrice}</p>
                                <p><strong>THỜI LƯỢNG:</strong> {viewModal.duration}</p>
                            </div>
                        </div>
                        <button onClick={() => setViewModal(null)} className="mt-6 bg-red-600 text-white px-5 py-2 rounded w-full hover:bg-red-700">Đóng</button>
                    </div>
                )}
            </Modal>

            {/* Modal hủy vé và xác thực captcha */}
            <Modal open={!!cancelModal && !success} onCancel={() => setCancelModal(null)} footer={null} centered width={400}>
                <div className="text-center space-y-4 p-6">
                    <h3 className="text-red-600 font-bold text-lg">BẠN CÓ CHẮC MUỐN HỦY VÉ?</h3>
                    <div className="space-y-2 text-left">
                        <p className="text-sm font-medium">Nhập mã xác thực:</p>
                        <div className="flex items-center justify-between gap-2">
                            <div className="bg-gray-200 px-4 py-2 font-mono rounded text-black tracking-widest select-none w-full text-center">{captcha}</div>
                            <button onClick={() => setCaptcha(generateCaptcha())} className="text-red-500 hover:underline text-sm flex-shrink-0">Tải lại</button>
                        </div>
                        <input
                            type="text"
                            value={inputCaptcha}
                            onChange={(e) => setInputCaptcha(e.target.value)}
                            className="w-full border border-gray-300 px-3 py-2 rounded text-black"
                            placeholder="Nhập mã ở trên"
                        />
                        {captchaError && <p className="text-red-500 text-sm text-left">{captchaError}</p>}
                    </div>
                    <button
                        onClick={() => {
                            if (inputCaptcha.toLowerCase() !== captcha.toLowerCase()) {
                                setCaptchaError('Mã xác thực không chính xác.');
                                return;
                            }
                            setSuccess(true);
                            // Tại đây, bạn có thể gọi API để xử lý hủy vé ở backend
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded w-full"
                    >
                        Xác Nhận Hủy
                    </button>
                </div>
            </Modal>

            {/* Modal thành công */}
            <Modal
                open={success}
                onCancel={() => {
                    setSuccess(false);
                    setCancelModal(null);
                    // Có thể tải lại danh sách vé ở đây
                    window.location.reload(); 
                }}
                footer={null}
                centered
                width={350}
            >
                <div className="text-center p-6">
                    <div className="text-green-500 text-6xl mb-4">✔️</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Hủy Vé Thành Công</h3>
                    <p className="text-sm text-gray-600">80% giá trị vé sẽ được hoàn lại vào tài khoản của bạn trong vài ngày tới.</p>
                    <button
                        onClick={() => {
                            setSuccess(false);
                            setCancelModal(null);
                            window.location.reload(); // Tải lại trang để cập nhật danh sách vé
                        }}
                        className="mt-4 bg-red-600 text-white px-4 py-2 rounded w-full"
                    >
                        Đóng
                    </button>
                </div>
            </Modal>
        </UserDashboardLayout>
    );
};

export default ViewsBookedTicket;