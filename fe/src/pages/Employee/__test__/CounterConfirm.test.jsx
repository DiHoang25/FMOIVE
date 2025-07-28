import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CounterConfirm from '../CounterConfirm';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

// Mock redux
jest.mock('react-redux', () => ({
  useSelector: jest.fn(() => ({
    movieDetails: {
      name: 'Test Movie',
      image_url: 'test-image.jpg',
      version: '2D',
      running_time: 120,
      time: '2023-07-28T19:00:00.000Z',
      cinema_room: 'ROOM01',
      genres: ['Action', 'Drama']
    },
    selectedSeats: ['A1', 'A2'],
    totalSeatPrice: 100000,
    selectedCombos: [
      { id: '1', name: 'Test Combo', price: 50000, quantity: 1, image: 'combo.jpg' }
    ],
    totalComboPrice: 50000,
    user: {
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      username: 'testuser'
    }
  })),
  useDispatch: () => jest.fn()
}));

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ 
    data: { 
      user: {
        fullname: 'Test User',
        email: 'test@example.com',
        _id: '123',
        phone: '1234567890',
        username: 'testuser',
        gender: 'male',
        address: 'Test Address',
        id_card: '123456789',
        role: 'user'
      }
    } 
  })),
  post: jest.fn(() => Promise.resolve({
    data: {
      booking: {
        bookingId: 'BK123',
        grandTotal: 150000
      }
    }
  }))
}));

// Mock dayjs
jest.mock('dayjs', () => {
  const mockDayjs = (date) => ({
    toISOString: () => date || '2023-07-28T19:00:00.000Z',
    format: () => '28/07/2023'
  });
  mockDayjs.extend = jest.fn();
  return mockDayjs;
});

// Mock the SidebarLayout component
jest.mock('../../../components/Sidebar-Employee', () => {
  return function DummySidebar({ children }) {
    return <div data-testid="sidebar-mock">{children}</div>
  }
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(() => JSON.stringify({
    movieDetails: {
      name: 'Test Movie',
      image_url: 'test-image.jpg'
    },
    selectedSeats: ['A1', 'A2'],
    totalSeatPrice: 100000
  })),
  setItem: jest.fn(),
  removeItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('CounterConfirm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error and console.log
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
    console.log.mockRestore();
  });

  test('renders without crashing', () => {
    render(
      <MemoryRouter>
        <CounterConfirm />
      </MemoryRouter>
    );
    
    // Basic check for the component rendering
    expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
  });
});