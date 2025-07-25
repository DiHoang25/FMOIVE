import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';
import { GoogleOAuthProvider } from '@react-oauth/google';


// Mock fetch global
global.fetch = jest.fn();

// Mock AuthContext
const mockLogin = jest.fn();
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

//Mock jwt-decode 
import { jwtDecode } from 'jwt-decode';
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(() => ({
    user: {
      username: 'duyhoang',
    },
  })),
}));

// Mock antd message
jest.mock('antd', () => {
  const original = jest.requireActual('antd');
  return {
    ...original,
    message: {
      success: jest.fn(),
      error: jest.fn(),
    },
  };
});
const mockMessage = require('antd').message;

// Helper render with router
const renderWithRouter = (ui) => {
  return render(
    <GoogleOAuthProvider clientId="test-client-id">
      <BrowserRouter>{ui}</BrowserRouter>
    </GoogleOAuthProvider>
  );
};


// Reset mocks mỗi test
beforeEach(() => {
  fetch.mockReset();
  mockLogin.mockReset();
  mockMessage.success.mockReset();
  mockMessage.error.mockReset();
});

describe('LoginPage', () => {
  test('renders inputs and buttons correctly', () => {
    renderWithRouter(<LoginPage />);
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/register now/i)).toBeInTheDocument();
  });

  test('shows validation errors when fields are empty', async () => {
    renderWithRouter(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(await screen.findByText(/username is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });

  // test('submits form and calls login on success', async () => {
  //   const fakeToken = 'fake.jwt.token';
  //   fetch.mockResolvedValueOnce({
  //     ok: true,
  //     json: async () => ({ token: fakeToken }),
  //   });

  //   renderWithRouter(<LoginPage />);
  //   fireEvent.change(screen.getByPlaceholderText(/username/i), {
  //     target: { value: 'duyhoang' },
  //   });
  //   fireEvent.change(screen.getByPlaceholderText(/password/i), {
  //     target: { value: '123456' },
  //   });
  //   fireEvent.click(screen.getByRole('button', { name: /login/i }));

  //   await waitFor(() => {
  //     expect(fetch).toHaveBeenCalledWith(
  //       'http://localhost:5000/api/auth/login',
  //       expect.objectContaining({
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({ username: 'duyhoang', password: '123456' }),
  //       })
  //     );
  //     expect(jwtDecode).toHaveBeenCalledWith(fakeToken);
  //     expect(mockLogin).toHaveBeenCalledWith(fakeToken);
  //     expect(mockMessage.success).toHaveBeenCalled();
  //   });
  // });

  // test('displays error message from API on login fail', async () => {
  //   fetch.mockResolvedValueOnce({
  //     ok: false,
  //     json: async () => ({ message: 'Invalid credentials' }),
  //   });

  //   renderWithRouter(<LoginPage />);
  //   fireEvent.change(screen.getByPlaceholderText(/username/i), {
  //     target: { value: 'wrong' },
  //   });
  //   fireEvent.change(screen.getByPlaceholderText(/password/i), {
  //     target: { value: 'wrongpass' },
  //   });
  //   fireEvent.click(screen.getByRole('button', { name: /login/i }));

  //   expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  //   expect(mockMessage.error).toHaveBeenCalledWith('Invalid credentials');
  // });

  test('toggles password visibility', () => {
    renderWithRouter(<LoginPage />);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const toggleButton = screen.getByText(/show/i);

    expect(passwordInput).toHaveAttribute('type', 'password');
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
