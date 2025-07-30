import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CounterPaymentStatusPage from '../CounterPaymentStatus';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(() => jest.fn()),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: jest.fn(),
}));

describe('CounterPaymentStatusPage', () => {
  const renderWithQuery = (query) => {
    useLocation.mockReturnValue({ search: query });

    render(
      <MemoryRouter>
        <CounterPaymentStatusPage />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /*test('displays success message when payment is successful', async () => {
  renderWithQuery('?vnp_TxnRef=ABC123&vnp_ResponseCode=00&vnp_TransactionStatus=00');

  
  expect(await screen.findByRole('heading', { name: /Payment Successful!/i })).toBeInTheDocument();


  expect(screen.getByText(/Transaction Reference: ABC123/i)).toBeInTheDocument();
});*/

  test('displays cancel message when payment is cancelled', async () => {
    renderWithQuery('?vnp_TxnRef=XYZ456&vnp_ResponseCode=24&vnp_TransactionStatus=00');

    expect(await screen.findByRole('heading', { name: /Payment Cancelled/i })).toBeInTheDocument();
  });

  test('displays invalid signature message', async () => {
    renderWithQuery('?vnp_TxnRef=XYZ456&vnp_ResponseCode=97&vnp_TransactionStatus=00');

    const headings = await screen.findAllByText(/Invalid Signature/i);
    expect(headings[0]).toBeInTheDocument();
  });

  test('displays system error message', async () => {
    renderWithQuery('?vnp_TxnRef=XYZ456&vnp_ResponseCode=99&vnp_TransactionStatus=00');

    const headings = await screen.findAllByText(/System Error/i);
    expect(headings[0]).toBeInTheDocument();
  });

  test('displays generic failure message', async () => {
    renderWithQuery('?vnp_TxnRef=XYZ456&vnp_ResponseCode=05&vnp_TransactionStatus=01');

    const headings = await screen.findAllByText(/Payment Failed/i);
    expect(headings[0]).toBeInTheDocument();
  });

  test('displays missing data message', async () => {
    renderWithQuery('?invalidParams=123');

    expect(await screen.findByText(/No Payment Data Found/i)).toBeInTheDocument();
  });
});
