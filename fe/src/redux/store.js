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
import storage from 'redux-persist/lib/storage'; 


import bookingReducer from '../redux/bookingSlice';
import movieSearchReducer from '../redux/movieSearchSlice';


const persistConfig = {
  key: 'root', 
  storage,    
  
  whitelist: ['booking'], 
};


const persistedBookingReducer = persistReducer(persistConfig, bookingReducer);
console.log("store.js: Persisted booking reducer created.");

export const store = configureStore({
  reducer: {
    
    booking: persistedBookingReducer,
    
    movieSearch: movieSearchReducer,
    
  },
  
  
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});


export const persistor = persistStore(store, null, () => {
  
  console.log("store.js: Redux Persist: Rehydration complete.");
});

console.log("store.js: Redux store and persistor initialized.");

