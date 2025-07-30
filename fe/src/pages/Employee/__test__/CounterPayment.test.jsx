import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useNavigate, useLocation } from 'react-router-dom';
import PaymentPage from '../CounterPayment';
import '@testing-library/jest-dom';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}));

jest.mock('../../../components/Sidebar-Employee', () => {
  return function MockSidebar({ children }) {
    return <div data-testid="sidebar">{children}</div>;
  };
});

describe('PaymentPage Component', () => {
  const mockNavigate = jest.fn();
  const mockLocation = {
    state: {
      movieDetails: { title: 'Test Movie' },
      selectedShowtimeTime: '14:00',
      fullShowtimeDate: '2023-10-01',
      selectedSeats: ['A1', 'A2'],
      selectedCombos: [
        { id: 1, name: 'Combo 1', price: 50000, quantity: 2 }
      ],
      selectedProducts: [
        { id: 1, name: 'Product 1', price: 30000, quantity: 1 }
      ],
      ticketPrice: 120000,
      combosTotal: 100000,
      productsTotal: 30000,
      finalTotal: 250000,
      userInformation: { name: 'Test User' },
    },
  };

  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
    useLocation.mockReturnValue(mockLocation);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<PaymentPage />);
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('displays the correct payment title', () => {
    render(<PaymentPage />);
    expect(screen.getByText('Complete Your Payment')).toBeInTheDocument();
  });

  it('shows all payment methods', () => {
    render(<PaymentPage />);
    expect(screen.getByText('VN Pay')).toBeInTheDocument();
    expect(screen.getByText('Cash Payment')).toBeInTheDocument();
  });

  it('defaults to VN Pay as selected payment method', () => {
    render(<PaymentPage />);
    const vnPayButton = screen.getByText('VN Pay').closest('button');
    expect(vnPayButton).toHaveClass('border-red-600');
  });

  it('allows switching payment methods', () => {
    render(<PaymentPage />);
    const cashButton = screen.getByText('Cash Payment').closest('button');
    
    fireEvent.click(cashButton);
    expect(cashButton).toHaveClass('border-red-600');
  });

  it('shows VN Pay notice when VN Pay is selected', () => {
    render(<PaymentPage />);
    expect(screen.getByText(/You'll be directed to the VN Pay gateway/i)).toBeInTheDocument();
  });

  it('shows cash notice when Cash Payment is selected', () => {
    render(<PaymentPage />);
    const cashButton = screen.getByText('Cash Payment').closest('button');
    fireEvent.click(cashButton);
    expect(screen.getByText(/Please collect cash from the customer/i)).toBeInTheDocument();
  });

  it('has a working back button', () => {
    render(<PaymentPage />);
    const backButton = screen.getByText('← Back');
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  describe('Payment Confirmation', () => {
    it('shows cash confirmation modal when Pay Now is clicked with cash selected', () => {
      render(<PaymentPage />);
      const cashButton = screen.getByText('Cash Payment').closest('button');
      fireEvent.click(cashButton);
      
      const payNowButton = screen.getByText('Pay Now');
      fireEvent.click(payNowButton);
      
      expect(screen.getByText('Confirm Cash Payment')).toBeInTheDocument();
    });

    it('closes cash confirmation modal when cancel is clicked', () => {
      render(<PaymentPage />);
      const cashButton = screen.getByText('Cash Payment').closest('button');
      fireEvent.click(cashButton);
      
      const payNowButton = screen.getByText('Pay Now');
      fireEvent.click(payNowButton);
      
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      
      expect(screen.queryByText('Confirm Cash Payment')).not.toBeInTheDocument();
    });

    it('navigates to success page when payment is confirmed', () => {
      render(<PaymentPage />);
      const cashButton = screen.getByText('Cash Payment').closest('button');
      fireEvent.click(cashButton);
      
      const payNowButton = screen.getByText('Pay Now');
      fireEvent.click(payNowButton);
      
      const confirmButton = screen.getByText('Confirm Paid');
      fireEvent.click(confirmButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/employee/counter-payment-success', {
        state: mockLocation.state
      });
    });

    it('simulates VN Pay redirect when Pay Now is clicked with VN Pay selected', () => {
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
      render(<PaymentPage />);
      
      const payNowButton = screen.getByText('Pay Now');
      fireEvent.click(payNowButton);
      
      expect(alertMock).toHaveBeenCalledWith('Redirecting to VN Pay gateway (simulated)...');
      expect(mockNavigate).toHaveBeenCalled();
      
      alertMock.mockRestore();
    });
  });
});