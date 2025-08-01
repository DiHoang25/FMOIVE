import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PaymentSuccess from '../PaymentSuccessfull'; 
import { MemoryRouter, useNavigate, useLocation } from 'react-router-dom';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
  useNavigate: () => mockNavigate,
}));

describe('PaymentSuccess', () => {
  beforeEach(() => {
    useLocation.mockReturnValue({
      state: {
        movieDetails: {
          name: 'Avengers: Endgame',
          image_url: 'https://image.tmdb.org/t/p/w500/avengers.jpg',
          cinema_room: 'Room 5',
        },
        fullShowtimeDate: '2025-08-01',
        selectedShowtimeTime: '18:30',
        selectedSeats: ['A1', 'A2'],
        selectedCombos: [
          { id: 'c1', name: 'Popcorn + Drink', quantity: 2, price: 50000 },
        ],
        ticketPrice: 200000,
        serviceFee: 10000,
        combosTotal: 100000,
        finalTotal: 310000,
      },
    });
  });

  it('renders movie and payment details correctly', () => {
    render(
      <MemoryRouter>
        <PaymentSuccess />
      </MemoryRouter>
    );

    expect(screen.getByText(/Payment Successful/i)).toBeInTheDocument();
    expect(screen.getByText(/Avengers: Endgame/i)).toBeInTheDocument();
    expect(screen.getByText(/18:30/i)).toBeInTheDocument();
    expect(screen.getByText(/Room 5/i)).toBeInTheDocument();
    expect(screen.getByText(/Selected Seats/i)).toBeInTheDocument();
    expect(screen.getByText('A1')).toBeInTheDocument();
    expect(screen.getByText('A2')).toBeInTheDocument();
    expect(screen.getByText(/Combos & Snacks/i)).toBeInTheDocument();
    expect(screen.getByText(/Popcorn \+ Drink/i)).toBeInTheDocument();
   

  });

  it('navigates to dashboard when button clicked', () => {
    render(
      <MemoryRouter>
        <PaymentSuccess />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/Go to Dashboard/i));
    expect(mockNavigate).toHaveBeenCalledWith('/employee/dashboard');
  });
});
