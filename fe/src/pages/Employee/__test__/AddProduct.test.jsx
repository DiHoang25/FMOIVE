import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AddProduct from '../AddProduct';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn(() => Promise.resolve({ data: { message: 'Success' } }))
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

// Mock SidebarLayout component
jest.mock('../../../components/Sidebar-Employee', () => {
  return function DummySidebar({ children }) {
    return <div data-testid="sidebar-mock">{children}</div>
  }
});

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url');

describe('AddProduct', () => {
  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'fake-token'),
        setItem: jest.fn()
      }
    });
  });

  // Simple test to ensure the component doesn't crash
  test('renders without crashing', () => {
    // Suppress console errors during test
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    render(
      <MemoryRouter>
        <AddProduct />
      </MemoryRouter>
    );
    
    // Restore console.error
    console.error = originalConsoleError;
    
    // Check for basic rendering
    expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
    expect(screen.getByText('Add New Product')).toBeInTheDocument();
  });
});