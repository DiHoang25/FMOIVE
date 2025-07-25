// src/redux/bookingSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Định nghĩa trạng thái ban đầu cho các trường liên quan đến đặt vé, NGOẠI TRỪ user
// Mục đích: sử dụng khi resetBooking để không ảnh hưởng đến thông tin user đã đăng nhập.
const RESET_BOOKING_FIELDS = {
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
};

const initialState = {
  ...RESET_BOOKING_FIELDS, // Bao gồm các trường đặt vé ban đầu
  user: { // Cấu trúc lại user để không bị lồng quá sâu
    name: null,
    email: null,
    _id: null, // Sử dụng _id như trong backend của bạn
    userId: null,
    phone: null,
    username: null,
    gender: null,
    address: null,
    id_card: null,
    role: null,
    fullname: null,
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
      // Đảm bảo action.payload.user được merge đúng cách vào state.user
      if (action.payload.user) {
        state.user = { ...state.user, ...action.payload.user };
      }
      state.grandTotal = action.payload.grandTotal;
    },
    // RẤT QUAN TRỌNG: Chỉ reset các trường liên quan đến booking, giữ lại thông tin user
    resetBooking: (state) => {
      // Sử dụng Object.assign để cập nhật state với các giá trị từ RESET_BOOKING_FIELDS
      // Điều này sẽ reset tất cả các trường đặt vé mà không ảnh hưởng đến state.user
      Object.assign(state, RESET_BOOKING_FIELDS);
      // Giữ nguyên state.user - KHÔNG GÁN LẠI initialState
    },
    // Đảm bảo setUser cập nhật state.user trực tiếp
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