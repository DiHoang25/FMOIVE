// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import bookingReducer from './bookingSlice'; 

export const store = configureStore({
  reducer: {
    booking: bookingReducer, // Our booking slice will manage the booking state
    // Add other slices here as your app grows (e.g., userAuth: userAuthReducer)
  },
});
