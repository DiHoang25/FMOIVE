// src/pages/User/ViewAccount/__tests__/ViewAccount.test.jsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ViewAccount from '../ViewAccount';

// Mock UserDashboardLayout component
jest.mock('../../../components/UserDashboardlayout', () => {
  return function MockUserDashboardLayout({ children }) {
    return <div data-testid="user-dashboard-layout">{children}</div>;
  };
});

// Mock avatar image
jest.mock('../../../assets/avatar.png', () => 'mock-avatar.png');

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock fetch globally
global.fetch = jest.fn();

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('ViewAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Test Case 1: Successfully loads and displays user data
  test('should display user information when data is loaded successfully', async () => {
    const mockUser = {
      fullname: 'John Doe',
      username: 'johndoe',
      email: 'john.doe@example.com',
      date_of_birth: '1990-05-15T00:00:00.000Z',
      phone: '+1234567890'
    };

    window.localStorage.getItem.mockReturnValue('mock-token');
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser }),
    });

    render(
      <TestWrapper>
        <ViewAccount />
      </TestWrapper>
    );

    // Should show loading initially
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for user data to load
    await waitFor(() => {
      expect(screen.getAllByText('John Doe')).toHaveLength(2); // Name appears twice (header and info)
    });

    expect(screen.getByText('Information Account')).toBeInTheDocument();
    expect(screen.getByText('johndoe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('15/05/1990')).toBeInTheDocument();
    expect(screen.getByText('+1234567890')).toBeInTheDocument();
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    expect(screen.getByText('Change Password')).toBeInTheDocument();
  });

  
  // Test Case 3: Handles authentication error (no token)
  test('should display error when user is not authenticated', async () => {
    window.localStorage.getItem.mockReturnValue(null); // No token

    render(
      <TestWrapper>
        <ViewAccount />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Not authenticated.')).toBeInTheDocument();
    });

    expect(screen.getByText('Not authenticated.')).toHaveClass('text-red-500');
  });

  // Test Case 4: Handles API error response
  test('should display error when API returns error', async () => {
    window.localStorage.getItem.mockReturnValue('mock-token');
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Unauthorized access' }),
    });

    render(
      <TestWrapper>
        <ViewAccount />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Unauthorized access')).toBeInTheDocument();
    });

    expect(screen.getByText('Unauthorized access')).toHaveClass('text-red-500');
  });

  // Test Case 5: Handles network error
  test('should display error when network request fails', async () => {
    window.localStorage.getItem.mockReturnValue('mock-token');
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    // Mock console.error to avoid error output in tests
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <TestWrapper>
        <ViewAccount />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch user data.')).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error fetching user:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  
  
  

  // Test Case 9: Date formatting function
  test('should format date correctly', async () => {
    const mockUser = {
      fullname: 'Date Test User',
      username: 'datetest',
      email: 'date@test.com',
      date_of_birth: '2000-01-01T00:00:00.000Z',
      phone: '111222333'
    };

    window.localStorage.getItem.mockReturnValue('mock-token');
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser }),
    });

    render(
      <TestWrapper>
        <ViewAccount />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('01/01/2000')).toBeInTheDocument();
    });
  });

  
  // Test Case 11: API error without message
  test('should display default error message when API error has no message', async () => {
    window.localStorage.getItem.mockReturnValue('mock-token');
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}), // No message in response
    });

    render(
      <TestWrapper>
        <ViewAccount />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch user data.')).toBeInTheDocument();
    });
  });

  // Test Case 12: Long email handling
  test('should handle long email addresses with break-all class', async () => {
    const mockUser = {
      fullname: 'Long Email User',
      username: 'longemail',
      email: 'this.is.a.very.long.email.address@verylongdomainname.com',
      date_of_birth: '1985-11-25T00:00:00.000Z',
      phone: '888999000'
    };

    window.localStorage.getItem.mockReturnValue('mock-token');
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser }),
    });

    render(
      <TestWrapper>
        <ViewAccount />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('this.is.a.very.long.email.address@verylongdomainname.com')).toBeInTheDocument();
    });

    const emailElement = screen.getByText('this.is.a.very.long.email.address@verylongdomainname.com');
    expect(emailElement).toHaveClass('break-all');
  });
});