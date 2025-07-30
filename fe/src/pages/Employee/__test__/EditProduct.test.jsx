import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EditProduct from '../EditProduct';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ id: '123' })
}));

jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ 
    data: { 
      product: {
        productName: 'Test Product',
        description: 'Test description',
        price: 10000,
        category: 'snack',
        stockQuantity: 5,
        image_url: 'test-image.jpg'
      }
    } 
  })),
  put: jest.fn(() => Promise.resolve({ data: { message: 'Success' } }))
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
  Select: ({ value, placeholder, options }) => (
    <select data-testid="select-mock" value={value}>
      {options?.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
  InputNumber: ({ value }) => (
    <input type="number" data-testid="input-number-mock" value={value} />
  )
}));

jest.mock('../../../components/Sidebar-Employee', () => {
  return function DummySidebar({ children }) {
    return <div data-testid="sidebar-mock">{children}</div>
  }
});

global.URL.createObjectURL = jest.fn(() => 'mocked-url');

describe('EditProduct', () => {
  test('renders without crashing', () => {
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    render(
      <MemoryRouter>
        <EditProduct />
      </MemoryRouter>
    );
    
    console.error = originalConsoleError;
    
    expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
  });
});