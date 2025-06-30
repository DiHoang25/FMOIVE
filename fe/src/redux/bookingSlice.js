// src/features/booking/bookingSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  movieDetails: null, // Will now contain more fields
  selectedSeats: [],
  totalSeatPrice: 0,
  selectedCombos: [],
  totalComboPrice: 0,
  serviceFee: 2.5, // Fixed service fee for now
  grandTotal: 0,
  bookingId: null,
  // Mock user data - In a real app, this would come from an authentication state
  user: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    id: 'A12345678',
    phone: '+1 (555) 123-4567',
  },
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setMovieAndDateTime: (state, action) => {
      // Ensure all necessary movie details are captured here
      state.movieDetails = {
        ...action.payload.movieDetails, // Spread existing details
        time: action.payload.time, // Specific selected time and date
        cinema_room: action.payload.cinema_room, // Specific cinema room (will be N/A if not provided)
        // Ensure genres is always an array of strings
        genres: action.payload.movieDetails.genres || [], // Default to empty array
      };
    },
    setSelectedSeats: (state, action) => {
      state.selectedSeats = action.payload.seats;
      state.totalSeatPrice = action.payload.totalPrice;
      state.grandTotal = state.totalSeatPrice + state.totalComboPrice + state.serviceFee;
    },
    setSelectedCombos: (state, action) => {
      state.selectedCombos = action.payload.combos;
      state.totalComboPrice = action.payload.totalPrice;
      state.grandTotal = state.totalSeatPrice + state.totalComboPrice + state.serviceFee;
    },
    finalizeBooking: (state, action) => {
      state.bookingId = action.payload.bookingId;
      if (action.payload.user) {
        state.user = action.payload.user;
      }
      state.grandTotal = action.payload.grandTotal;
    },  
    resetBooking: (state) => {
      Object.assign(state, initialState);
    },
    updateGrandTotal: (state, action) => {
      state.grandTotal = action.payload;
    }
  },
});

export const { 
    setMovieAndDateTime, 
    setSelectedSeats, 
    setSelectedCombos, 
    finalizeBooking, 
    resetBooking,
    updateGrandTotal 
} = bookingSlice.actions;

export default bookingSlice.reducer;
