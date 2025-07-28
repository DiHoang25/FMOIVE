import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChangeAdminPassword from '../ChangeAdminPassword';
import { BrowserRouter } from 'react-router-dom';

// Mock matchMedia for antd or responsive behavior
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }),
  });
});

// Mock SidebarLayout
jest.mock('../../../components/Sidebar-Admin', () => ({ children }) => (
  <div data-testid="mock-sidebar">{children}</div>
));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

global.fetch = jest.fn();

const renderPage = () => {
  localStorage.setItem('token', 'mock-token');
  render(
    <BrowserRouter>
      <ChangeAdminPassword />
    </BrowserRouter>
  );
};

describe('ChangeAdminPassword Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders input fields and buttons', () => {
    renderPage();
    expect(screen.getByPlaceholderText('Current Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('New Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Re-enter New Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/Please/i).length).toBeGreaterThan(0);
    });
  });

  it('shows password mismatch error', async () => {
    renderPage();
    fireEvent.change(screen.getByPlaceholderText('Current Password'), {
      target: { value: 'oldpass' },
    });
    fireEvent.change(screen.getByPlaceholderText('New Password'), {
      target: { value: 'newpass123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Re-enter New Password'), {
      target: { value: 'wrongpass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    });
  });

  it('handles API error response gracefully', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid current password' }),
    });

    renderPage();
    fireEvent.change(screen.getByPlaceholderText('Current Password'), {
      target: { value: 'wrongpass' },
    });
    fireEvent.change(screen.getByPlaceholderText('New Password'), {
      target: { value: 'newpass123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Re-enter New Password'), {
      target: { value: 'newpass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid current password')).toBeInTheDocument();
    });
  });

  it('shows success modal and redirects after confirming', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Success' }),
    });

    renderPage();
    fireEvent.change(screen.getByPlaceholderText('Current Password'), {
      target: { value: 'oldpass' },
    });
    fireEvent.change(screen.getByPlaceholderText('New Password'), {
      target: { value: 'newpass123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Re-enter New Password'), {
      target: { value: 'newpass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() => {
      expect(screen.getByText(/Password Changed!/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(mockNavigate).toHaveBeenCalledWith('/admin/admin-profile');
  });
});
