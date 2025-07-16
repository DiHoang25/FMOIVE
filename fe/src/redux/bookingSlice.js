import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  movieDetails: {
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
  selectedProducts: [],
  totalProductPrice: 0,
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
      
      state.movieDetails = {
        ...state.movieDetails,
        ...action.payload.movieDetails,
      };
      
    },
    setSelectedSeats: (state, action) => {
      state.selectedSeats = action.payload.seats;
      state.totalSeatPrice = action.payload.totalPrice;
      state.grandTotal = state.totalSeatPrice + state.totalComboPrice + state.totalProductPrice + state.serviceFee;
    },
    setSelectedCombos: (state, action) => {
      state.selectedCombos = action.payload.combos;
      state.totalComboPrice = action.payload.totalPrice;
      state.grandTotal = state.totalSeatPrice + state.totalComboPrice + state.totalProductPrice + state.serviceFee;
    },
    setSelectedProducts: (state, action) => {
      state.selectedProducts = action.payload.products;
      state.totalProductPrice = action.payload.totalPrice;
      state.grandTotal = state.totalSeatPrice + state.totalComboPrice + state.totalProductPrice + state.serviceFee;
    },
    updateGrandTotal: (state, action) => {
      state.grandTotal = action.payload;
    },
    finalizeBooking: (state, action) => {
      state.bookingId = action.payload.bookingId;
      if (action.payload.user) {
        state.user = { ...state.user, ...action.payload.user };
      }
      state.grandTotal = action.payload.grandTotal;
    },
    resetBooking: (state) => {
      Object.assign(state, initialState);
    },
    setUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    setMovieDetails: (state, action) => {
      state.movieDetails = {
        ...state.movieDetails,
        ...action.payload,
      };
    },
  },
});

export const {
  setMovieAndDateTime,
  setSelectedSeats,
  setMovieDetails,
  setSelectedCombos,
  setSelectedProducts,
  updateGrandTotal,
  finalizeBooking,
  resetBooking,
  setUser,
} = bookingSlice.actions;

export default bookingSlice.reducer;
