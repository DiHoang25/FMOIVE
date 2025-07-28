// __tests__/ViewEmployees.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ViewEmployees from '../ViewEmployee';
import { BrowserRouter } from 'react-router-dom';

jest.mock('../../../components/Sidebar-Admin', () => ({ children }) => (
  <div data-testid="mock-sidebar">{children}</div>
));

jest.mock('axios', () => ({
  get: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

describe('ViewEmployees Page', () => {
  const axios = require('axios');

  const mockEmployees = [
    {
      userId: '1',
      username: 'john',
      fullname: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      role: 'employee',
      is_actived: true,
      address: '123 Street',
    },
  ];

  const renderPage = async () => {
    localStorage.setItem('token', 'test-token');
    axios.get.mockResolvedValueOnce({ data: { Employee: mockEmployees } });
    render(
      <BrowserRouter>
        <ViewEmployees />
      </BrowserRouter>
    );
  };

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });
  

  it('fetches and displays employee data', async () => {
    await renderPage();
    expect(await screen.findByText('John Doe')).toBeInTheDocument();
  });

  it('shows no employees found if none match search', async () => {
    await renderPage();
    fireEvent.change(screen.getByPlaceholderText(/search employee/i), {
      target: { value: 'nonexistent' },
    });
    expect(await screen.findByText(/no employees found/i)).toBeInTheDocument();
  });

  it('filters employees by search term', async () => {
    await renderPage(); // ensure data loaded
    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: 'John' },
    });
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
  

  it('renders loading indicator when loading is true', async () => {
    axios.get.mockImplementation(() => new Promise(() => {}));
    localStorage.setItem('token', 'test-token');
    render(
      <BrowserRouter>
        <ViewEmployees />
      </BrowserRouter>
    );
    expect(await screen.findByText(/loading employees/i)).toBeInTheDocument();
  });

  it('navigates to add employee page', async () => {
    await renderPage();
    const button = screen.getByText('+ Add New Employee');
    expect(button).toBeInTheDocument();
  });
});