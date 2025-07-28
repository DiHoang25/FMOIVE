import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ChangeEmPassword from '../ChangeEmPassword';

global.fetch = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.mock('../../../components/Sidebar-Employee', () => ({ children }) => <div data-testid="sidebar-layout">{children}</div>);

describe('ChangeEmPassword', () => {
  beforeEach(() => {
    localStorage.clear();
    
    global.fetch.mockReset();
    
    localStorage.setItem('token', 'fake-token');
  });

  test('renders change password form', () => {
    render(
      <MemoryRouter>
        <ChangeEmPassword />
      </MemoryRouter>
    );

    expect(screen.getByText('Change Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Current Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('New Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Re-enter New Password')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  test('validates empty form fields', () => {
    render(
      <MemoryRouter>
        <ChangeEmPassword />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Save'));

    expect(screen.getByText('Please enter your current password.')).toBeInTheDocument();
    expect(screen.getByText('Please enter your new password.')).toBeInTheDocument();
    expect(screen.getByText('Please confirm your new password.')).toBeInTheDocument();
  });

  test('validates password length', () => {
    render(
      <MemoryRouter>
        <ChangeEmPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Current Password'), { target: { value: 'current' } });
    fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: 'short' } });
    fireEvent.change(screen.getByPlaceholderText('Re-enter New Password'), { target: { value: 'short' } });

    fireEvent.click(screen.getByText('Save'));

    expect(screen.getByText('Password must be at least 6 characters.')).toBeInTheDocument();
  });

  test('validates password match', () => {
    render(
      <MemoryRouter>
        <ChangeEmPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Current Password'), { target: { value: 'current123' } });
    fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: 'newpass123' } });
    fireEvent.change(screen.getByPlaceholderText('Re-enter New Password'), { target: { value: 'different123' } });

    fireEvent.click(screen.getByText('Save'));

    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
  });

  test('handles successful password change', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Password changed successfully' })
    });

    render(
      <MemoryRouter>
        <ChangeEmPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Current Password'), { target: { value: 'current123' } });
    fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: 'newpass123' } });
    fireEvent.change(screen.getByPlaceholderText('Re-enter New Password'), { target: { value: 'newpass123' } });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(screen.getByText('Password Changed!')).toBeInTheDocument();
    });

    expect(screen.getByText('Your password has been updated successfully.')).toBeInTheDocument();
  });

  test('handles API error', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Current password is incorrect' })
    });

    render(
      <MemoryRouter>
        <ChangeEmPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Current Password'), { target: { value: 'wrong123' } });
    fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: 'newpass123' } });
    fireEvent.change(screen.getByPlaceholderText('Re-enter New Password'), { target: { value: 'newpass123' } });

    fireEvent.click(screen.getByText('Save'));

    
    await waitFor(() => {
      expect(screen.getByText('Current password is incorrect')).toBeInTheDocument();
    });
  });

  test('handles network error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));
    console.error = jest.fn(); 

    render(
      <MemoryRouter>
        <ChangeEmPassword />
      </MemoryRouter>
    );

    
    fireEvent.change(screen.getByPlaceholderText('Current Password'), { target: { value: 'current123' } });
    fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: 'newpass123' } });
    fireEvent.change(screen.getByPlaceholderText('Re-enter New Password'), { target: { value: 'newpass123' } });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
    });

    
    expect(console.error).toHaveBeenCalled();
  });
});