import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AdminDashboard from '../AdminDashboard';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

// Mock component layout
jest.mock('../../../components/Sidebar-Admin', () => ({ children }) => (
  <div data-testid="mock-sidebar">{children}</div>
));

// Mock Chart components
jest.mock('react-apexcharts', () => () => <div data-testid="apex-chart" />);
jest.mock('react-chartjs-2', () => ({
  Pie: () => <div data-testid="pie-chart" />,
}));

// Mock axios
jest.mock('axios');

const renderPage = () =>
  render(
    <BrowserRouter>
      <AdminDashboard />
    </BrowserRouter>
  );

describe('AdminDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'mock-token');

    axios.get.mockImplementation((url) => {
      if (url.includes('/api/booking-management')) {
        return Promise.resolve({
          data: {
            bookings: [
              {
                movieDetails: { name: 'Movie A' },
                grandTotal: 2000000,
                createdAt: new Date().toISOString(),
              },
              {
                movieDetails: { name: 'Movie B' },
                totalPrice: 1000000,
                createdAt: new Date().toISOString(),
              },
            ],
          },
        });
      }

      if (url.includes('/api/movies')) {
        return Promise.resolve({
          data: [
            {
              name: 'Movie A',
              start_date: '2025-07-01',
              end_date: '2025-08-01',
              createdAt: '2025-07-01T00:00:00Z',
            },
            {
              name: 'Movie B',
              start_date: '2025-08-10',
              end_date: '2025-09-01',
              createdAt: '2025-07-15T00:00:00Z',
            },
          ],
        });
      }
    });
  });

  it('renders layout and sidebar', async () => {
    renderPage();
    expect(await screen.findByTestId('mock-sidebar')).toBeInTheDocument();
  });

  it('renders movie stats cards', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Total Movies')).toBeInTheDocument();
      expect(screen.getByText('Now Showing')).toBeInTheDocument();
      expect(screen.getByText('Coming Soon')).toBeInTheDocument();
    });
  });

  it('renders quick action links', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/Add Movie/i)).toBeInTheDocument();
      expect(screen.getByText(/View Accounts/i)).toBeInTheDocument();
    });
  });

  it('renders charts', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      expect(screen.getAllByTestId('apex-chart')).toHaveLength(2);
    });
  });

  it('displays top revenue and booking movies', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/Movie A/)).toBeInTheDocument();
      expect(screen.getByText(/Movie B/)).toBeInTheDocument();
    });
  });
});
