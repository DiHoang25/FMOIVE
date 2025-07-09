import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  movieDetails: { // Initialize as an object with default properties
    name: null,
    image_url: null,
    version: null,
    running_time: null,
    time: null,
    cinema_room: null,
    genres: [],
    rating: null,
    description: null,
    production_company: null,
    director: null,
    actors: null,
  },
  selectedSeats: [],
  totalSeatPrice: 0,
  selectedCombos: [],
  totalComboPrice: 0,
  serviceFee: 2.5,
  grandTotal: 0,
  bookingId: null,
  user: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    id: 'A12345678',
    phone: '+1 (555) 123-4567',
    username: 'john.doe',
    gender: 'male',
    address: '123 Main St',
    id_card: '0123456789',
  },
};

export const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setMovieAndDateTime: (state, action) => {
      console.log("bookingSlice: setMovieAndDateTime action received payload:", action.payload);
      state.movieDetails = {
        ...state.movieDetails,
        ...action.payload.movieDetails,
      };
      // REMOVED: Lines that reset selectedSeats, totalSeatPrice, selectedCombos, etc.
      // These should ONLY be reset when starting a completely new booking.
      console.log("bookingSlice: movieDetails updated to:", state.movieDetails);
    },
    setSelectedSeats: (state, action) => {
      state.selectedSeats = action.payload.seats;
      state.totalSeatPrice = action.payload.totalPrice;
      state.grandTotal = state.totalSeatPrice + state.totalComboPrice + state.serviceFee;
      console.log("bookingSlice: selectedSeats updated to:", state.selectedSeats, "totalSeatPrice:", state.totalSeatPrice);
    },
    setSelectedCombos: (state, action) => {
      state.selectedCombos = action.payload.combos;
      state.totalComboPrice = action.payload.totalPrice;
      state.grandTotal = state.totalSeatPrice + state.totalComboPrice + state.serviceFee;
      console.log("bookingSlice: selectedCombos updated to:", state.selectedCombos, "totalComboPrice:", state.totalComboPrice);
    },
    updateGrandTotal: (state, action) => {
      state.grandTotal = action.payload;
      console.log("bookingSlice: grandTotal updated to:", state.grandTotal);
    },
    finalizeBooking: (state, action) => {
      state.bookingId = action.payload.bookingId;
      if (action.payload.user) {
        state.user = { ...state.user, ...action.payload.user };
      }
      state.grandTotal = action.payload.grandTotal;
      console.log("bookingSlice: Booking finalized. bookingId:", state.bookingId, "grandTotal:", state.grandTotal);
    },
    resetBooking: (state) => {
      Object.assign(state, initialState);
      console.log("bookingSlice: Booking state reset.");
    },
    setUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      console.log("bookingSlice: User info updated to:", state.user);
    },
  },
});

export const {
  setMovieAndDateTime,
  setSelectedSeats,
  setSelectedCombos,
  updateGrandTotal,
  finalizeBooking,
  resetBooking,
  setUser,
} = bookingSlice.actions;

export default bookingSlice.reducer;