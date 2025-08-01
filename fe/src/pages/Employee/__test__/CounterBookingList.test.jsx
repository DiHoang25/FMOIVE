import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CounterBookingList from '../CounterBookingList';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { message } from 'antd';
import { within } from '@testing-library/react';
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    authToken: 'mock-token',
  }),
}));

jest.mock('../../../components/Sidebar-Employee', () => ({ children }) => <div>{children}</div>);

jest.mock('../../../components/PaginationHomepage', () => ({ currentPage, totalPages }) => (
  <div data-testid="pagination">Page {currentPage + 1} of {totalPages}</div>
));

jest.mock('antd', () => {
  const original = jest.requireActual('antd');
  return {
    ...original,
    message: {
      ...original.message,
      error: jest.fn(),
    },
    Modal: ({ open, children }) => open ? <div data-testid="modal">{children}</div> : null,
  };
});

jest.mock('axios');

describe('CounterBookingList Component', () => {
  beforeEach(() => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/booking-management')) {
        return Promise.resolve({
          data: {
            bookings: [
              {
                _id: '1',
                user: { name: 'John Doe', phone: '0123456789' },
                movieDetails: {
                  name: 'Avengers',
                  time: new Date().toISOString(),
                  roomName: 'ROOM01',
                  image_url: '/poster.jpg',
                },
                selectedSeats: ['A1', 'A2'],
                status: 'PAID',
                createdAt: new Date().toISOString(),
                grandTotal: 200000,
                bookingId: 'BK001',
              },
            ],
          },
        });
      }
      if (url.includes('/theater/rooms')) {
        return Promise.resolve({ data: [{ roomId: 'ROOM01', roomName: 'Cinema 1' }] });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    render(
      <MemoryRouter>
        <CounterBookingList />
      </MemoryRouter>
    );
  });

  it('renders heading and search input', async () => {
    expect(await screen.findByText(/Booking Management/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search by name, phone, movie/i)).toBeInTheDocument();
  });

  it('does not crash when typing in search input', async () => {
    const input = await screen.findByPlaceholderText(/Search by name/i);
    fireEvent.change(input, { target: { value: 'Avengers' } });
    expect(input).toHaveValue('Avengers');
  });

  it('shows booking table with data', async () => {
    expect(await screen.findByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/Avengers/i)).toBeInTheDocument();
    expect(screen.getByText(/Success/i)).toBeInTheDocument();
  });

 it('opens modal when clicking FaEye', async () => {
  const eyeButton = await screen.findByRole('button');
  fireEvent.click(eyeButton);

  const modal = await screen.findByTestId('modal');
  const modalContent = within(modal);

  expect(modal).toBeInTheDocument();
  expect(modalContent.getByText(/Close/i)).toBeInTheDocument();
  expect(modalContent.getByText(/John Doe/i)).toBeInTheDocument();
  expect(modalContent.getByText(/BK001/i)).toBeInTheDocument();
  expect(modalContent.getByText(/200.*VND/i)).toBeInTheDocument();

});
});
