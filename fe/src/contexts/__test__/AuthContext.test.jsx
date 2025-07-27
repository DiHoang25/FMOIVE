// src/__tests__/AuthContext.test.jsx
import React from 'react';
import { render, renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';

// Mock jwt-decode
jest.mock('jwt-decode');

// Mock localStorage và sessionStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
});

// Mock Redux store
const createMockStore = () => {
  const mockBookingSlice = {
    name: 'booking',
    initialState: { user: null },
    reducers: {
      setUser: (state, action) => {
        state.user = action.payload;
      },
      resetBooking: (state) => {
        state.user = null;
      },
    },
  };

  return configureStore({
    reducer: {
      booking: mockBookingSlice.reducer || ((state = mockBookingSlice.initialState) => state),
    },
  });
};

// Wrapper component cho test
const TestWrapper = ({ children, store = createMockStore() }) => (
  <Provider store={store}>
    <AuthProvider>
      {children}
    </AuthProvider>
  </Provider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset console methods
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should initialize with no token', async () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
  });

  test('should initialize with valid token', async () => {
    const mockToken = 'valid.jwt.token';
    const mockUser = { id: 1, name: 'Test User' };
    const mockDecoded = {
      user: mockUser,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    };

    mockLocalStorage.getItem.mockReturnValue(mockToken);
    
    // Mock jwt-decode
    const { jwtDecode } = require('jwt-decode');
    jwtDecode.mockReturnValue(mockDecoded);

    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  test('should handle expired token', async () => {
    const mockToken = 'expired.jwt.token';
    const mockDecoded = {
      user: { id: 1, name: 'Test User' },
      exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago (expired)
    };

    mockLocalStorage.getItem.mockReturnValue(mockToken);
    
    const { jwtDecode } = require('jwt-decode');
    jwtDecode.mockReturnValue(mockDecoded);

    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('showtimeScrollPosition');
  });

  test('should handle invalid token', async () => {
    const mockToken = 'invalid.jwt.token';

    mockLocalStorage.getItem.mockReturnValue(mockToken);
    
    const { jwtDecode } = require('jwt-decode');
    jwtDecode.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
  });

  test('should login successfully', async () => {
    const mockToken = 'new.jwt.token';

    mockLocalStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.login(mockToken);
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', mockToken);
  });

  test('should logout successfully', async () => {
    const mockToken = 'valid.jwt.token';
    const mockUser = { id: 1, name: 'Test User' };
    const mockDecoded = {
      user: mockUser,
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    mockLocalStorage.getItem.mockReturnValue(mockToken);
    
    const { jwtDecode } = require('jwt-decode');
    jwtDecode.mockReturnValue(mockDecoded);

    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // User should be authenticated initially
    expect(result.current.isAuthenticated).toBe(true);

    // Logout
    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('showtimeScrollPosition');
  });

  test('should handle login with null token', async () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.login(null);
    });

    expect(console.error).toHaveBeenCalledWith('Login failed: Token is undefined or null.');
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
  });
});