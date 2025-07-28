import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import BookingList from '../BookingList';
import { BrowserRouter } from 'react-router-dom';

jest.mock('../../../components/Sidebar-Admin', () => ({ children }) => (
  <div data-testid="mock-sidebar">{children}</div>
));

jest.mock('axios');
import axios from 'axios';

const renderPage = () => {
  return render(
    <BrowserRouter>
      <BookingList />
    </BrowserRouter>
  );
};

describe('BookingList Page', () => {
  beforeEach(() => {
    axios.get.mockClear();
    localStorage.setItem('token', 'mock-token');
  });


  it('displays loading spinner when loading', async () => {
    let resolve;
    axios.get.mockImplementationOnce(() => new Promise(res => (resolve = res))); // room map
    axios.get.mockImplementationOnce(() => new Promise(() => {})); // never resolves

    renderPage();

    expect(await screen.findByText(/loading bookings/i)).toBeInTheDocument();

    resolve({ data: [] });
  });

  it('renders bookings when data is available', async () => {
    axios.get.mockResolvedValueOnce({ data: [] }); // room map
    axios.get.mockResolvedValueOnce({
      data: {
        bookings: [
          {
            _id: '1',
            user: { name: 'John Doe', phone: '123456' },
            movieDetails: {
              name: 'Movie X',
              time: new Date().toISOString(),
              roomName: 'ROOM01',
            },
            selectedSeats: ['A1', 'A2'],
            status: 'PAID',
            createdAt: new Date().toISOString(),
            bookingId: 'BK001',
            grandTotal: 100000,
          },
        ],
        total: 1,
      },
    });

    renderPage();

    expect(await screen.findByText(/John Doe/)).toBeInTheDocument();
    expect(screen.getByText(/Movie X/)).toBeInTheDocument();
    expect(screen.getByText(/Success/)).toBeInTheDocument();
  });

  it('can type in search input and trigger debounce', async () => {
    axios.get.mockResolvedValue({ data: [] });

    renderPage();

    const searchInput = await screen.findByPlaceholderText(/search by name/i);
    fireEvent.change(searchInput, { target: { value: 'abc' } });

    expect(searchInput.value).toBe('abc');
  });

});
