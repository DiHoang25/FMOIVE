// src/redux/bookingSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    movieDetails: null, // Sẽ lưu thông tin phim và thời gian chiếu được chọn
    selectedSeats: [],
    totalSeatPrice: 0,
    selectedCombos: [], // <-- ADDED: To store selected combos
    totalComboPrice: 0, // <-- ADDED: To store total combo price
    grandTotal: 0,      // <-- ADDED: To store the overall total price
    // ... các state khác nếu có
};

const bookingSlice = createSlice({
    name: 'booking',
    initialState,
    reducers: {
        setMovieDetails: (state, action) => {
            // This action now handles setting movie details AND selected date/time
            state.movieDetails = action.payload;
        },
        setSelectedSeats: (state, action) => {
            state.selectedSeats = action.payload.seats;
            state.totalSeatPrice = action.payload.totalPrice;
        },
        // --- ADDED REDUCERS BELOW ---

        setSelectedCombos: (state, action) => {
            state.selectedCombos = action.payload.combos;
            state.totalComboPrice = action.payload.totalPrice;
        },
        updateGrandTotal: (state, action) => {
            // Assuming action.payload is the new grand total
            state.grandTotal = action.payload;
        },
        // Re-evaluate if setMovieAndDateTime is truly needed.
        // If it's just for setting the movie and time, setMovieDetails already does this.
        // If it's for something else, define its logic here.
        // For now, I'll add it, assuming it takes movie info and date/time.
        // If setMovieDetails already covers this, you might remove this.
        setMovieAndDateTime: (state, action) => {
            state.movieDetails = {
                ...state.movieDetails, // Keep existing movie details
                ...action.payload,    // Override or add date/time info from payload
            };
            // Example payload: { selectedDate: "ISO_DATE", selectedTime: "HH:MM", fullShowtime: "ISO_DATETIME" }
        },
        // --- END ADDED REDUCERS ---
    },
});

export const {
    setMovieDetails,
    setSelectedSeats,
    setSelectedCombos,  // <-- EXPORTED
    updateGrandTotal,   // <-- EXPORTED
    setMovieAndDateTime // <-- EXPORTED (if you decide to keep it separate from setMovieDetails)
} = bookingSlice.actions;

export default bookingSlice.reducer;