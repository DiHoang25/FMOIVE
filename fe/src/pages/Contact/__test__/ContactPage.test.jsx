import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactPage from '../ContactPage';
import { sendContactEmail } from '../../../utils/emailService';

// Mock emailService
jest.mock('../../../utils/emailService', () => ({
  initEmailJS: jest.fn(),
  sendContactEmail: jest.fn(),
}));

describe('ContactPage Component', () => {
  beforeEach(() => {
    render(<ContactPage />);
  });

  it('renders contact form and heading', () => {
    expect(screen.getByText(/Contact Us/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));

    expect(await screen.findByText(/Name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Subject is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Message is required/i)).toBeInTheDocument();
  });

  it('shows email format error', async () => {
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'invalid-email' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));

    expect(await screen.findByText(/Email is invalid/i)).toBeInTheDocument();
  });

  it('submits form successfully with valid data', async () => {
    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: 'Hoàng' },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'hoang@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Subject/i), {
      target: { value: 'Test Subject' },
    });
    fireEvent.change(screen.getByLabelText(/Message/i), {
      target: { value: 'This is a valid message with more than 10 characters.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));

    await waitFor(() => {
      expect(sendContactEmail).toHaveBeenCalled();
    });
  });
});
