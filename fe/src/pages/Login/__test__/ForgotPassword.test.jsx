import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ForgotPasswordPage from '../ForgotPasswordPage';

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

global.fetch = jest.fn();

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    fetch.mockReset();
  });

  test('renders form correctly', () => {
    renderWithRouter(<ForgotPasswordPage />);
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your@email.com/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send code/i })).toBeInTheDocument();
  });

//   test('shows validation error for empty email', async () => {
//   renderWithRouter(<ForgotPasswordPage />);
//   fireEvent.click(screen.getByRole('button', { name: /send code/i }));

//   await waitFor(() => {
//     expect(screen.getByText('Please enter your email address')).toBeInTheDocument();
//   });
// });

test('shows validation error for invalid email format', async () => {
  renderWithRouter(<ForgotPasswordPage />);
  fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), {
    target: { value: 'invalidemail' },
  });
  fireEvent.click(screen.getByRole('button', { name: /send code/i }));

  await waitFor(() => {
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
  });
});

  test('submits with valid email and handles success', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Verification code sent' }),
    });

    renderWithRouter(<ForgotPasswordPage />);
    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send code/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/auth/forgot-password',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'user@example.com' }),
        })
      );
    });

    expect(await screen.findByText(/verification code sent/i)).toBeInTheDocument();
  });

  test('shows error if fetch fails', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'User not found' }),
    });

    renderWithRouter(<ForgotPasswordPage />);
    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), {
      target: { value: 'notfound@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send code/i }));

    expect(await screen.findByText(/user not found/i)).toBeInTheDocument();
  });
});
