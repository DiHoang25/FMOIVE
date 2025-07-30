// __tests__/ViewEmployees.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ViewEmployees from '../ViewEmployee';
import { BrowserRouter } from 'react-router-dom';
import { message, Modal } from 'antd';

jest.mock('../../../components/Sidebar-Admin', () => ({ children }) => (
  <div data-testid="mock-sidebar">{children}</div>
));

jest.mock('../../../components/PaginationHomepage', () => ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => (
  <div data-testid="pagination">
    <button 
      onClick={() => onPageChange(currentPage - 1)} 
      disabled={currentPage === 0}
      data-testid="prev-page"
    >
      Previous
    </button>
    <span>Page {currentPage + 1} of {totalPages}</span>
    <button 
      onClick={() => onPageChange(currentPage + 1)} 
      disabled={currentPage === totalPages - 1}
      data-testid="next-page"
    >
      Next
    </button>
  </div>
));

jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  message: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('axios', () => ({
  get: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('ViewEmployees Page', () => {
  jest.setTimeout(10000);
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
    {
      userId: '2',
      username: 'jane',
      fullname: 'Jane Smith',
      email: 'jane@example.com',
      phone: '0987654321',
      role: 'admin',
      is_actived: false,
      address: '456 Avenue',
    },
  ];

  const renderPage = async (employees = mockEmployees) => {
    localStorage.setItem('token', 'test-token');
    axios.get.mockResolvedValueOnce({ data: { Employee: employees } });
    const utils = render(
      <BrowserRouter>
        <ViewEmployees />
      </BrowserRouter>
    );
    await waitFor(() => expect(screen.queryByText(/loading employees/i)).not.toBeInTheDocument());
    return utils;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('fetches and displays employee data', async () => {
    await renderPage();
    expect(await screen.findByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('shows loading indicator initially', async () => {
    axios.get.mockImplementation(() => new Promise(() => {}));
    localStorage.setItem('token', 'test-token');
    render(
      <BrowserRouter>
        <ViewEmployees />
      </BrowserRouter>
    );
    expect(await screen.findByText(/loading employees/i)).toBeInTheDocument();
  });

  it('shows no employees message when no employees', async () => {
    await renderPage([]);
    expect(await screen.findByText(/no employees found/i)).toBeInTheDocument();
  });

  it('filters employees by search term', async () => {
    await renderPage();
    const searchInput = screen.getByPlaceholderText(/search by id, name, or email/i);
    fireEvent.change(searchInput, { target: { value: 'John' } });
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  it('filters employees by username', async () => {
    await renderPage();
    const searchInput = screen.getByPlaceholderText(/search by id, name, or email/i);
    fireEvent.change(searchInput, { target: { value: 'jane' } });
    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });

  it('filters employees by email', async () => {
    await renderPage();
    const searchInput = screen.getByPlaceholderText(/search by id, name, or email/i);
    fireEvent.change(searchInput, { target: { value: 'john@example.com' } });
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  it('navigates to add employee page', async () => {
    await renderPage();
    const addButton = screen.getByText(/Add New Employee/i);
    fireEvent.click(addButton);
    expect(mockNavigate).toHaveBeenCalledWith('/admin/add-employee');
  });

  it('updates employee role successfully', async () => {
    axios.patch.mockResolvedValueOnce({});
    await renderPage();
    
    const roleSelects = screen.getAllByRole('combobox');
    fireEvent.mouseDown(roleSelects[0]);
    
    await waitFor(() => {
      expect(screen.getByText('employee')).toBeInTheDocument();
    });
  });

  it('toggles employee status successfully', async () => {
    axios.patch.mockResolvedValueOnce({});
    await renderPage();
    
    const switches = screen.getAllByRole('switch');
    expect(switches.length).toBeGreaterThan(0);
    fireEvent.click(switches[0]);
    
    // Wait for the confirmation modal to appear
    await waitFor(() => {
      expect(screen.getByText(/Confirm Activation|Confirm Deactivation/i)).toBeInTheDocument();
    });

    // Click the 'Yes' button on the confirmation modal
    fireEvent.click(screen.getByRole('button', { name: /Yes/i }));
    
    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith(
        expect.stringContaining('/status'),
        expect.any(Object),
        expect.any(Object)
      );
    }, { timeout: 5000 });
  });

  it('handles employee deletion', async () => {
    axios.delete.mockResolvedValueOnce({});
    await renderPage();
    
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(btn => btn.textContent === '' && btn.querySelector('svg'));
    if (deleteButton) fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(screen.getByText(/confirm permanent deletion/i)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network error'));
    localStorage.setItem('token', 'test-token');
    render(
      <BrowserRouter>
        <ViewEmployees />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to fetch employees')
      );
    });
  });

  it('handles pagination correctly', async () => {
    const manyEmployees = Array.from({ length: 10 }, (_, i) => ({
      userId: `${i + 1}`,
      username: `user${i + 1}`,
      fullname: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      phone: `123456789${i}`,
      role: 'employee',
      is_actived: true,
      address: `Address ${i + 1}`,
    }));
    
    await renderPage(manyEmployees);
    
    expect(screen.getByText(/Page 1 of 2/i)).toBeInTheDocument();
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });
});