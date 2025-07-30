import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ChangeAdminPassword from '../ChangeAdminPassword';
import { BrowserRouter } from 'react-router-dom';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

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

// Mock global fetch
global.fetch = jest.fn();

const renderPage = () => {
  localStorage.setItem('token', 'mock-token');
  return render(
    <BrowserRouter>
      <ChangeAdminPassword />
    </BrowserRouter>
  );
};

describe('ChangeAdminPassword Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders the page title and form elements correctly', () => {
    renderPage();
    
    // Check title
    expect(screen.getByText('Change Admin Password')).toBeInTheDocument();
    
    // Check input fields
    expect(screen.getByPlaceholderText('Enter your current password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your new password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Re-enter your new password')).toBeInTheDocument();
    
    // Check buttons
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Change Password/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    renderPage();
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('Please enter your current password.')).toBeInTheDocument();
      expect(screen.getByText('Please enter your new password.')).toBeInTheDocument();
      expect(screen.getByText('Please confirm your new password.')).toBeInTheDocument();
    });
  });

  it('shows password length validation error', async () => {
    renderPage();
    
    fireEvent.change(screen.getByPlaceholderText('Enter your current password'), {
      target: { value: 'oldpass' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your new password'), {
      target: { value: '123' }, // Less than 6 characters
    });
    fireEvent.change(screen.getByPlaceholderText('Re-enter your new password'), {
      target: { value: '123' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('New password must be at least 6 characters.')).toBeInTheDocument();
    });
  });

  it('shows password mismatch error', async () => {
    renderPage();
    
    fireEvent.change(screen.getByPlaceholderText('Enter your current password'), {
      target: { value: 'oldpass' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your new password'), {
      target: { value: 'newpass123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Re-enter your new password'), {
      target: { value: 'wrongpass' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('New passwords do not match.')).toBeInTheDocument();
    });
  });

  it('clears errors when user types in input fields', async () => {
    renderPage();
    
    // Submit empty form to trigger errors
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('Please enter your current password.')).toBeInTheDocument();
    });

    // Type in current password field
    fireEvent.change(screen.getByPlaceholderText('Enter your current password'), {
      target: { value: 'test' },
    });

    // Error should be cleared
    expect(screen.queryByText('Please enter your current password.')).not.toBeInTheDocument();
  });

  it('handles API error response gracefully', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid current password' }),
    });

    renderPage();
    
    fireEvent.change(screen.getByPlaceholderText('Enter your current password'), {
      target: { value: 'wrongpass' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your new password'), {
      target: { value: 'newpass123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Re-enter your new password'), {
      target: { value: 'newpass123' },
    });
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('Invalid current password')).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/auth/change-password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer mock-token',
      },
      body: JSON.stringify({
        currentPassword: 'wrongpass',
        newPassword: 'newpass123',
        confirmNewPassword: 'newpass123',
      }),
    });
  });

  it('shows success modal and redirects after successful password change', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Password changed successfully' }),
    });

    renderPage();
    
    fireEvent.change(screen.getByPlaceholderText('Enter your current password'), {
      target: { value: 'admin123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your new password'), {
      target: { value: 'newpass123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Re-enter your new password'), {
      target: { value: 'newpass123' },
    });
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('Password Changed!')).toBeInTheDocument();
      expect(screen.getByText('Your password has been updated successfully.')).toBeInTheDocument();
    });

    // Click OK button in success modal
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    });

    expect(mockNavigate).toHaveBeenCalledWith('/admin/admin-profile');
  });

  it('redirects to login if token is not found', async () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Re-render without token
    render(
      <BrowserRouter>
        <ChangeAdminPassword />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Enter your current password'), {
      target: { value: 'admin123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your new password'), {
      target: { value: 'newpass123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Re-enter your new password'), {
      target: { value: 'newpass123' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));
    });

    // The component should navigate to login immediately when no token is found
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('handles network error gracefully', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    renderPage();
    
    fireEvent.change(screen.getByPlaceholderText('Enter your current password'), {
      target: { value: 'admin123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your new password'), {
      target: { value: 'newpass123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Re-enter your new password'), {
      target: { value: 'newpass123' },
    });
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('Something went wrong. Please try again. (Network error)')).toBeInTheDocument();
    });
  });

  it('navigates to admin profile when cancel button is clicked', () => {
    renderPage();
    
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    
    expect(mockNavigate).toHaveBeenCalledWith('/admin/admin-profile');
  });

  it('clears form data after successful password change', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Password changed successfully' }),
    });

    renderPage();
    
    const currentPasswordInput = screen.getByPlaceholderText('Enter your current password');
    const newPasswordInput = screen.getByPlaceholderText('Enter your new password');
    const confirmPasswordInput = screen.getByPlaceholderText('Re-enter your new password');
    
    fireEvent.change(currentPasswordInput, { target: { value: 'admin123' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newpass123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpass123' } });
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('Password Changed!')).toBeInTheDocument();
    });

    // Form should be cleared
    expect(currentPasswordInput.value).toBe('');
    expect(newPasswordInput.value).toBe('');
    expect(confirmPasswordInput.value).toBe('');
  });
});