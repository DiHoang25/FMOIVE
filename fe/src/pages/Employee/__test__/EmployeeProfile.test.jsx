import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EmployeeProfile from '../EmployeeProfile';

// Mock fetch API
global.fetch = jest.fn();

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock the employee sidebar
jest.mock('../../../components/Sidebar-Employee', () => ({ children }) => <div data-testid="sidebar-layout">{children}</div>);

// Simply mock antd components without trying to replicate their behavior
jest.mock('antd', () => ({
  Avatar: () => <div data-testid="mock-avatar">Avatar</div>,
  Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
  Card: () => <div data-testid="mock-card">Card</div>,
  Descriptions: () => <div data-testid="mock-descriptions">Descriptions</div>,
  Spin: () => <div data-testid="mock-spinner">Loading...</div>,
  Result: ({ title, subTitle }) => (
    <div data-testid="mock-result">
      <div>{title}</div>
      <div>{subTitle}</div>
    </div>
  ),
}));

// Mock the antd icons
jest.mock('@ant-design/icons', () => ({
  UserOutlined: () => <span data-testid="user-icon">UserIcon</span>,
}));

describe('EmployeeProfile', () => {
  const mockUser = {
    fullname: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    date_of_birth: '1990-01-01T00:00:00.000Z',
    phone: '1234567890'
  };

  beforeEach(() => {
    // Clear localStorage mock
    localStorage.clear();
    
    // Reset fetch mock
    global.fetch.mockReset();
    
    // Setup localStorage with a token
    localStorage.setItem('token', 'fake-token');

    // Mock console.error to prevent it from cluttering test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error
    console.error.mockRestore();
  });

  test('renders loading state initially', () => {
    // Setup fetch to delay resolution
    global.fetch.mockImplementation(() => new Promise(resolve => setTimeout(() => {
      resolve({
        ok: true,
        json: () => Promise.resolve({ user: {} })
      });
    }, 100)));

    render(
      <MemoryRouter>
        <EmployeeProfile />
      </MemoryRouter>
    );

    expect(screen.getByTestId('mock-spinner')).toBeInTheDocument();
  });

  test('displays error when user is not authenticated', async () => {
    // Remove token to simulate unauthenticated state
    localStorage.removeItem('token');

    render(
      <MemoryRouter>
        <EmployeeProfile />
      </MemoryRouter>
    );

    // Wait for the error to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('mock-result')).toBeInTheDocument();
    });

    expect(screen.getByText('Not authenticated.')).toBeInTheDocument();
  });

  test('displays error message when fetch fails', async () => {
    // Mock a failed fetch
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    render(
      <MemoryRouter>
        <EmployeeProfile />
      </MemoryRouter>
    );

    // Wait for the error to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('mock-result')).toBeInTheDocument();
    });

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch user data.')).toBeInTheDocument();
  });
});