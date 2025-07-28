import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EditProduct from '../EditProduct';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ id: '123' })
}));

// Mock axios
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

// Mock antd components
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

// Mock SidebarLayout component
jest.mock('../../../components/Sidebar-Employee', () => {
  return function DummySidebar({ children }) {
    return <div data-testid="sidebar-mock">{children}</div>
  }
});

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url');

describe('EditProduct', () => {
  // Simple test to ensure the component doesn't crash
  test('renders without crashing', () => {
    // Suppress console errors during test
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    render(
      <MemoryRouter>
        <EditProduct />
      </MemoryRouter>
    );
    
    // Restore console.error
    console.error = originalConsoleError;
    
    // Check for basic rendering
    expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
  });
});