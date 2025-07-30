import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EmployeeProfile from '../EmployeeProfile';

global.fetch = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.mock('../../../components/Sidebar-Employee', () => ({ children }) => <div data-testid="sidebar-layout">{children}</div>);

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
    localStorage.clear();
    
    global.fetch.mockReset();
    
   
    localStorage.setItem('token', 'fake-token');

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test('renders loading state initially', () => {
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
    localStorage.removeItem('token');

    render(
      <MemoryRouter>
        <EmployeeProfile />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('mock-result')).toBeInTheDocument();
    });

    expect(screen.getByText('Not authenticated.')).toBeInTheDocument();
  });

  test('displays error message when fetch fails', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    render(
      <MemoryRouter>
        <EmployeeProfile />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('mock-result')).toBeInTheDocument();
    });

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch user data.')).toBeInTheDocument();
  });
});