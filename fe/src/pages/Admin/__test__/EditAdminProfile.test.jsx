// Mock matchMedia for Ant Design components (e.g., DatePicker)
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
      dispatchEvent: jest.fn(),
    }),
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import EditAdminProfile from '../EditAdminProfile';
import { BrowserRouter } from 'react-router-dom';
import fetchMock from 'jest-fetch-mock'; // Import jest-fetch-mock

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../components/Sidebar-Admin', () => ({ children }) => (
  <div data-testid="mock-sidebar">{children}</div>
));

beforeEach(() => {
  fetchMock.enableMocks(); // Ensure fetchMock is enabled for this test file
  fetchMock.resetMocks(); // Reset any previous mocks before each test
  jest.clearAllMocks();
  localStorage.setItem('token', 'mock-token');

  // Use fetchMock.mockResponseOnce or fetchMock.mockImplementation for your fetch calls
  fetchMock.mockResponse(req => {
    if (req.url.endsWith('/api/auth/profile')) {
      return Promise.resolve({
        status: 200,
        body: JSON.stringify({
          user: {
            fullname: 'John Doe',
            username: 'adminuser',
            email: 'admin@gmail.com',
            date_of_birth: '1990-01-01T00:00:00.000Z',
            gender: 'male',
            phone: '0123456789',
          },
        }),
      });
    }

    if (req.url.endsWith('/api/auth/update-profile') && req.method === 'PUT') {
      return Promise.resolve({
        status: 200,
        body: JSON.stringify({ success: true, message: 'Profile updated successfully' }),
      });
    }

    // Fallback for unexpected fetch calls
    return Promise.reject(new Error(`Unexpected fetch call: ${req.url}`));
  });
});

afterEach(() => {
  localStorage.clear();
  fetchMock.disableMocks(); // Disable fetchMock after each test to prevent leakage
});

