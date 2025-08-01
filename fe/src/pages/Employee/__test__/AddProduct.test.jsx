import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AddProduct from '../AddProduct';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

jest.mock('axios', () => ({
  post: jest.fn(() => Promise.resolve({ data: { message: 'Success' } }))
}));

jest.mock('antd', () => ({
  message: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(() => jest.fn())
  },
  Form: {
    useForm: () => [{ resetFields: jest.fn() }],
    Item: ({ children }) => <div>{children}</div>
  },
  Select: ({ placeholder, options }) => (
    <select data-testid="select-mock">
      <option>{placeholder}</option>
      {options?.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
  InputNumber: () => (
    <input type="number" data-testid="input-number-mock" />
  )
}));

jest.mock('../../../components/Sidebar-Employee', () => {
  return function DummySidebar({ children }) {
    return <div data-testid="sidebar-mock">{children}</div>
  }
});

global.URL.createObjectURL = jest.fn(() => 'mocked-url');

describe('AddProduct', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'fake-token'),
        setItem: jest.fn()
      }
    });
  });

  test('renders without crashing', () => {
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    render(
      <MemoryRouter>
        <AddProduct />
      </MemoryRouter>
    );
    
    console.error = originalConsoleError;
    
    expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
    expect(screen.getByText('Add New Product')).toBeInTheDocument();
  });
});