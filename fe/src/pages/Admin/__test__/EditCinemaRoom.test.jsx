// EditCinemaRoom.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditCinemaRoom from '../EditCinemaRoom';
import { BrowserRouter } from 'react-router-dom';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: () => ({
      matches: false,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }),
  });
});

// Mock useParams + useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ roomId: '123' }),
  useNavigate: () => mockNavigate,
}));

// Mock Sidebar
jest.mock('../../../components/Sidebar-Admin', () => ({ children }) => (
  <div data-testid="mock-sidebar">{children}</div>
));

// Setup mock fetch
beforeEach(() => {
  localStorage.setItem('token', 'mock-token');
  global.fetch = jest.fn((url, options) => {
    if (url.includes('/api/theater/rooms/123') && !options?.method) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          room: {
            roomName: 'Room A',
            roomType: '2D',
            rows: 5,
            columns: 6,
            seats: [
              { type: 'Normal', price: 60000 },
              { type: 'VIP', price: 100000 }
            ],
          }
        }),
      });
    }

    if (url.includes('/update-prices') && options?.method === 'PATCH') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Update success' }),
      });
    }

    return Promise.reject(new Error('Unknown API'));
  });
});

describe('EditCinemaRoom Page', () => {
  it('renders room info correctly', async () => {
    render(
      <BrowserRouter>
        <EditCinemaRoom />
      </BrowserRouter>
    );

    expect(await screen.findByText('Edit Cinema Room')).toBeInTheDocument();
    expect(await screen.findByText('Room A')).toBeInTheDocument();
    expect(screen.getByText('2D')).toBeInTheDocument();
    expect(screen.getByText('5 x 6')).toBeInTheDocument();
    expect(screen.getByText('60.000 VND')).toBeInTheDocument();
    expect(screen.getByText('100.000 VND')).toBeInTheDocument();
  });

  it('edits normal seat price and submits', async () => {
    render(
      <BrowserRouter>
        <EditCinemaRoom />
      </BrowserRouter>
    );

    // Wait for initial price
    expect(await screen.findByText('60.000 VND')).toBeInTheDocument();

    // Toggle edit normal
    fireEvent.click(screen.getAllByRole('button', { name: /Edit/i })[0]);

    // Change input
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '75000' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Update Room/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/update-prices'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ normalPrice: 75000, vipPrice: 100000 }),
        })
      );
    });

    expect(mockNavigate).toHaveBeenCalledWith('/admin/cinema-rooms');
  });

  it('edits VIP seat price and submits', async () => {
    render(
      <BrowserRouter>
        <EditCinemaRoom />
      </BrowserRouter>
    );

    await screen.findByText('Room A');

    fireEvent.click(screen.getAllByRole('button', { name: /Edit/i })[1]);
    const vipInput = screen.getByRole('spinbutton');
    fireEvent.change(vipInput, { target: { value: '120000' } });

    fireEvent.click(screen.getByRole('button', { name: /Update Room/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/update-prices'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ normalPrice: 60000, vipPrice: 120000 }),
        })
      );
    });

    expect(mockNavigate).toHaveBeenCalledWith('/admin/cinema-rooms');
  });

  it('navigates back on cancel', async () => {
    render(
      <BrowserRouter>
        <EditCinemaRoom />
      </BrowserRouter>
    );

    await screen.findByText('Room A');
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/admin/cinema-rooms');
  });
});
