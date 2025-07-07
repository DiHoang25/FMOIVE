// src/redux/bookingSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    movieDetails: null,
    selectedSeats: [],
    totalSeatPrice: 0,
    selectedCombos: [],
    totalComboPrice: 0,
    serviceFee: 10000,
    grandTotal: 0,
    user: {
        _id: '60c72b2f9b1d8e001c8e4d3a', // Mock user ID
        fullName: 'Nguyen Van A',
        email: 'nguyenvana@example.com',
        phone: '0901234567',
    },
};

const bookingSlice = createSlice({
    name: 'booking',
    initialState,
    reducers: {
        setMovieDetails: (state, action) => {
            state.movieDetails = action.payload;
        },
        setSelectedSeats: (state, action) => {
            state.selectedSeats = action.payload.seats;
            state.totalSeatPrice = action.payload.totalPrice;
        },
        setSelectedCombos: (state, action) => {
            state.selectedCombos = action.payload.combos;
            state.totalComboPrice = action.payload.totalPrice;
        },
        updateGrandTotal: (state, action) => {
            state.grandTotal = action.payload;
        },
        setMovieAndDateTime: (state, action) => {
            state.movieDetails = {
                ...state.movieDetails,
                ...action.payload,
            };
        },
        setUserData: (state, action) => {
            state.user = { ...state.user, ...action.payload };
        },
        // NEW: Action to reset the booking state
        resetBooking: (state) => {
            // Đặt lại state về trạng thái ban đầu, giữ lại thông tin user
            return {
                ...initialState, // Copy tất cả các trường từ initialState
                user: state.user // Giữ lại thông tin user hiện tại
            };
        }
    },
});

export const {
    setMovieDetails,
    setSelectedSeats,
    setSelectedCombos,
    updateGrandTotal,
    setMovieAndDateTime,
    setUserData,
    resetBooking // <-- EXPORT MỚI
} = bookingSlice.actions;

export default bookingSlice.reducer;