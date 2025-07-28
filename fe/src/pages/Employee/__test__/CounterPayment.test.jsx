import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PaymentPage from '../../Users/PaymentMethod';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import bookingReducer from '../../../redux/bookingSlice';

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ paymentUrl: 'https://sandbox.vnpay.vn/payment/12345' }),
  })
);

// Mock message from antd
jest.mock('antd', () => ({
  message: {
    error: jest.fn(),
    loading: jest.fn(),
  },
}));

const renderWithRouterAndRedux = (locationState = {}) => {
  const mockStore = configureStore({
    reducer: {
      booking: bookingReducer,
    },
    preloadedState: {
      booking: {
        user: {
          _id: 'user123',
          name: 'Test User',
        },
      },
    },
  });

  return render(
    <Provider store={mockStore}>
      <MemoryRouter initialEntries={[{ pathname: '/payment', state: locationState }]}>
        <Routes>
          <Route path="/payment" element={<PaymentPage />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

describe('PaymentPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with given data', () => {
    renderWithRouterAndRedux({
      bookingId: 'booking123',
      finalTotal: 320000,
      selectedSeats: ['A1', 'A2'],
      selectedCombos: [{ name: 'Combo 1', quantity: 1 }],
      selectedProducts: [],
      ticketPrice: 250000,
      combosTotal: 60000,
      productsTotal: 0,
      voucherDiscount: 0,
      userInformation: { _id: 'user123' },
    });

    expect(screen.getByText(/Complete Your Payment/i)).toBeInTheDocument();
    expect(screen.getByText(/Movie Tickets \(2\)/)).toBeInTheDocument();
    expect(screen.getByText(/250.000 VND/)).toBeInTheDocument();
    expect(screen.getByText(/60.000 VND/)).toBeInTheDocument();
    expect(screen.getByText(/Pay 320.000 VND/)).toBeInTheDocument();
  });

  it('calls fetch when Pay button is clicked', async () => {
    renderWithRouterAndRedux({
      bookingId: 'booking123',
      finalTotal: 320000,
      selectedSeats: ['A1', 'A2'],
      selectedCombos: [{ name: 'Combo 1', quantity: 1 }],
      selectedProducts: [],
      ticketPrice: 250000,
      combosTotal: 60000,
      productsTotal: 0,
      voucherDiscount: 0,
      userInformation: { _id: 'user123' },
    });

    const payButton = screen.getByRole('button', { name: /Pay 320.000 VND/i });
    fireEvent.click(payButton);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/payment/create_payment_url'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: expect.stringContaining('"grandTotal":320000'),
      })
    );
  });
});
