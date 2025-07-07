// src/models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    // Thông tin người dùng
    user: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        // Có thể thêm các trường user khác nếu cần (ví dụ: ID Card)
    },
    
    // Thông tin phim
    movie: {
        movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true }, // Liên kết với Movie model
        name: { type: String, required: true },
        imageUrl: { type: String },
        version: { type: String },
        runningTime: { type: Number }, // in minutes
        genres: [{ type: String }],
        // Các thông tin khác của phim có thể được lưu trữ snapshot tại thời điểm booking
    },

    // Chi tiết suất chiếu
    showtime: {
        date: { type: Date, required: true }, // Ngày chiếu (chỉ ngày)
        time: { type: String, required: true }, // Giờ chiếu (ví dụ: "19:00")
        fullShowtime: { type: Date, required: true }, // Thời gian chiếu đầy đủ (Date object)
        cinemaRoom: { type: String, required: true }, // Tên phòng chiếu
        // roomDetails: { type: mongoose.Schema.Types.ObjectId, ref: 'CinemaRoom' }, // Nếu bạn có model cho phòng chiếu
    },

    // Ghế đã chọn
    seats: [
        {
            seatNumber: { type: String, required: true }, // Ví dụ: "A1", "B5"
            price: { type: Number, required: true, min: 0 },
            // Có thể thêm loại ghế (standard/VIP) nếu cần
        }
    ],

    // Combo đã chọn
    combos: [
        {
            comboId: { type: mongoose.Schema.Types.ObjectId, ref: 'Combo' }, // Liên kết với Combo model (tùy chọn)
            name: { type: String, required: true },
            quantity: { type: Number, required: true, min: 1 },
            price: { type: Number, required: true, min: 0 }, // Giá của 1 combo (để tính tổng)
            // items: [{ productName: String, quantity: Number }] // Có thể lưu chi tiết các sản phẩm trong combo
        }
    ],

    // Chi tiết thanh toán và giá cả
    totalTicketPrice: { type: Number, required: true, min: 0 }, // Tổng tiền vé ghế
    totalComboPrice: { type: Number, required: true, min: 0 },   // Tổng tiền combo
    serviceFee: { type: Number, default: 0 },                    // Phí dịch vụ
    voucherCode: { type: String },                               // Mã voucher đã áp dụng
    voucherDiscount: { type: Number, default: 0, min: 0 },       // Số tiền giảm giá từ voucher
    grandTotal: { type: Number, required: true, min: 0 },        // Tổng tiền cuối cùng sau giảm giá
    
    // Trạng thái booking và thanh toán
    bookingStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending' // Ban đầu là pending, chuyển sang confirmed sau thanh toán thành công
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending' // Ban đầu là pending, chuyển sang paid sau thanh toán thành công
    },
    paymentMethod: { type: String }, // Ví dụ: 'VNPAY', 'MoMo', 'Credit Card'
    paymentTransactionId: { type: String }, // ID giao dịch từ cổng thanh toán

}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

// Có thể thêm index để tăng tốc độ tìm kiếm
bookingSchema.index({ 'user.userId': 1 });
bookingSchema.index({ 'movie.movieId': 1 });
bookingSchema.index({ 'showtime.fullShowtime': 1 });

module.exports = mongoose.model('Booking', bookingSchema);