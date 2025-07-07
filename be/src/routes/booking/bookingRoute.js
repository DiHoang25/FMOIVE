// src/routes/booking/bookingRoutes.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid'); // Import uuid để tạo bookingId duy nhất
const authMiddleware = require('../../middleware/authMiddleware');
const Booking = require('../../models/Booking'); // Import Booking Model
const Movie = require('../../models/Movie');     // Import Movie Model để xác thực
// const Product = require('../../models/Product'); 
const Combo = require('../../models/Combo');     // Import Combo Model (để lấy giá combo nếu cần)

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
        const userId = req.user.userId;
        const { movieDetails,
            selectedSeats,
            totalSeatPrice,
            selectedCombos = [],
            totalComboPrice = 0,
            serviceFee = 10000,
            grandTotal } = req.body;
        const calculatedGrandTotal = totalSeatPrice + totalComboPrice + serviceFee;

        if (calculatedGrandTotal !== grandTotal) {
            console.warn(`Booking for user ${userId}: Frontend grandTotal (${grandTotal}) mismatch with calculated grandTotal (${calculatedGrandTotal}). Using calculated value.`);
        }

        const uniqueBookingId = uuidv4();
        const newBooking = new Booking({
            bookingId: uniqueBookingId,
            movieDetails,
            selectedSeats,
            totalSeatPrice,
            selectedCombos,
            totalComboPrice,
            grandTotal: calculatedGrandTotal,
            user: { userId: userId }
        });

        const booking = await newBooking.save();

        // Lúc này, booking._id đã có giá trị duy nhất do MongoDB/Mongoose tự sinh
        res.status(201).json({ message: 'Booking created successfully!', booking });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


module.exports = router;