describe('EditAdminProfile Page', () => {
  it('renders and loads initial user data correctly', async () => {
    render(<BrowserRouter><EditAdminProfile /></BrowserRouter>);

    expect(await screen.findByRole('heading', { name: /Edit Admin Profile/i })).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('@adminuser')).toBeInTheDocument();
    expect(screen.getByText('admin@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('01/01/1990')).toBeInTheDocument();
    expect(screen.getByText('0123456789')).toBeInTheDocument();
    expect(screen.getByText('male')).toBeInTheDocument();
  });

  it('allows toggling edit mode for fullname and changing its value', async () => {
    render(<BrowserRouter><EditAdminProfile /></BrowserRouter>);
    await screen.findByText('John Doe');

    const fullNameDisplay = screen.getByText('John Doe');
    const fullNameEditButton = within(fullNameDisplay.closest('div')).getByRole('button', { name: /Edit/i });
    fireEvent.click(fullNameEditButton);

    const fullNameInput = screen.getByDisplayValue('John Doe');
    fireEvent.change(fullNameInput, { target: { value: 'Jane Smith' } });

    expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument();
  });

  it('shows success notification and navigates on successful profile update', async () => {
    render(<BrowserRouter><EditAdminProfile /></BrowserRouter>);
    await screen.findByText('John Doe');

    const phoneDisplay = screen.getByText('0123456789');
    const phoneEditButton = within(phoneDisplay.closest('div')).getByRole('button', { name: /Edit/i });
    fireEvent.click(phoneEditButton);

    const phoneInput = screen.getByDisplayValue('0123456789');
    fireEvent.change(phoneInput, { target: { value: '0999888777' } });

    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    expect(await screen.findByText(/Your account has been updated successfully/i)).toBeInTheDocument();

    const okButton = screen.getByRole('button', { name: /OK/i });
    fireEvent.click(okButton);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/admin-profile');
  });

  it('navigates back on Cancel button click', async () => {
    render(<BrowserRouter><EditAdminProfile /></BrowserRouter>);
    await screen.findByText('John Doe');

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/admin/admin-profile');
  });

  it('displays loading spinner while fetching data', async () => {
    // Mock fetch to return a pending promise that we can control manually
    fetchMock.mockResponseOnce(() => new Promise(resolve => {
      // Don't resolve immediately, keep it pending to show loading
    }));
    localStorage.setItem('token', 'mock-token');

    const { unmount } = render(<BrowserRouter><EditAdminProfile /></BrowserRouter>);
    // Use getByTestId for the Spin component
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    unmount();
    // Resolve the pending fetch promise to prevent "open handles" warnings in Jest
    fetchMock.mockResponseOnce(JSON.stringify({ user: {} })); // Provide a dummy response to resolve the pending fetch
  });

  it('displays error message if initial profile fetch fails', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({ message: 'Failed to load profile data.' }),
      { status: 500 } // Simulate a server error
    );

    render(<BrowserRouter><EditAdminProfile /></BrowserRouter>);
    expect(await screen.findByText(/Failed to load profile data./i)).toBeInTheDocument();
  });

  it('displays error if token is missing', async () => {
    localStorage.removeItem('token');
    fetchMock.dontMock(); // Ensure fetch is not mocked for this specific test where token is missing

    render(<BrowserRouter><EditAdminProfile /></BrowserRouter>);
    expect(await screen.findByText(/Not authenticated. Please log in./i)).toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('displays error for empty Full Name on save', async () => {
    render(<BrowserRouter><EditAdminProfile /></BrowserRouter>);
    await screen.findByText('John Doe');

    const fullNameDisplay = screen.getByText('John Doe');
    fireEvent.click(within(fullNameDisplay.closest('div')).getByRole('button', { name: /Edit/i }));
    const input = screen.getByDisplayValue('John Doe');
    fireEvent.change(input, { target: { value: '' } });

    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));
    expect(await screen.findByText('Full Name is required.')).toBeInTheDocument();
  });

  it('displays error for invalid email format', async () => {
    render(<BrowserRouter><EditAdminProfile /></BrowserRouter>);
    await screen.findByText('John Doe');

    const emailDisplay = screen.getByText('admin@gmail.com');
    fireEvent.click(within(emailDisplay.closest('div')).getByRole('button', { name: /Edit/i }));
    const input = screen.getByDisplayValue('admin@gmail.com');
    fireEvent.change(input, { target: { value: 'invalid-email' } });

    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));
    expect(await screen.findByText('Invalid email format.')).toBeInTheDocument();
  });

  it('displays error for email not ending with @gmail.com', async () => {
    render(<BrowserRouter><EditAdminProfile /></BrowserRouter>);
    await screen.findByText('John Doe');

    const emailDisplay = screen.getByText('admin@gmail.com');
    fireEvent.click(within(emailDisplay.closest('div')).getByRole('button', { name: /Edit/i }));
    const input = screen.getByDisplayValue('admin@gmail.com');
    fireEvent.change(input, { target: { value: 'admin@yahoo.com' } });

    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));
    expect(await screen.findByText('Email must end with @gmail.com')).toBeInTheDocument();
  });

  it('displays error for empty phone number', async () => {
    render(<BrowserRouter><EditAdminProfile /></BrowserRouter>);
    await screen.findByText('John Doe');

    const phoneDisplay = screen.getByText('0123456789');
    fireEvent.click(within(phoneDisplay.closest('div')).getByRole('button', { name: /Edit/i }));
    const input = screen.getByDisplayValue('0123456789');
    fireEvent.change(input, { target: { value: '' } });

    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));
    expect(await screen.findByText('Phone number is required.')).toBeInTheDocument();
  });

  it('displays error for short phone number', async () => {
    render(<BrowserRouter><EditAdminProfile /></BrowserRouter>);
    await screen.findByText('John Doe');

    const phoneDisplay = screen.getByText('0123456789');
    fireEvent.click(within(phoneDisplay.closest('div')).getByRole('button', { name: /Edit/i }));
    const input = screen.getByDisplayValue('0123456789');
    fireEvent.change(input, { target: { value: '123' } });

    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));
    expect(await screen.findByText('Phone number must be 10-15 digits.')).toBeInTheDocument();
  });

  it('allows changing Date of Birth', async () => {
    render(<BrowserRouter><EditAdminProfile /></BrowserRouter>);
    await screen.findByText('John Doe');

    const dobDisplay = screen.getByText('01/01/1990');
    fireEvent.click(within(dobDisplay.closest('div')).getByRole('button', { name: /Edit/i }));

    const input = await screen.findByDisplayValue('1990-01-01');
    fireEvent.change(input, { target: { value: '1992-05-15' } });

    expect(input.value).toBe('1992-05-15');
  });

  it('allows changing Gender', async () => {
    render(<BrowserRouter><EditAdminProfile /></BrowserRouter>);
    await screen.findByText('John Doe');

    const genderDisplay = screen.getByText('male');
    fireEvent.click(within(genderDisplay.closest('div')).getByRole('button', { name: /Edit/i }));

    const select = await screen.findByRole('combobox');
    fireEvent.change(select, { target: { value: 'female' } });
    expect(select.value).toBe('female');

    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    const updatedGender = await screen.findByText(/female/i);
    expect(updatedGender).toBeInTheDocument();
  });

  it('displays error from API on update failure', async () => {
    // Mock initial profile fetch
    fetchMock.mockResponseOnce(
      JSON.stringify({
        user: {
          fullname: 'John Doe',
          username: 'adminuser',
          email: 'admin@gmail.com',
          phone: '0123456789',
          date_of_birth: '1990-01-01T00:00:00.000Z',
          gender: 'male',
        },
      })
    );
    // Mock update profile failure
    fetchMock.mockResponseOnce(
      JSON.stringify({ message: 'Server error during update' }),
      { status: 500 }
    );

    render(<BrowserRouter><EditAdminProfile /></BrowserRouter>);
    await screen.findByText('John Doe');

    const fullNameDisplay = screen.getByText('John Doe');
    fireEvent.click(within(fullNameDisplay.closest('div')).getByRole('button', { name: /Edit/i }));
    const input = screen.getByDisplayValue('John Doe');
    fireEvent.change(input, { target: { value: 'New Name' } });

    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    expect(await screen.findByText('Server error during update')).toBeInTheDocument();
    expect(screen.queryByText(/Your account has been updated successfully/i)).not.toBeInTheDocument();
  });
});
