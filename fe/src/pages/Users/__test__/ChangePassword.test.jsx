import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChangePassword from '../ChangePassword'; // Adjust path as needed

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the UserDashboardLayout component to simplify testing
jest.mock('../../../components/UserDashboardlayout', () => ({ children }) => (
  <div data-testid="user-dashboard-layout">{children}</div>
));

describe('ChangePassword Component', () => {
  // Clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // More robust way to mock localStorage for testing
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key) => {
          if (key === 'token') {
            return 'fake-token';
          }
          return null;
        }),
        setItem: jest.fn(),
        clear: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true, // Make it writable so we can redefine it
    });
  });

  // Test Case 1: Renders the component correctly
  test('1. Renders the Change Password form', () => {
    render(<ChangePassword />);
    expect(screen.getByRole('heading', { name: /change password/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Current Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('New Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Re-enter New Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  // Test Case 2: Allows input fields to be changed
  test('2. Allows users to type into input fields', () => {
    render(<ChangePassword />);
    const currentPasswordInput = screen.getByPlaceholderText('Current Password');
    const newPasswordInput = screen.getByPlaceholderText('New Password');
    const confirmNewPasswordInput = screen.getByPlaceholderText('Re-enter New Password');

    fireEvent.change(currentPasswordInput, { target: { value: 'oldpass123' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newpass456' } });
    fireEvent.change(confirmNewPasswordInput, { target: { value: 'newpass456' } });

    expect(currentPasswordInput).toHaveValue('oldpass123');
    expect(newPasswordInput).toHaveValue('newpass456');
    expect(confirmNewPasswordInput).toHaveValue('newpass456');
  });

  // Test Case 3: Displays validation error for empty current password
  test('3. Shows error if current password is empty on save attempt', async () => {
    render(<ChangePassword />);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/please enter your current password./i)).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled(); // Should not navigate on validation error
  });

  // Test Case 4: Displays validation error for empty new password
  test('4. Shows error if new password is empty on save attempt', async () => {
    render(<ChangePassword />);
    fireEvent.change(screen.getByPlaceholderText('Current Password'), { target: { value: 'oldpass123' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/please enter your new password./i)).toBeInTheDocument();
    });
  });

  // Test Case 5: Displays validation error for new password less than 6 characters
  test('5. Shows error if new password is less than 6 characters', async () => {
    render(<ChangePassword />);
    fireEvent.change(screen.getByPlaceholderText('Current Password'), { target: { value: 'oldpass123' } });
    fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: 'short' } });
    fireEvent.change(screen.getByPlaceholderText('Re-enter New Password'), { target: { value: 'short' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters./i)).toBeInTheDocument();
    });
  });

  // Test Case 6: Displays validation error for mismatched new passwords
  test('6. Shows error if new password and confirm new password do not match', async () => {
    render(<ChangePassword />);
    fireEvent.change(screen.getByPlaceholderText('Current Password'), { target: { value: 'oldpass123' } });
    fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: 'newpass123' } });
    fireEvent.change(screen.getByPlaceholderText('Re-enter New Password'), { target: { value: 'newpassabc' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match./i)).toBeInTheDocument();
    });
  });

  // Test Case 7: Handles successful password change API call
  test('7. Displays success message and navigates on successful password change', async () => {
    // Mock a successful fetch response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Password changed successfully' }),
      })
    );

    render(<ChangePassword />);

    fireEvent.change(screen.getByPlaceholderText('Current Password'), { target: { value: 'oldpass123' } });
    fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: 'newpass123' } });
    fireEvent.change(screen.getByPlaceholderText('Re-enter New Password'), { target: { value: 'newpass123' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    // Wait for the success modal to appear
    await waitFor(() => {
      expect(screen.getByText(/password changed!/i)).toBeInTheDocument();
    });

    // Check if inputs are cleared
    expect(screen.getByPlaceholderText('Current Password')).toHaveValue('');
    expect(screen.getByPlaceholderText('New Password')).toHaveValue('');
    expect(screen.getByPlaceholderText('Re-enter New Password')).toHaveValue('');

    // Click OK on the success modal
    fireEvent.click(screen.getByRole('button', { name: /ok/i }));

    // Wait for navigation after clicking OK
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/viewaccount');
    });
  });

  // Test Case 8: Handles failed password change due to server error
  test('8. Displays server error message on failed password change', async () => {
    // Mock a failed fetch response (e.g., 400 Bad Request)
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Incorrect current password.' }),
      })
    );

    render(<ChangePassword />);

    fireEvent.change(screen.getByPlaceholderText('Current Password'), { target: { value: 'wrongpass' } });
    fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: 'newpass123' } });
    fireEvent.change(screen.getByPlaceholderText('Re-enter New Password'), { target: { value: 'newpass123' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    // Wait for the server error message to appear
    await waitFor(() => {
      expect(screen.getByText(/incorrect current password./i)).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // Test Case 9: Handles network error during password change
  test('9. Displays generic error message on network error', async () => {
    // Mock a network error
    global.fetch = jest.fn(() => Promise.reject(new Error('Network down')));

    render(<ChangePassword />);

    fireEvent.change(screen.getByPlaceholderText('Current Password'), { target: { value: 'oldpass123' } });
    fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: 'newpass123' } });
    fireEvent.change(screen.getByPlaceholderText('Re-enter New Password'), { target: { value: 'newpass123' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    // Wait for the generic error message to appear
    await waitFor(() => {
      expect(screen.getByText(/something went wrong. please try again./i)).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // Test Case 10: Clicking Cancel button navigates to /viewaccount
  test('10. Clicking Cancel button navigates to /viewaccount', () => {
    render(<ChangePassword />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/viewaccount');
  });
});
