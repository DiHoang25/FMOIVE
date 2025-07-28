import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store'; // For mocking Redux store
import PaymentPage from '../../Users/PaymentMethod'; // Corrected path to the component

// Mock Ant Design's message for notifications
// Declare mockMessage outside and initialize it within the jest.mock factory
let mockMessage;
jest.mock('antd', () => {
  mockMessage = { // Initialize mockMessage here
    error: jest.fn(),
    loading: jest.fn(),
    success: jest.fn(),
  };
  return {
    message: mockMessage,
  };
});

// Mock react-router-dom's useNavigate and useLocation
const mockNavigate = jest.fn();
const mockUseLocation = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockUseLocation(),
}));

// Mock Redux useSelector
const mockStore = configureStore([]);
let store;

// Mock image imports with correct relative paths
jest.mock('../../../assets/vnpay-icon.png', () => 'vnpay-icon-mock.png');
jest.mock('../../../assets/payos.png', () => 'payos-icon-mock.png');

describe('PaymentPage Component', () => {
  const initialState = {
    booking: {
      grandTotal: 150000,
      totalSeatPrice: 100000,
      totalComboPrice: 50000,
      selectedSeats: [{ id: 'A1' }, { id: 'A2' }],
      selectedCombos: [{ name: 'Popcorn', quantity: 1 }],
      user: { _id: 'user123', username: 'testuser' },
    },
  };

  // Store original window.location for restoration
  const originalWindowLocation = window.location;

  beforeEach(() => {
    jest.clearAllMocks();
    store = mockStore(initialState);

    // Clear Ant Design message mocks before each test
    if (mockMessage) { // Ensure mockMessage is initialized
      mockMessage.error.mockClear();
      mockMessage.loading.mockClear();
      mockMessage.success.mockClear();
    }


    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key) => {
          if (key === 'token') return 'fake-jwt-token';
          return null;
        }),
        setItem: jest.fn(),
        clear: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });

    // Mock window.location.href for redirects
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: originalWindowLocation.href },
    });

    // Default mock for useLocation state
    mockUseLocation.mockReturnValue({
      state: {
        bookingId: 'booking123',
        grandTotal: 150000,
      },
    });

    // Mock global fetch
    global.fetch = jest.fn((url) => {
      if (url.includes('/api/vnpay-payment/create_payment_url')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ paymentUrl: 'http://vnpay.redirect.com/payment' }),
        });
      }
      if (url.includes('/api/payos-payment/create-payment')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ payosPaymentUrl: 'http://payos.redirect.com/checkout' }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) }); // Default success
    });

    // Spy on console.error to prevent it from failing tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original console.error
    jest.restoreAllMocks();
    // Restore original window.location
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalWindowLocation,
    });
  });

  // Helper function to render the component with Redux Provider
  const renderComponent = () =>
    render(
      <Provider store={store}>
        <PaymentPage />
      </Provider>
    );

  // Test Case 1: Renders correctly with default PayOS selected and correct total
  test('1. Renders with default PayOS selected and displays correct total amount', async () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: /complete your payment/i })).toBeInTheDocument();
    expect(screen.getByText(/payos \(napas\)/i)).toBeInTheDocument();
    expect(screen.getByText(/vn pay/i)).toBeInTheDocument();

    // Check if PayOS is initially selected
    const payosButton = screen.getByRole('button', { name: /payos \(napas\)/i });
    expect(payosButton).toHaveClass('border-red-600');

    // Check total amount displayed
    expect(screen.getByText(/total amount/i)).toBeInTheDocument();
    expect(screen.getByText('150.000 VND')).toBeInTheDocument(); // Formatted total
    expect(screen.getByText('Pay 150.000 VND')).toBeInTheDocument(); // Payment button text
  });

  // Test Case 2: Displays booking details from Redux
  test('2. Displays order summary details from Redux state', () => {
    renderComponent();
    expect(screen.getByText(/movie tickets \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText(/100.000 VND/i)).toBeInTheDocument(); // totalSeatPrice
    expect(screen.getByText(/popcorns & drinks \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/50.000 VND/i)).toBeInTheDocument(); // totalComboPrice
  });

  // Test Case 3: Shows error message if bookingId is missing from location.state
  test('3. Shows error message if bookingId is missing from location.state', () => {
    mockUseLocation.mockReturnValue({ state: { grandTotal: 150000 } }); // No bookingId
    renderComponent();
    expect(mockMessage.error).toHaveBeenCalledWith('Booking details missing. Please go back to confirm your booking.');
  });

  // Test Case 4: Changes selected payment method on click
  test('4. Changes selected payment method when VN Pay button is clicked', () => {
    renderComponent();
    const vnpayButton = screen.getByRole('button', { name: /vn pay/i });
    fireEvent.click(vnpayButton);
    expect(vnpayButton).toHaveClass('border-red-600'); // VN Pay should now be selected
    const payosButton = screen.getByRole('button', { name: /payos \(napas\)/i });
    expect(payosButton).not.toHaveClass('border-red-600'); // PayOS should not be selected
  });

  // Test Case 5: Initiates VNPAY payment successfully and redirects
  test('5. Initiates VNPAY payment and redirects on success', async () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /vn pay/i })); // Select VNPAY
    fireEvent.click(screen.getByRole('button', { name: /pay 150.000 vnd/i })); // Click Pay button

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/vnpay-payment/create_payment_url'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer fake-jwt-token',
          },
          body: JSON.stringify({
            bookingId: 'booking123',
            grandTotal: 150000,
            bankCode: '',
            language: 'vn',
            userId: 'user123',
          }),
        })
      );
    });

    expect(mockMessage.loading).toHaveBeenCalledWith('Redirecting to VNPAY...', 1.5);
    expect(window.location.href).toBe('http://vnpay.redirect.com/payment');
  });

  // Test Case 6: Initiates PayOS payment successfully and redirects
  test('6. Initiates PayOS payment and redirects on success', async () => {
    renderComponent();
    // PayOS is default selected
    fireEvent.click(screen.getByRole('button', { name: /pay 150.000 vnd/i })); // Click Pay button

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/payos-payment/create-payment'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer fake-jwt-token',
          },
          body: JSON.stringify({
            bookingId: 'booking123',
          }),
        })
      );
    });

    expect(mockMessage.loading).toHaveBeenCalledWith('Redirecting to PayOS...', 1.5);
    expect(window.location.href).toBe('http://payos.redirect.com/checkout');
  });

  // Test Case 7: Shows error if VNPAY payment initiation fails
  test('7. Shows error if VNPAY payment initiation fails', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'VNPAY error message' }),
      })
    );

    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /vn pay/i })); // Select VNPAY
    fireEvent.click(screen.getByRole('button', { name: /pay 150.000 vnd/i })); // Click Pay button

    await waitFor(() => {
      expect(mockMessage.error).toHaveBeenCalledWith('VNPAY error message');
    });
    expect(console.error).toHaveBeenCalledWith('VNPAY payment initiation failed:', 'VNPAY error message');
    expect(window.location.href).not.toBe('http://vnpay.redirect.com/payment'); // No redirect
  });

  // Test Case 8: Shows error if PayOS payment initiation fails
  test('8. Shows error if PayOS payment initiation fails', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'PayOS error message' }),
      })
    );

    renderComponent();
    // PayOS is default selected
    fireEvent.click(screen.getByRole('button', { name: /pay 150.000 vnd/i })); // Click Pay button

    await waitFor(() => {
      expect(mockMessage.error).toHaveBeenCalledWith('PayOS error message');
    });
    expect(console.error).toHaveBeenCalledWith('PayOS payment initiation failed:', 'PayOS error message');
    expect(window.location.href).not.toBe('http://payos.redirect.com/checkout'); // No redirect
  });

  // Test Case 9: Shows error if token is missing when initiating payment
  test('9. Shows error if authentication token is missing', async () => {
    localStorage.getItem.mockReturnValueOnce(null); // Simulate missing token

    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /pay 150.000 vnd/i })); // Click Pay button

    await waitFor(() => {
      expect(mockMessage.error).toHaveBeenCalledWith('Authentication required. Please log in.');
    });
    expect(global.fetch).not.toHaveBeenCalled(); // Fetch should not be called
  });

  // Test Case 10: Shows error if user information is missing from Redux
  test('10. Shows error if user information is missing from Redux', async () => {
    store = mockStore({
      booking: {
        ...initialState.booking,
        user: null, // Simulate missing user
      },
    });
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /pay 150.000 vnd/i })); // Click Pay button

    await waitFor(() => {
      expect(mockMessage.error).toHaveBeenCalledWith('User information missing. Please ensure you are logged in correctly.');
    });
    expect(global.fetch).not.toHaveBeenCalled(); // Fetch should not be called
  });

  // Test Case 11: "Back to Confirm" button navigates back
  test('11. "Back to Confirm" button navigates back', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /back to confirm/i }));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  // Test Case 12: Payment button is disabled while processing
  test('12. Payment button is disabled while processing payment', async () => {
    global.fetch.mockImplementationOnce(() => new Promise(() => {})); // Never resolve fetch

    renderComponent();
    const payButton = screen.getByRole('button', { name: /pay 150.000 vnd/i });
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(payButton).toBeDisabled();
      expect(payButton).toHaveTextContent('Processing...');
    });
  });

  // Test Case 13: Shows error if finalPaymentAmount is zero
  test('13. Shows error if finalPaymentAmount is zero', async () => {
    mockUseLocation.mockReturnValue({
      state: {
        bookingId: 'booking123',
        grandTotal: 0,
      },
    });
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /pay 0 vnd/i })); // Button text updates

    await waitFor(() => {
      expect(mockMessage.error).toHaveBeenCalledWith('Payment amount must be greater than zero.');
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  // Test Case 14: Handles generic network error during payment initiation
  test('14. Handles generic network error during payment initiation', async () => {
    global.fetch.mockImplementationOnce(() => Promise.reject(new Error('Network is down')));

    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /pay 150.000 vnd/i }));

    await waitFor(() => {
      expect(mockMessage.error).toHaveBeenCalledWith('An unexpected error occurred. Please try again.');
    });
    expect(console.error).toHaveBeenCalledWith('Error initiating payment:', expect.any(Error));
  });
});
