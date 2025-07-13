// src/routes/booking/bookingRoutes.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid'); // Import uuid để tạo bookingId duy nhất
const authMiddleware = require('../../middleware/authMiddleware'); // Đảm bảo đường dẫn đúng
const employeeMiddleware = require('../../middleware/employeeMiddleware'); // Middleware kiểm tra quyền nhân viên
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

        // --- BỎ QUA TOÀN BỘ XÁC THỰC CHI TIẾT TỪ FRONTEND (Tự xác thực từ phía front-end) ---
        

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


// @route   GET /api/bookings
// @desc    Tìm kiếm/Lấy danh sách đặt vé
// @access  Private (Người dùng xem đặt vé của mình, Admin xem tất cả hoặc tìm kiếm)
router.get('/', authMiddleware, employeeMiddleware, async (req, res) => {
    try {
        let query = {};

        // Apply filters based on query parameters
        if (req.query.status) {
            query.status = req.query.status;
        }
        if (req.query.movie) {
            // Search by movie name within movieDetails
            query['movieDetails.name'] = new RegExp(req.query.movie, 'i');
        }
        if (req.query.startDate && req.query.endDate) {
            // Filter by booking time within movieDetails
            query['movieDetails.time'] = {
                $gte: new Date(req.query.startDate),
                $lte: new Date(req.query.endDate)
            };
        }
        // Add more filters as needed, e.g., by cinema room, user email, etc.
        if (req.query.cinemaRoom) {
            query['movieDetails.cinema_room'] = new RegExp(req.query.cinemaRoom, 'i');
        }
        if (req.query.userEmail) {
            query['user.email'] = new RegExp(req.query.userEmail, 'i');
        }
        if (req.query.userName) {
            query['user.name'] = new RegExp(req.query.userName, 'i');
        }
        if (req.query.phoneNumber) {
            query['user.phone'] = new RegExp(req.query.phoneNumber, 'i');
        }


        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const bookings = await Booking.find(query)
                                        .skip(skip)
                                        .limit(limit)
                                        .sort({ createdAt: -1 }); // Sort by creation time descending

        const totalBookings = await Booking.countDocuments(query);

        res.status(200).json({
            message: 'Tìm kiếm đặt vé thành công.',
            total: totalBookings,
            page,
            limit,
            bookings
        });

    } catch (error) {
        console.error('Lỗi khi tìm kiếm đặt vé:', error.message);
        res.status(500).send('Lỗi máy chủ khi tìm kiếm đặt vé.');
    }
});


router.get('/search', authMiddleware, employeeMiddleware, async (req, res) => {
    try {
        const { fullname, phone } = req.query; // Get fullname and phone from query parameters

        if (!fullname && !phone) {
            return res.status(400).json({ message: 'Vui lòng cung cấp tên đầy đủ hoặc số điện thoại để tìm kiếm.' });
        }

        let query = {};

        // Build the query based on provided parameters
        if (fullname) {
            query['user.name'] = new RegExp(fullname, 'i'); // Case-insensitive search for user's name
        }
        if (phone) {
            query['user.phone'] = phone; // Exact match for phone number
        }

        const bookings = await Booking.find(query);

        if (bookings.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đặt vé nào với thông tin đã cung cấp.' });
        }

        res.status(200).json({
            message: 'Tìm kiếm đặt vé thành công.',
            bookings: bookings // No need to filter by user role here
        });

    } catch (error) {
        console.error('Lỗi khi tìm kiếm đặt vé:', error.message);
        res.status(500).send('Lỗi máy chủ khi tìm kiếm đặt vé.');
    }
});



module.exports = router;