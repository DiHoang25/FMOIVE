// src/routes/booking/bookingRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware'); 
const Booking = require('../../models/Booking'); // Import Booking Model
const Movie = require('../../models/Movie');     // Import Movie Model để xác thực
// const Product = require('../../models/Product'); 
const Combo = require('../../models/Combo');     // Import Combo Model (để lấy giá combo nếu cần)
const User = require('../../models/User');       // Import User Model để xác thực user id

// Helper function để format minutes (nếu cần ở backend)
const formatMinutesToHoursMinutes = (minutes) => {
    if (typeof minutes !== 'number' || minutes < 0) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
};

// @route   POST /api/bookings/create
// @desc    Tạo một booking mới từ dữ liệu frontend
// @access  Private (Cần xác thực người dùng)
router.post('/create', authMiddleware, async (req, res) => {
    try {
        const {
            movieDetails,
            selectedSeats,
            totalSeatPrice,
            selectedCombos,
            totalComboPrice,
            serviceFee,
            voucherCode,
            voucherDiscount,
            grandTotal,
            userId, // Lấy userId từ req.user (middleware authMiddleware) hoặc từ body nếu bạn gửi từ frontend
            // Thông tin người dùng khác có thể lấy từ user object trong Redux hoặc truy vấn DB
        } = req.body; // Dữ liệu gửi từ frontend (ConfirmBooking.jsx)

        // --- Bắt đầu xác thực và xử lý dữ liệu ---

        // 1. Xác thực người dùng (từ token hoặc ID gửi lên)
        // Nếu authMiddleware đã gắn req.user._id, bạn có thể lấy trực tiếp
        const authenticatedUserId = req.user._id; // Giả sử authMiddleware gắn _id của user vào req.user
        const userInDb = await User.findById(authenticatedUserId);

        if (!userInDb) {
            return res.status(401).json({ message: 'Người dùng không được xác thực hoặc không tồn tại.' });
        }

        // 2. Xác thực thông tin phim và suất chiếu
        if (!movieDetails || !movieDetails._id || !movieDetails.fullShowtime || !movieDetails.cinema_room) {
            return res.status(400).json({ message: 'Thông tin phim hoặc suất chiếu không đầy đủ.' });
        }

        const movieInDb = await Movie.findById(movieDetails._id);
        if (!movieInDb || movieInDb.is_deleted) {
            return res.status(404).json({ message: 'Phim không tồn tại hoặc đã bị xóa.' });
        }
        // Thêm các kiểm tra khác về tính hợp lệ của suất chiếu (ví dụ: ngày giờ có còn hiệu lực không)
        const parsedShowtimeDate = new Date(movieDetails.fullShowtime);
        if (isNaN(parsedShowtimeDate.getTime()) || parsedShowtimeDate < new Date()) {
            return res.status(400).json({ message: 'Thời gian suất chiếu không hợp lệ hoặc đã qua.' });
        }


        // 3. Xác thực ghế đã chọn (tùy chọn nhưng RẤT QUAN TRỌNG cho một hệ thống thực tế)
        // Trong một hệ thống thực tế:
        // - Bạn sẽ cần kiểm tra xem các ghế này có trống cho suất chiếu cụ thể không.
        // - Bạn sẽ cần logic để đánh dấu ghế là "đang được giữ" hoặc "đã đặt".
        // - Giá ghế cần được lấy từ database, không tin tưởng hoàn toàn vào giá từ frontend.
        // Ví dụ đơn giản:
        if (!selectedSeats || selectedSeats.length === 0) {
            return res.status(400).json({ message: 'Chưa chọn ghế nào.' });
        }
        // Giả sử mỗi ghế có giá 100.000 VND, bạn có thể lấy từ database cho từng loại ghế
        // Hoặc trong trường hợp này, bạn đang gửi totalSeatPrice từ frontend.
        // Cần kiểm tra consistency: totalSeatPrice có khớp với số ghế * giá ghế trên backend không?
        const expectedSeatPrice = selectedSeats.length * 100000; // Ví dụ giá ghế
        if (totalSeatPrice !== expectedSeatPrice) {
            console.warn(`Frontend totalSeatPrice (${totalSeatPrice}) mismatch with backend calculation (${expectedSeatPrice}).`);
            // return res.status(400).json({ message: 'Tổng tiền ghế không khớp.' });
        }

        const formattedSeats = selectedSeats.map(seat => ({ seatNumber: seat, price: 100000 })); // Lưu giá của từng ghế


        // 4. Xác thực combo đã chọn (tùy chọn)
        const processedCombos = [];
        let backendCalculatedComboTotal = 0;

        for (const comboItem of selectedCombos) {
            const comboInDb = await Combo.findById(comboItem._id); // Lấy combo từ DB
            if (!comboInDb || comboInDb.isDeleted || !comboInDb.isActive) {
                return res.status(400).json({ message: `Combo "${comboItem.name}" không tồn tại hoặc không khả dụng.` });
            }
            if (comboItem.quantity <= 0) {
                 return res.status(400).json({ message: `Số lượng combo "${comboItem.name}" không hợp lệ.` });
            }
            // Sử dụng giá từ database, không phải từ frontend
            processedCombos.push({
                comboId: comboInDb._id,
                name: comboInDb.name,
                quantity: comboItem.quantity,
                price: comboInDb.price // Lấy giá từ DB
            });
            backendCalculatedComboTotal += comboInDb.price * comboItem.quantity;
        }

        if (totalComboPrice !== backendCalculatedComboTotal) {
            console.warn(`Frontend totalComboPrice (${totalComboPrice}) mismatch with backend calculation (${backendCalculatedComboTotal}).`);
            // return res.status(400).json({ message: 'Tổng tiền combo không khớp.' });
        }


        // 5. Xác thực giá cuối cùng
        // Tính toán lại tổng tiền ở backend để đảm bảo an toàn
        const backendCalculatedGrandTotal = (totalSeatPrice || 0) + (backendCalculatedComboTotal || 0) + (serviceFee || 0) - (voucherDiscount || 0);

        if (grandTotal !== backendCalculatedGrandTotal) {
            console.warn(`Frontend grandTotal (${grandTotal}) mismatch with backend calculation (${backendCalculatedGrandTotal}).`);
            // return res.status(400).json({ message: 'Tổng tiền cuối cùng không khớp.' });
        }

        // --- Tạo Booking mới ---
        const newBooking = new Booking({
            user: {
                userId: userInDb._id,
                fullName: userInDb.fullName || userInDb.username, // Hoặc lấy từ profile của user
                email: userInDb.email,
                phone: userInDb.phone || 'N/A', // Lấy từ profile
            },
            movie: {
                movieId: movieInDb._id,
                name: movieInDb.name,
                imageUrl: movieInDb.image_url,
                version: movieInDb.version,
                runningTime: movieInDb.running_time,
                genres: movieInDb.genres,
            },
            showtime: {
                date: new Date(movieDetails.selectedDate), // Đảm bảo là Date object chỉ ngày
                time: movieDetails.selectedTime,
                fullShowtime: parsedShowtimeDate, // Date object đầy đủ
                cinemaRoom: movieDetails.cinema_room,
            },
            seats: formattedSeats,
            combos: processedCombos,
            totalTicketPrice: totalSeatPrice,
            totalComboPrice: backendCalculatedComboTotal,
            serviceFee: serviceFee || 0,
            voucherCode: voucherCode || null,
            voucherDiscount: voucherDiscount || 0,
            grandTotal: backendCalculatedGrandTotal,
            bookingStatus: 'pending', // Ban đầu là pending, sẽ được cập nhật sau thanh toán
            paymentStatus: 'pending',
            // paymentMethod và paymentTransactionId sẽ được cập nhật sau khi hoàn tất thanh toán
        });

        await newBooking.save();

        res.status(201).json({
            message: 'Booking đã được tạo thành công. Vui lòng tiến hành thanh toán.',
            booking: newBooking,
            // Có thể trả về URL thanh toán ở đây nếu tích hợp cổng thanh toán
        });

    } catch (error) {
        console.error('Lỗi khi tạo booking:', error);
        res.status(500).send('Lỗi máy chủ khi tạo booking.');
    }
});

module.exports = router;