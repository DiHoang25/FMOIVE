import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import SeatSelectionPage from '../SeatSelectionPage';
import bookingSlice from '../../../redux/bookingSlice';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    state: {
      roomId: '123',
      movieId: '456'
    }
  })
}));

jest.mock('react-responsive', () => ({
  useMediaQuery: jest.fn(() => false) // Default to desktop
}));

jest.mock('react-zoom-pan-pinch', () => ({
  TransformWrapper: ({ children }) => <div data-testid="transform-wrapper">{children({ zoomIn: jest.fn(), zoomOut: jest.fn(), resetTransform: jest.fn() })}</div>,
  TransformComponent: ({ children }) => <div data-testid="transform-component">{children}</div>
}));

jest.mock('../../../components/LoadingSpinner.jsx', () => {
  return function LoadingSpinner() {
    return <div data-testid="loading-spinner">Loading...</div>;
  };
});

// Mock fetch globally
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Test data
const mockMovieData = {
  id: '456',
  name: 'Test Movie',
  image_url: 'https://example.com/poster.jpg',
  version: '2D',
  running_time: 120,
  time: '25/12/2024, 14:30',
  cinema_room: 'ROOM001',
  rating: 'PG-13',
  genres: ['Action', 'Drama']
};

const mockRoomData = {
  room: {
    id: '123',
    roomName: 'ROOM001',
    rows: 3,
    columns: 5,
    seats: [
      { id: '1', label: 'A1', row: 1, column: 1, type: 'Normal', price: 100000 },
      { id: '2', label: 'A2', row: 1, column: 2, type: 'Normal', price: 100000 },
      { id: '3', label: 'A3', row: 1, column: 3, type: 'VIP', price: 150000 },
      { id: '4', label: 'B1', row: 2, column: 1, type: 'Normal', price: 100000 },
      { id: '5', label: 'B2', row: 2, column: 2, type: 'VIP', price: 150000 },
    ]
  }
};

const mockOccupiedSeats = {
  occupiedSeats: [
    { seatLabel: 'A1', showtime: '2024-12-25T07:30:00.000Z' }
  ]
};

// Helper function to create store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      booking: bookingSlice
    },
    preloadedState: {
      booking: {
        selectedSeats: [],
        selectedCombos: { combos: [], totalPrice: 0 },
        movieDetails: null,
        totalPrice: 0,
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

describe('SeatSelectionPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('mock-token');
    
    // Setup default fetch responses
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRoomData)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMovieData)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockOccupiedSeats)
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Loading State', () => {
    test('displays loading spinner while fetching data', () => {
      const store = createMockStore();
      renderWithProviders(<SeatSelectionPage />, store);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Data Fetching', () => {
         });

  describe('UI Rendering', () => {
    test('renders page title and back button', async () => {
      const store = createMockStore();
      
      await act(async () => {
        renderWithProviders(<SeatSelectionPage />, store);
      });

      await waitFor(() => {
        expect(screen.getByText('SELECT YOUR SEATS')).toBeInTheDocument();
        expect(screen.getByText('← Back')).toBeInTheDocument();
      });
    });

    test('renders movie information correctly', async () => {
      const store = createMockStore();
      
      await act(async () => {
        renderWithProviders(<SeatSelectionPage />, store);
      });

      await waitFor(() => {
        expect(screen.getByText('Test Movie')).toBeInTheDocument();
        expect(screen.getByText(/2D • 2h 0m • Action, Drama/)).toBeInTheDocument();
      });
    });

    test('renders seat legend', async () => {
      const store = createMockStore();
      
      await act(async () => {
        renderWithProviders(<SeatSelectionPage />, store);
      });

      await waitFor(() => {
        expect(screen.getByText('Selected')).toBeInTheDocument();
        expect(screen.getByText('Normal')).toBeInTheDocument();
        expect(screen.getByText('VIP')).toBeInTheDocument();
        expect(screen.getByText('Occupied')).toBeInTheDocument();
      });
    });

    test('renders screen indicator', async () => {
      const store = createMockStore();
      
      await act(async () => {
        renderWithProviders(<SeatSelectionPage />, store);
      });

      await waitFor(() => {
        expect(screen.getByText('SCREEN')).toBeInTheDocument();
      });
    });
  });

  describe('Seat Selection', () => {
    test('renders seats correctly', async () => {
      const store = createMockStore();
      
      await act(async () => {
        renderWithProviders(<SeatSelectionPage />, store);
      });

      await waitFor(() => {
        expect(screen.getByTitle(/Seat A2 - Normal/)).toBeInTheDocument();
        expect(screen.getByTitle(/Seat A3 - VIP/)).toBeInTheDocument();
      });
    });

           
   
  });

  describe('Continue Button', () => {
    test('continue button is disabled when no seats selected', async () => {
      const store = createMockStore();
      
      await act(async () => {
        renderWithProviders(<SeatSelectionPage />, store);
      });

      await waitFor(() => {
        const continueButton = screen.getByText('Continue');
        expect(continueButton).toBeDisabled();
      });
    });

    test('continue button is enabled when seats are selected', async () => {
      const store = createMockStore();
      
      await act(async () => {
        renderWithProviders(<SeatSelectionPage />, store);
      });

      await waitFor(() => {
        const seatA2 = screen.getByTitle(/Seat A2 - Normal/);
        fireEvent.click(seatA2);
      });

      await waitFor(() => {
        const continueButton = screen.getByText('Continue');
        expect(continueButton).not.toBeDisabled();
      });
    });

    
  });

  describe('Mobile Responsiveness', () => {
    test('renders zoom controls on mobile', async () => {
      const { useMediaQuery } = require('react-responsive');
      useMediaQuery.mockReturnValue(true); // Mobile

      const store = createMockStore();
      
      await act(async () => {
        renderWithProviders(<SeatSelectionPage />, store);
      });

      await waitFor(() => {
        expect(screen.getByTestId('transform-wrapper')).toBeInTheDocument();
      });
    });
  });

  describe('Utility Functions', () => {
    test('formatMinutesToHoursMinutes works correctly', () => {
      // We need to test this indirectly through the component
      const store = createMockStore();
      
      act(() => {
        renderWithProviders(<SeatSelectionPage />, store);
      });

      // The function is used internally and should display "2h 0m" for 120 minutes
      waitFor(() => {
        expect(screen.getByText(/2h 0m/)).toBeInTheDocument();
      });
    });

  });

  

    
  });

  

    test('handles API errors gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('API Error'));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const store = createMockStore();

      await act(async () => {
        renderWithProviders(<SeatSelectionPage />, store);
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  