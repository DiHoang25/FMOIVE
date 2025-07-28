import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';
import { message } from 'antd';
import ComboSelection from '../ComboSelection';
import bookingSlice from '../../../redux/bookingSlice';

// Mock dependencies
jest.mock('axios');
jest.mock('antd', () => ({
  Modal: ({ children, open, onCancel, footer, title }) => 
    open ? (
      <div data-testid="combo-modal">
        <div>{title}</div>
        <div>{children}</div>
        <div>{footer}</div>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
  message: {
    error: jest.fn(),
    success: jest.fn(),
  },
  LoadingOutlined: () => <div data-testid="loading-icon">Loading...</div>
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.mock('../../../components/LoadingSpinner.jsx', () => {
  return function LoadingSpinner() {
    return <div data-testid="loading-spinner">Loading...</div>;
  };
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Test data
const mockMovieDetails = {
  name: 'Test Movie',
  image_url: 'https://example.com/poster.jpg',
  version: '2D',
  running_time: 120,
  time: '25/12/2024, 14:30',
  cinema_room: 'room123',
  genres: ['Action', 'Drama']
};

const mockCombosResponse = {
  data: {
    combos: [
      {
        _id: '1',
        comboName: 'Popcorn Combo',
        price: 150000,
        image_url: 'https://example.com/popcorn.jpg',
        description: 'Large popcorn and drink',
        status: 'active',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        items: [
          { quantity: 1, productName: 'Large Popcorn', productDetail: { category: 'Snack', price: 80000 } },
          { quantity: 1, productName: 'Soft Drink', productDetail: { category: 'Beverage', price: 70000 } }
        ]
      },
      {
        _id: '2',
        comboName: 'Family Combo',
        price: 300000,
        image_url: 'https://example.com/family.jpg',
        description: 'Perfect for family',
        status: 'active',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        items: []
      }
    ]
  }
};

const mockComboDetailsResponse = {
  data: {
    combo: mockCombosResponse.data.combos[0]
  }
};

const mockRoomResponse = {
  room: {
    roomName: 'ROOM001'
  }
};

// Helper function to create store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      booking: bookingSlice
    },
    preloadedState: {
      booking: {
        movieDetails: mockMovieDetails,
        selectedSeats: ['A1', 'A2'],
        totalSeatPrice: 200000,
        selectedCombos: { combos: [], totalPrice: 0 },
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

describe('ComboSelection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('mock-token');
    
    // Setup default axios responses
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/combo/')) {
        return Promise.resolve(mockComboDetailsResponse);
      } else if (url.includes('/api/combo')) {
        return Promise.resolve(mockCombosResponse);
      } else if (url.includes('/api/theater/rooms/')) {
        return Promise.resolve({ data: mockRoomResponse });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    // Mock fetch for room API
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockRoomResponse)
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders loading spinner initially and then displays combos', async () => {
    const store = createMockStore();
    
    renderWithProviders(<ComboSelection />, store);
    
    // Should show loading spinner initially
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    
    // Wait for combos to load
    await waitFor(() => {
      expect(screen.getByText('COMBO POPCORN & DRINKS')).toBeInTheDocument();
    });
    
    // Should display combo items
    expect(screen.getByText('Popcorn Combo')).toBeInTheDocument();
    expect(screen.getByText('Family Combo')).toBeInTheDocument();
  });

 
 
  
  test('opens combo details modal when combo is clicked', async () => {
    const store = createMockStore();
    
    await act(async () => {
      renderWithProviders(<ComboSelection />, store);
    });

    await waitFor(() => {
      expect(screen.getByText('Popcorn Combo')).toBeInTheDocument();
    });

    // Click on the first combo
    const comboItem = screen.getByText('Popcorn Combo').closest('div');
    fireEvent.click(comboItem);

    // Should open modal
    await waitFor(() => {
      expect(screen.getByTestId('combo-modal')).toBeInTheDocument();
      expect(screen.getByText('Combo Details')).toBeInTheDocument();
    });
  });

  test('displays combo details correctly in modal', async () => {
    const store = createMockStore();
    
    await act(async () => {
      renderWithProviders(<ComboSelection />, store);
    });

    await waitFor(() => {
      expect(screen.getByText('Popcorn Combo')).toBeInTheDocument();
    });

    // Click on combo to open modal
    const comboItem = screen.getByText('Popcorn Combo').closest('div');
    fireEvent.click(comboItem);

    await waitFor(() => {
      expect(screen.getByTestId('combo-modal')).toBeInTheDocument();
      expect(screen.getByText('Large popcorn and drink')).toBeInTheDocument();
      expect(screen.getByText('1 x Large Popcorn')).toBeInTheDocument();
      expect(screen.getByText('1 x Soft Drink')).toBeInTheDocument();
    });
  });

 
  test('handles API error gracefully', async () => {
    axios.get.mockRejectedValueOnce(new Error('API Error'));
    
    const store = createMockStore();
    
    await act(async () => {
      renderWithProviders(<ComboSelection />, store);
    });

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('Failed to load combos. Please try again.');
    });
  });

  test('handles missing movie details with fallback', async () => {
    const store = createMockStore({
      movieDetails: null,
      selectedSeats: [],
      totalSeatPrice: 0
    });
    
    await act(async () => {
      renderWithProviders(<ComboSelection />, store);
    });

    await waitFor(() => {
      expect(screen.getByText('Movie Title N/A')).toBeInTheDocument();
      expect(screen.getByText('Seats: N/A')).toBeInTheDocument();
    });
  });
});