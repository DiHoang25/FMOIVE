// src/pages/Admin/__test__/AdminProfile.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AdminProfile from '../AdminProfile';
import { BrowserRouter } from 'react-router-dom';
import fetchMock from 'jest-fetch-mock';

// Mock Sidebar-Admin để tránh import phụ thuộc
jest.mock('../../../components/Sidebar-Admin', () => ({ children }) => (
  <div data-testid="mock-sidebar">{children}</div>
));

// Helper render bọc với Router
const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

beforeEach(() => {
  fetchMock.resetMocks();
  localStorage.setItem('token', 'mock-token');
});

describe('AdminProfile', () => {
  it('renders loading state initially', () => {
    fetchMock.mockResponse(() => new Promise(() => {})); // never resolves
    renderWithRouter(<AdminProfile />);
    expect(document.querySelector('.ant-spin-spinning')).toBeInTheDocument();
  });

  it('renders error state if fetch fails', async () => {
    fetchMock.mockRejectOnce(() => Promise.reject('API is down'));
    renderWithRouter(<AdminProfile />);
    await waitFor(() => {
      expect(screen.getByText(/Error/i)).toBeInTheDocument();
      expect(screen.getByText(/Failed to fetch user data/i)).toBeInTheDocument();
    });
  });

  it('renders error if no token found', async () => {
    localStorage.removeItem('token');
    renderWithRouter(<AdminProfile />);
    await waitFor(() => {
      expect(screen.getByText(/Not authenticated/i)).toBeInTheDocument();
    });
  });

  it('displays user info on successful fetch', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        user: {
          fullname: 'Admin Test',
          username: 'admin',
          email: 'admin@example.com',
          date_of_birth: '1995-12-01T00:00:00.000Z',
          phone: '0987654321',
        },
      })
    );
  
    renderWithRouter(<AdminProfile />);
  
    await waitFor(() => {
      expect(screen.getAllByText('Admin Test').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
      expect(screen.getByText('01/12/1995')).toBeInTheDocument();
      expect(screen.getByText('0987654321')).toBeInTheDocument();
    });
  });
  

  it('handles missing optional fields like phone and dob', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        user: {
          fullname: 'Admin NoInfo',
          username: 'admin123',
          email: 'noinfo@example.com',
          phone: '',
          date_of_birth: null,
        },
      })
    );
  
    renderWithRouter(<AdminProfile />);
  
    await waitFor(() => {
      expect(screen.getAllByText('Admin NoInfo').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('admin123')).toBeInTheDocument();
      expect(screen.getByText('noinfo@example.com')).toBeInTheDocument();
      expect(screen.getAllByText('Not provided')).toHaveLength(2);
    });
  });
  
});
