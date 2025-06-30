import { configureStore } from '@reduxjs/toolkit';
import movieSearchReducer from './movieSearchSlice';

export const store = configureStore({
  reducer: {
    movieSearch: movieSearchReducer,
  },
});