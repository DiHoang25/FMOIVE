// src/pages/User/PaymentPage/__tests__/PaymentStatusPage.test.jsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';
import PaymentStatusPage from '../paymentStatus';
import bookingSlice, { resetBooking, setUser } from '../../../redux/bookingSlice';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock react-router-dom hooks
const mockNavigate = jest.fn();
const mockLocation = {
  search: ''
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation
}));

// Create a mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      booking: bookingSlice
    },
    preloadedState: {
      booking: {
        user: null,
        ...initialState
      }
    }
  });
};

// Test wrapper component
const TestWrapper = ({ children, store }) => (
  <Provider store={store}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </Provider>
);

describe('PaymentStatusPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.search = '';
    
    // Mock environment variable
    process.env.REACT_APP_API_BASE_URL = 'http://localhost:5000';
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'mock-token'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Test Case 1: Successful VNPAY Payment
  test('should handle successful VNPAY payment', async () => {
    const store = createMockStore();
    mockLocation.search = '?vnp_TxnRef=TEST123&vnp_ResponseCode=00&vnp_TransactionStatus=00';
    
    // Mock user profile API call
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        user: {
          fullname: 'John Doe',
          email: 'john@example.com',
          _id: 'user123',
          phone: '123456789',
          username: 'johndoe',
          gender: 'male',
          address: '123 Main St',
          id_card: 'ID123',
          role: 'customer'
        }
      }
    });

    // Mock VNPAY verification API call
    mockedAxios.get.mockResolvedValueOnce({
      data: { success: true }
    });

    render(
      <TestWrapper store={store}>
        <PaymentStatusPage />
      </TestWrapper>
    );

    // Should show loading initially
    expect(screen.getByText('Processing Payment...')).toBeInTheDocument();
    expect(screen.getByText('TEST123')).toBeInTheDocument();

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
    });

    expect(screen.getByText(/Your booking has been successfully confirmed and paid via VNPAY/)).toBeInTheDocument();
    expect(screen.getByText('View My Bookings')).toBeInTheDocument();
    expect(screen.getByText('Go Home')).toBeInTheDocument();
  });

  // Test Case 2: Failed VNPAY Payment
  test('should handle failed VNPAY payment', async () => {
    const store = createMockStore();
    mockLocation.search = '?vnp_TxnRef=TEST456&vnp_ResponseCode=24&vnp_TransactionStatus=02';
    
    // Mock user profile API call
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        user: {
          fullname: 'John Doe',
          email: 'john@example.com',
          _id: 'user123',
          role: 'customer'
        }
      }
    });

    // Mock VNPAY verification API call
    mockedAxios.get.mockResolvedValueOnce({
      data: { success: false }
    });

    render(
      <TestWrapper store={store}>
        <PaymentStatusPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Payment Failed or Cancelled')).toBeInTheDocument();
    });

    expect(screen.getByText(/VNPAY payment could not be completed/)).toBeInTheDocument();
    expect(screen.getByText(/VNPAY Response Code: 24/)).toBeInTheDocument();
    expect(screen.getByText(/Transaction Status: 02/)).toBeInTheDocument();
  });

  


  // Test Case 4: Cancelled PayOS Payment
  test('should handle cancelled PayOS payment', async () => {
    const store = createMockStore();
    mockLocation.search = '?bookingId=BOOKING789&status=cancelled';
    
    // Mock user profile API call
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        user: {
          fullname: 'Bob Wilson',
          email: 'bob@example.com',
          _id: 'user789',
          role: 'customer'
        }
      }
    });

    render(
      <TestWrapper store={store}>
        <PaymentStatusPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Payment Cancelled')).toBeInTheDocument();
    });

    expect(screen.getByText(/Your PayOS payment was cancelled by you or expired/)).toBeInTheDocument();
  });

  // Test Case 5: Employee User Navigation
  test('should navigate to employee routes for employee users', async () => {
    const store = createMockStore({
      user: {
        name: 'Employee User',
        email: 'employee@example.com',
        _id: 'emp123',
        role: 'employee'
      }
    });
    
    mockLocation.search = '?vnp_TxnRef=TEST789&vnp_ResponseCode=00&vnp_TransactionStatus=00';
    
    // Mock user profile API call
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        user: {
          fullname: 'Employee User',
          email: 'employee@example.com',
          _id: 'emp123',
          role: 'employee'
        }
      }
    });

    // Mock VNPAY verification API call
    mockedAxios.get.mockResolvedValueOnce({
      data: { success: true }
    });

    render(
      <TestWrapper store={store}>
        <PaymentStatusPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
    });

    // Click on "View My Bookings" button
    fireEvent.click(screen.getByText('View My Bookings'));
    expect(mockNavigate).toHaveBeenCalledWith('/employee/counter-booking-list');

    // Click on "Go Home" button
    fireEvent.click(screen.getByText('Go Home'));
    expect(mockNavigate).toHaveBeenCalledWith('/employee');
  });

  // Test Case 6: Network Error Handling
   

  
  // Test Case 8: No Payment Data Found
  test('should handle case when no payment data is found in URL', async () => {
    const store = createMockStore();
    mockLocation.search = ''; // No query parameters
    
    // Mock user profile API call
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        user: {
          fullname: 'Test User',
          email: 'test@example.com',
          _id: 'user123',
          role: 'customer'
        }
      }
    });

    render(
      <TestWrapper store={store}>
        <PaymentStatusPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('No Payment Data Found')).toBeInTheDocument();
    });

    expect(screen.getByText(/Could not find payment transaction data in the URL/)).toBeInTheDocument();
  });

  

  // Test Case 10: VNPAY with Backend Redirect
  test('should handle VNPAY response with backend redirect', async () => {
    const store = createMockStore();
    mockLocation.search = '?vnp_TxnRef=REDIRECT123&vnp_ResponseCode=00&vnp_TransactionStatus=00';
    
    // Mock user profile API call
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        user: {
          fullname: 'Test User',
          email: 'test@example.com',
          _id: 'user123',
          role: 'customer'
        }
      }
    });

    // Mock VNPAY verification with redirect URL
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        redirectUrl: '/booking-confirmation'
      }
    });

    render(
      <TestWrapper store={store}>
        <PaymentStatusPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/booking-confirmation');
    });
  });
});