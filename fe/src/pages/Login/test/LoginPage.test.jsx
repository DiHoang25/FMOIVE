// __tests__/LoginPage.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';
import fetchMock from 'jest-fetch-mock';

// Mock AuthContext
const mockLogin = jest.fn();
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

// Mock jwt-decode
jest.mock('jwt-decode', () => () => ({
  user: { username: 'testuser', role: 'user' },
}));

// Mock Ant Design message
const mockMessage = { success: jest.fn(), error: jest.fn() };
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  message: mockMessage,
}));

// Wrapper for rendering with Router
const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

// Reset mocks before each test
beforeEach(() => {
  fetchMock.resetMocks();
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

  test('submits form and redirects on success', async () => {
    const fakeToken = 'fake.jwt.token';
    fetchMock.mockResponseOnce(JSON.stringify({ token: fakeToken }), { status: 200 });

    renderWithRouter(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { name: 'username', value: 'duyhoang' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { name: 'password', value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('http://localhost:5000/api/auth/login', expect.anything());
      expect(mockLogin).toHaveBeenCalledWith(fakeToken);
      expect(mockMessage.success).toHaveBeenCalled();
    });
  });

  test('displays error message from API on login fail', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ message: 'Invalid credentials' }), { status: 401 });

    renderWithRouter(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { name: 'username', value: 'wrong' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { name: 'password', value: 'wrongpass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
    expect(mockMessage.error).toHaveBeenCalled();
  });

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
