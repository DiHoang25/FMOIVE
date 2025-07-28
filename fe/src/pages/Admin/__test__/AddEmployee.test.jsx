// AddEmployeePage.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AddEmployeePage from '../AddEmployee';

// Mock SidebarAdmin
jest.mock('../../../components/Sidebar-Admin', () => ({ children }) => (
  <div data-testid="mock-sidebar">{children}</div>
));

// Mock Ant Design's message and modal
jest.mock('antd', () => {
  const antd = jest.requireActual('antd');
  return {
    ...antd,
    message: {
      success: jest.fn(),
      error: jest.fn(),
    },
    Modal: {
      confirm: jest.fn((options) => {
        // Simulate immediate confirmation without showing modal
        options.onOk();
      }),
    },
  };
});

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn(() => Promise.resolve({ data: { message: 'Employee added successfully!' } })),
}));

const renderPage = () =>
  render(
    <BrowserRouter>
      <AddEmployeePage />
    </BrowserRouter>
  );

describe('AddEmployeePage', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }),
    });

    localStorage.setItem('token', 'mock-token');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows validation errors when submitting empty form', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /Add Employee/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/required/i).length).toBeGreaterThan(0);
    });
  });

  it('submits valid form and shows success message', async () => {
    renderPage();

    fireEvent.change(screen.getByLabelText(/Account/i), { target: { value: 'john123' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'password' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'password' } });
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), { target: { value: '1990-01-01' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '0123456789' } });
    fireEvent.change(screen.getByLabelText(/Address/i), { target: { value: '123 Street' } });
    fireEvent.change(screen.getByLabelText(/ID Card/i), { target: { value: '123456789' } });

    fireEvent.click(screen.getByRole('button', { name: /Add Employee/i }));

    await waitFor(() => {
      expect(screen.getByText(/Adding Employee/i)).toBeInTheDocument();
    });
  });

  it('renders sidebar layout', () => {
    renderPage();
    expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();
  });
});