import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResetPasswordPage from '../ResetPasswordPage';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Giả lập fetch API
global.fetch = jest.fn();

const renderWithRouter = (ui, { route = '/reset-password', state = {} } = {}) => {
  window.history.pushState({ state }, 'Test page', route);
  return render(
    <MemoryRouter initialEntries={[{ pathname: route, state }]}>
      <Routes>
        <Route path="/reset-password" element={ui} />
        <Route path="/forgot-password" element={<div>Redirected to forgot-password</div>} />
        <Route path="/new-password" element={<div>Redirected to new-password</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders with email from location.state', () => {
    renderWithRouter(<ResetPasswordPage />, {
      state: { email: 'test@example.com' },
    });
    expect(screen.getByText(/A 5-digit code has been sent to/i)).toHaveTextContent('test@example.com');
  });

  test('shows error if verification code is incomplete', async () => {
    renderWithRouter(<ResetPasswordPage />, {
      state: { email: 'test@example.com' },
    });

    const verifyButton = screen.getByRole('button', { name: /verify code/i });
    fireEvent.click(verifyButton);

    expect(await screen.findByText(/please enter the complete 5-digit verification code/i)).toBeInTheDocument();
  });

  test('prevents non-numeric input', () => {
    renderWithRouter(<ResetPasswordPage />, {
      state: { email: 'test@example.com' },
    });

    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'a' } });

    // Should still be empty
    expect(inputs[0].value).toBe('');
  });

  test('submits valid code and navigates to /new-password', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ resetToken: 'fake-reset-token' }),
    });

    renderWithRouter(<ResetPasswordPage />, {
      state: { email: 'test@example.com' },
    });

    const inputs = screen.getAllByRole('textbox');
    ['1', '2', '3', '4', '5'].forEach((val, idx) => {
      fireEvent.change(inputs[idx], { target: { value: val } });
    });

    fireEvent.click(screen.getByRole('button', { name: /verify code/i }));

    await waitFor(() => {
      expect(screen.getByText(/redirected to new-password/i)).toBeInTheDocument();
    });

    expect(localStorage.getItem('resetToken')).toBe('fake-reset-token');
  });

  test('redirects to forgot-password if no email', async () => {
    renderWithRouter(<ResetPasswordPage />, {
      state: {}, // no email
    });

    await waitFor(() => {
      expect(screen.getByText(/redirected to forgot-password/i)).toBeInTheDocument();
    });
  });
});
