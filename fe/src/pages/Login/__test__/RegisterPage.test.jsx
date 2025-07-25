import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterPage from '../RegisterPage';
import { BrowserRouter } from 'react-router-dom';

// Helper to wrap component with router
const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

// Mock fetch globally
global.fetch = jest.fn();

describe('RegisterPage', () => {
    beforeEach(() => {
        fetch.mockReset();
    });

    test('renders all form inputs', () => {
        renderWithRouter(<RegisterPage />);
        expect(screen.getByLabelText(/Account/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Date of Birth/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/I agree with/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
    });

    test('shows validation errors when required fields are empty', async () => {
        renderWithRouter(<RegisterPage />);
        fireEvent.click(screen.getByRole('button', { name: /Register/i }));

        await waitFor(() => {
            expect(screen.getByText(/Account is required/i)).toBeInTheDocument();
            expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
            expect(screen.getByText(/Please confirm your password/i)).toBeInTheDocument();
            expect(screen.getByText(/Full name is required/i)).toBeInTheDocument();
            expect(screen.getByText(/Date of birth is required/i)).toBeInTheDocument();
            expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
            expect(screen.getByText(/Phone number is required/i)).toBeInTheDocument();
            expect(screen.getByText(/You must agree to terms/i)).toBeInTheDocument();
        });
    });

    test('submits valid form and shows success modal', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'Registered successfully' }),
        });

        renderWithRouter(<RegisterPage />);

        fireEvent.change(screen.getByLabelText(/Account/i), { target: { value: 'duyhoang' } });
        fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: '123456' } });
        fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: '123456' } });
        fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Duy Hoàng' } });
        fireEvent.change(screen.getByLabelText(/Date of Birth/i), { target: { value: '2000-01-01' } });
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'duy@example.com' } });
        fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '0987654321' } });
        fireEvent.click(screen.getByLabelText(/I agree with/i));

        fireEvent.click(screen.getByRole('button', { name: /Register/i }));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:5000/api/auth/register',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: expect.stringContaining('duyhoang'),
                })
            );
        });

        expect(await screen.findByText(/Registration Successful/i)).toBeInTheDocument();
    });
});