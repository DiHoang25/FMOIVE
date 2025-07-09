const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
     bookingId: {
        type: String,
        unique: true, // <--- Giữ unique
        required: true // <--- Đảm bảo nó luôn có giá trị, không thể null
    },
    movieDetails: {
        movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
        name: { type: String, required: true },
        image_url: { type: String },
        version: { type: String },
        running_time: { type: Number },
        genres: [{ type: String }],
        time: { type: Date },
        cinema_room: { type: String, required: true }
    },
    selectedSeats: [{ type: String, required: true }],
    totalSeatPrice: { type: Number, required: true },
    selectedCombos: [
        {
            comboId: { type: mongoose.Schema.Types.ObjectId, ref: 'Combo' },
            name: { type: String },
            quantity: { type: Number },
            price: { type: Number },
            image_url: { type: String }
        }
    ],
    totalComboPrice: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    user: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    },
    bookingStatus: { type: String, default: 'pending', enum: ['pending', 'confirmed', 'cancelled'] },
    paymentStatus: { type: String, default: 'pending', enum: ['pending', 'paid', 'failed'] },
    paymentMethod: { type: String, enum: ['VNPAY', 'MoMo', 'Credit Card', null], default: null },
    paymentTransactionId: { type: String, default: null },
    bookingDate: { type: Date, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.model('Booking', BookingSchema);
