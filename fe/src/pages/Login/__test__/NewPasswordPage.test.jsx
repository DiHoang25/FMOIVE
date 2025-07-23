import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewPasswordPage from '../NewPasswordPage';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ResetPasswordPage from '../ResetPasswordPage';

// Mock fetch và localStorage
global.fetch = jest.fn();

const renderWithRouter = ({ token = 'fake-token', state = { email: 'user@example.com' } } = {}) => {
  localStorage.setItem('resetToken', token);

  return render(
    <MemoryRouter initialEntries={[{ pathname: '/new-password', state }]}>
      <Routes>
        <Route path="/new-password" element={<NewPasswordPage />} />
        <Route path="/forgot-password" element={<div>Redirected to forgot-password</div>} />
        <Route path="/login" element={<div>Redirected to login</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('NewPasswordPage', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
  });

  test('shows error if password is empty', async () => {
    renderWithRouter();

    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    expect(await screen.findByText(/please enter a new password/i)).toBeInTheDocument();
  });

  test('shows error if password too short', async () => {
    renderWithRouter(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    expect(await screen.findByText('Password must be at least 5 characters long')).toBeInTheDocument();
  });

  test('shows error if passwords do not match', async () => {
    renderWithRouter();

    fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: '12345' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: '12346' } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  test('submits form with valid input and shows success modal', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    renderWithRouter();

    fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    expect(await screen.findByText(/password reset successful/i)).toBeInTheDocument();
    expect(localStorage.getItem('resetToken')).toBe(null);
  });

  test('navigates to login after confirming success modal', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    renderWithRouter();

    fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    const okButton = await screen.findByRole('button', { name: /^ok$/i });
    fireEvent.click(okButton);

    expect(await screen.findByText(/redirected to login/i)).toBeInTheDocument();
  });

  test('handles API error response', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Token expired' }),
    });

    renderWithRouter();

    fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    expect(await screen.findByText(/token expired/i)).toBeInTheDocument();
  });
});
