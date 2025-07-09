// src/routes/booking/bookingRoutes.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid'); // Import uuid để tạo bookingId duy nhất
const authMiddleware = require('../../middleware/authMiddleware'); // Đảm bảo đường dẫn đúng
const Booking = require('../../models/Booking'); // Import Booking Model

// @route   POST /api/bookings/create
// @desc    Tạo một booking mới từ dữ liệu frontend (ít xác thực hơn)
// @access  Private (Cần xác thực người dùng)
router.post('/create', authMiddleware, async (req, res) => {
    try {
        // Lấy thông tin người dùng từ token (vẫn cần để gán booking cho user nào, ngay cả khi không dùng nó để lookup profile)
        const authenticatedUserId = req.user.userId;

        // Destructure dữ liệu từ req.body theo cấu trúc từ frontend
        const {
            movieDetails,
            selectedSeats,
            totalSeatPrice,
            selectedCombos = [], // Mặc định là mảng rỗng nếu không có
            totalComboPrice = 0, // Mặc định là 0 nếu không có
            grandTotal,
            user // Lấy toàn bộ thông tin người dùng từ payload frontend
        } = req.body;

        // --- BỎ QUA TOÀN BỘ XÁC THỰC CHI TIẾT TỪ FRONTEND THEO YÊU CẦU ---
        // **Cảnh báo**: Việc này làm tăng nguy cơ dữ liệu không hợp lệ hoặc gian lận
        // từ phía client. Chỉ nên làm điều này trong môi trường phát triển
        // hoặc khi bạn có cơ chế xác thực rất mạnh ở lớp khác.

        // Kiểm tra cơ bản về sự tồn tại của dữ liệu cần thiết tối thiểu
        // if (!movieDetails || !movieDetails.movieId || !selectedSeats || selectedSeats.length === 0 || totalSeatPrice === undefined || totalSeatPrice < 0 || !grandTotal || !user || !user._id) {
        //     return res.status(400).json({ message: 'Missing essential booking data.' });
        // }

        // Tạo một bookingId duy nhất bằng uuidv4
        const uniqueBookingId = uuidv4();

        const newBooking = new Booking({
            bookingId: uniqueBookingId, // Gán bookingId duy nhất
            movieDetails: {
                movieId: movieDetails.movieId,
                name: movieDetails.name,
                image_url: movieDetails.imageUrl, // Frontend gửi imageUrl, model là image_url
                version: movieDetails.version,
                running_time: movieDetails.runningTime,
                genres: movieDetails.genres,
                time: movieDetails.time, // ISO string
                cinema_room: movieDetails.cinema_room,
            },
            selectedSeats: selectedSeats,
            totalSeatPrice: totalSeatPrice,
            selectedCombos: selectedCombos.map(combo => ({ // Vẫn map để đảm bảo cấu trúc phù hợp với schema
                comboId: combo.comboId,
                name: combo.name,
                quantity: combo.quantity,
                price: combo.price,
                imageUrl: combo.imageUrl
            })),
            totalComboPrice: totalComboPrice, // Sử dụng giá trị từ frontend (ít xác thực hơn)
            grandTotal: grandTotal, // Sử dụng giá trị từ frontend (ít xác thực hơn)
            // SỬ DỤNG TRỰC TIẾP ĐỐI TƯỢNG USER TỪ PAYLOAD
            user: {
                _id: user._id || authenticatedUserId, // Ưu tiên _id từ payload, nếu không có thì dùng từ token
                name: user.name,
                email: user.email,
                phone: user.phone,
                username: user.username,
                gender: user.gender,
                address: user.address,
                id_card: user.id_card,
            },
            status: 'PENDING_PAYMENT' // Đặt trạng thái ban đầu cho booking
        });

        const booking = await newBooking.save();

        res.status(201).json({ message: 'Booking created successfully!', booking });
    } catch (error) {
        console.error('Error creating booking:', error);
        // Xử lý lỗi trùng lặp bookingId nếu có (rất hiếm với uuidv4)
        if (error.code === 11000 && error.keyPattern && error.keyPattern.bookingId) {
            return res.status(409).json({ message: 'A booking with this ID already exists. Please try again.' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;