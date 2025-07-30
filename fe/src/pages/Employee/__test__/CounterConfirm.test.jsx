// src/pages/Employee/__test__/CounterConfirm.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CounterConfirm from '../CounterConfirm';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';


jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));


jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));


jest.mock('antd', () => ({
  message: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));


jest.mock('../../../components/Sidebar-Employee', () => ({ children }) => <div>{children}</div>);

describe('CounterConfirm Component', () => {
  const mockDispatch = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    useDispatch.mockReturnValue(mockDispatch);
    useNavigate.mockReturnValue(mockNavigate);

    useSelector.mockImplementation(() => ({
      movieDetails: {
        name: 'Test Movie',
        image_url: '/test.jpg',
        version: '2D',
        running_time: '120',
        time: '2023-08-01T10:00:00Z',
        cinema_room: 'ROOM01',
        genres: ['Action'],
      },
      selectedSeats: [{ label: 'A1' }, { label: 'A2' }],
      totalSeatPrice: 200000,
      selectedCombos: [
        { name: 'Combo 1', quantity: 2, price: 50000 },
        { name: 'Combo 2', quantity: 1, price: 30000 },
      ],
      totalComboPrice: 130000,
      selectedProducts: [],
      user: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '0123456789',
        username: 'johndoe',
      },
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders movie title and selected seats', () => {
    render(<CounterConfirm />);
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.getByText('Selected Seats')).toBeInTheDocument();
    expect(screen.getByText('A1')).toBeInTheDocument();
    expect(screen.getByText('A2')).toBeInTheDocument();
  });

  it('renders selected combos and total combo price', () => {
  render(<CounterConfirm />);
  expect(screen.getByText('Combo 1')).toBeInTheDocument();
  expect(screen.getByText('Combo 2')).toBeInTheDocument();

  
  const comboPriceElement = screen.getByText((content, element) => {
    return element.tagName.toLowerCase() === 'span' && content.includes('130');
  });
  expect(comboPriceElement).toBeInTheDocument();
});


  it('renders user information', () => {
    render(<CounterConfirm />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('0123456789')).toBeInTheDocument();
  });

  it('calls navigate(-1) when Back button is clicked', () => {
    render(<CounterConfirm />);
    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('renders Proceed to Payment button', () => {
    render(<CounterConfirm />);
    const payButton = screen.getByRole('button', { name: /Proceed to Payment/i });
    expect(payButton).toBeInTheDocument();
    expect(payButton).toBeEnabled();
  });
});
