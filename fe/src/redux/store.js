// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

// CORRECTED PATH: Ensure this path is accurate for your bookingSlice
import bookingReducer from '../redux/bookingSlice';

// Configuration for redux-persist
const persistConfig = {
  key: 'root', // Key for the storage object in localStorage
  storage,     // The storage engine to use (localStorage in this case)
  // We explicitly whitelist the 'booking' slice to be persisted
  whitelist: ['booking'], // Only the 'booking' slice state will be saved and rehydrated
};

// Create a persisted reducer for the booking slice
const persistedBookingReducer = persistReducer(persistConfig, bookingReducer);
console.log("store.js: Persisted booking reducer created.");

export const store = configureStore({
  reducer: {
    // Use the persisted reducer for your booking state
    booking: persistedBookingReducer,
    // Add other slices here if you have them (e.g., userAuth: userAuthReducer)
  },
  // Middleware to ignore non-serializable actions from redux-persist
  // This is crucial to prevent errors related to redux-persist's internal actions
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Create a persistor object, which is used to trigger rehydration
export const persistor = persistStore(store, null, () => {
  // This callback fires after rehydration is complete
  console.log("store.js: Redux Persist: Rehydration complete.");
});

console.log("store.js: Redux store and persistor initialized.");
