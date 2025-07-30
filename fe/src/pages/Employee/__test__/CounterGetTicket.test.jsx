import React from 'react';
import { render, screen } from '@testing-library/react';
import CounterGetTicket from '../CounterGetTicket';
import { MemoryRouter } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('CounterGetTicket Component', () => {
  test('renders movie title and poster', () => {
    render(
      <MemoryRouter>
        <CounterGetTicket />
      </MemoryRouter>
    );

    expect(screen.getByText('🎟️ Confirm Your Booking')).toBeInTheDocument();
    expect(screen.getByText('The Dark Knight')).toBeInTheDocument();
    expect(screen.getByAltText('Poster')).toBeInTheDocument();
  });

  test('renders selected seats', () => {
    render(
      <MemoryRouter>
        <CounterGetTicket />
      </MemoryRouter>
    );

    expect(screen.getByText('🎫 Seat Selection')).toBeInTheDocument();
    expect(screen.getByText('A2')).toBeInTheDocument();
    expect(screen.getByText('A3')).toBeInTheDocument();
    expect(screen.getByText('A5')).toBeInTheDocument();
  });

  test('renders combos if available', () => {
    render(
      <MemoryRouter>
        <CounterGetTicket />
      </MemoryRouter>
    );

    expect(screen.getByText('🍿 Popcorn & Drinks')).toBeInTheDocument();
    expect(screen.getByText('Combo A × 1')).toBeInTheDocument();
    expect(screen.getByText('Combo B × 2')).toBeInTheDocument();
  });

  test('renders payment summary and total', () => {
    render(
      <MemoryRouter>
        <CounterGetTicket />
      </MemoryRouter>
    );

    expect(screen.getByText('💳 Payment Summary')).toBeInTheDocument();
    expect(screen.getByText('Standard Ticket × 3')).toBeInTheDocument();
    expect(screen.getByText('$45.00')).toBeInTheDocument(); 
    expect(screen.getByText('$2.50')).toBeInTheDocument();  
    expect(screen.getByText('$23.00')).toBeInTheDocument(); 
    expect(screen.getByText('$70.50')).toBeInTheDocument(); 
  });
});
