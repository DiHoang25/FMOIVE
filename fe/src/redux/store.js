// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import bookingReducer from './bookingSlice'; 



import movieSearchReducer from './movieSearchSlice';

export const store = configureStore({
  reducer: {
    movieSearch: movieSearchReducer,
    booking: bookingReducer, 
  },
});
