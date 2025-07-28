import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import EditAccount from './../EditAccount'; // Update the import path

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock fetch
global.fetch = jest.fn();

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock UserDashboardLayout to simplify testing
jest.mock('../../../components/UserDashboardlayout', () => ({ children }) => (
  <div data-testid="dashboard-layout">{children}</div>
));

describe('EditAccount Component', () => {
  const mockUserData = {
    user: {
      fullname: 'John Doe',
      username: 'johndoe',
      email: 'john@gmail.com',
      date_of_birth: '1990-01-01T00:00:00.000Z',
      gender: 'male',
      phone: '1234567890'
    }
  };

  beforeEach(() => {
    // Reset mocks before each test
    fetch.mockClear();
    mockNavigate.mockClear();
    localStorageMock.clear();
    localStorageMock.getItem.mockReturnValue('test-token');
  });

  // Test 1: Renders correctly with user data
  test('renders the edit account form with user data', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUserData),
    });

    render(
      <MemoryRouter>
        <EditAccount />
      </MemoryRouter>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Edit Account Information')).toBeInTheDocument();
      expect(screen.getByDisplayValue('johndoe')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@gmail.com')).toBeInTheDocument();
      expect(screen.getByText('1234567890')).toBeInTheDocument();
      expect(screen.getByText('01/01/1990')).toBeInTheDocument();
      expect(screen.getByText('male')).toBeInTheDocument();
    });
  });

  // Test 2: Navigates to login if no token
  test('navigates to login if no token exists', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    render(
      <MemoryRouter>
        <EditAccount />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  

  
  // Test 5: Validates email format
  test('validates email format must end with @gmail.com', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUserData),
    });

    render(
      <MemoryRouter>
        <EditAccount />
      </MemoryRouter>
    );

    // Wait for data to load
    await screen.findByText('John Doe');

    // Enable edit mode for email
    fireEvent.click(screen.getAllByText('Edit')[1]);

    // Enter invalid email
    fireEvent.change(screen.getByDisplayValue('john@gmail.com'), { 
      target: { value: 'john@yahoo.com' } 
    });

    // Click save
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(screen.getByText('Email must end with @gmail.com')).toBeInTheDocument();
    });
  });

  // Test 6: Successfully updates profile
  test('successfully updates profile and shows success modal', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUserData),
    }).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(
      <MemoryRouter>
        <EditAccount />
      </MemoryRouter>
    );

    // Wait for data to load
    await screen.findByText('John Doe');

    // Enable edit mode for fullname
    fireEvent.click(screen.getAllByText('Edit')[0]);

    // Change fullname
    fireEvent.change(screen.getByDisplayValue('John Doe'), { 
      target: { value: 'John Smith' } 
    });

    // Click save
    fireEvent.click(screen.getByText('Save'));

    // Verify API call
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({
          ...mockUserData.user,
          fullname: 'John Smith',
          date_of_birth: '1990-01-01'
        })
      });
      expect(screen.getByText('Success')).toBeInTheDocument();
    });
  });

  // Test 7: Navigates to view account on cancel
  test('navigates to view account when cancel button is clicked', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUserData),
    });

    render(
      <MemoryRouter>
        <EditAccount />
      </MemoryRouter>
    );

    // Wait for data to load
    await screen.findByText('John Doe');

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockNavigate).toHaveBeenCalledWith('/viewaccount');
  });

  // Test 8: Navigates to view account after successful update
  test('navigates to view account after successful update confirmation', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUserData),
    }).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(
      <MemoryRouter>
        <EditAccount />
      </MemoryRouter>
    );

    // Wait for data to load
    await screen.findByText('John Doe');

    // Click save (with no changes)
    fireEvent.click(screen.getByText('Save'));

    // Wait for success modal
    await screen.findByText('Success');

    // Click OK button
    fireEvent.click(screen.getByText('OK'));

    expect(mockNavigate).toHaveBeenCalledWith('/viewaccount');
  });

  // Test 9: Handles fetch error when loading profile
  test('handles error when fetching profile data', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(
      <MemoryRouter>
        <EditAccount />
      </MemoryRouter>
    );

    // Should not crash and should show empty form
    await waitFor(() => {
      expect(screen.getByText('Edit Account Information')).toBeInTheDocument();
    });
  });

  // Test 10: Handles update failure
  test('handles update failure gracefully', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUserData),
    }).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Update failed' }),
    });

    render(
      <MemoryRouter>
        <EditAccount />
      </MemoryRouter>
    );

    // Wait for data to load
    await screen.findByText('John Doe');

    // Click save (with no changes)
    fireEvent.click(screen.getByText('Save'));

    // Should not show success modal
    await waitFor(() => {
      expect(screen.queryByText('Success')).not.toBeInTheDocument();
    });
  });
});