import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';
import { message } from 'antd';
import ConfirmBooking from '../ConfirmBooking';
import bookingSlice from '../../../redux/bookingSlice';

// Mock dependencies
jest.mock('axios');
jest.mock('antd', () => ({
  message: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Test data
const mockMovieDetails = {
  _id: '456',
  name: 'Test Movie',
  image_url: 'https://example.com/poster.jpg',
  version: '2D',
  running_time: 120,
  time: '25/12/2024, 14:30',
  cinema_room: 'room123',
  genres: ['Action', 'Drama']
};

const mockUserData = {
  _id: 'user123',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '123456789',
  username: 'johndoe',
  gender: 'Male',
  address: '123 Main St',
  id_card: 'ID123456',
  fullname: 'John Doe'
};

const mockPromotions = [
  {
    _id: 'promo1',
    promotion_code: 'SAVE10',
    discount: 10,
    is_deleted: false
  },
  {
    _id: 'promo2',
    promotion_code: 'SAVE20',
    discount: 20,
    is_deleted: false
  }
];

const mockBookingState = {
  movieDetails: mockMovieDetails,
  selectedSeats: ['A1', 'A2'],
  totalSeatPrice: 200000,
  selectedCombos: [
    {
      id: '1',
      name: 'Popcorn Combo',
      price: 150000,
      quantity: 1,
      _id: 'combo1',
      image_url: 'combo.jpg'
    }
  ],
  totalComboPrice: 150000,
  user: mockUserData
};

// Helper function to create store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      booking: bookingSlice
    },
    preloadedState: {
      booking: {
        movieDetails: null,
        selectedSeats: [],
        totalSeatPrice: 0,
        selectedCombos: [],
        totalComboPrice: 0,
        user: null,
        grandTotal: 0,
        ...initialState
      }
    }
  });
};

// Helper function to render component with providers
const renderWithProviders = (component, store) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('ConfirmBooking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup localStorage mocks
    localStorageMock.getItem.mockImplementation((key) => {
      const mockData = {
        token: 'mock-token',
        movieDetails: JSON.stringify(mockMovieDetails),
        selectedSeats: JSON.stringify(['A1', 'A2']),
        totalSeatPrice: '200000',
        selectedCombos: JSON.stringify([]),
        totalComboPrice: '0',
        user: JSON.stringify(mockUserData),
        bookingState: JSON.stringify(mockBookingState)
      };
      return mockData[key] || null;
    });

    // Setup fetch mock for room API
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        room: { roomName: 'ROOM001' }
      })
    });

    // Setup axios mocks
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/user/profile')) {
        return Promise.resolve({
          data: { user: mockUserData }
        });
      } else if (url.includes('/api/promotions')) {
        return Promise.resolve(mockPromotions);
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

 

  test('displays user information correctly', async () => {
    const store = createMockStore(mockBookingState);
    
    await act(async () => {
      renderWithProviders(<ConfirmBooking />, store);
    });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('123456789')).toBeInTheDocument();
      expect(screen.getByText('johndoe')).toBeInTheDocument();
    });
  });

  test('displays selected seats and combos', async () => {
    const store = createMockStore(mockBookingState);
    
    await act(async () => {
      renderWithProviders(<ConfirmBooking />, store);
    });

    await waitFor(() => {
      // Check seats
      expect(screen.getByText('A1')).toBeInTheDocument();
      expect(screen.getByText('A2')).toBeInTheDocument();
      expect(screen.getByText('2 seats')).toBeInTheDocument();
      
      // Check combos
      expect(screen.getByText('Popcorn Combo')).toBeInTheDocument();
      expect(screen.getByText('×1')).toBeInTheDocument();
    });
  });

  

 

  test('handles missing authentication token', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'token') return null;
      return mockBookingState[key] || null;
    });

    const store = createMockStore(mockBookingState);
    
    await act(async () => {
      renderWithProviders(<ConfirmBooking />, store);
    });

    await waitFor(() => {
      expect(screen.getByText('Proceed to Payment')).toBeInTheDocument();
    });

    // Click proceed to payment
    const proceedButton = screen.getByText('Proceed to Payment');
    fireEvent.click(proceedButton);

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('Authentication token missing. Please log in again.');
    });
  });

 
});