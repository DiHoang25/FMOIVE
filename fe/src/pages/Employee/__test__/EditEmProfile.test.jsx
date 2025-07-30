import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EditEmProfile from '../EditEmProfile';

global.fetch = jest.fn();

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../components/Sidebar-Employee', () => ({ children }) => <div data-testid="sidebar-layout">{children}</div>);

jest.mock('react-icons/fa', () => ({
  FaEdit: () => <span data-testid="edit-icon">Edit</span>,
}));

describe('EditEmProfile', () => {
  const mockUser = {
    fullname: 'John Doe',
    username: 'johndoe',
    email: 'john@gmail.com',
    date_of_birth: '1990-01-01T00:00:00.000Z',
    gender: 'male',
    phone: '1234567890'
  };

  beforeEach(() => {
    
    localStorage.clear();
    
    
    global.fetch.mockReset();
    mockNavigate.mockReset();
    
    
    localStorage.setItem('token', 'fake-token');

    
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ user: mockUser })
      })
    );

    
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    
    console.error.mockRestore();
  });

  test('renders edit profile form with user data', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <EditEmProfile />
        </MemoryRouter>
      );
    });

    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    
    expect(screen.getByText('johndoe')).toBeInTheDocument();
    expect(screen.getByText('john@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('1234567890')).toBeInTheDocument();
    expect(screen.getByText('male')).toBeInTheDocument();

    
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/auth/profile',
      { headers: { Authorization: 'Bearer fake-token' } }
    );
  });

  test('allows editing fullname field', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <EditEmProfile />
        </MemoryRouter>
      );
    });

    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    
    const editButtons = screen.getAllByTestId('edit-icon');
    await act(async () => {
      fireEvent.click(editButtons[0]); 
    });

    
    const fullnameInput = screen.getByDisplayValue('John Doe');
    expect(fullnameInput).toBeInTheDocument();

    
    await act(async () => {
      fireEvent.change(fullnameInput, { target: { value: 'Jane Doe' } });
    });
    expect(fullnameInput.value).toBe('Jane Doe');
  });

  test('shows validation error for invalid email', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <EditEmProfile />
        </MemoryRouter>
      );
    });

    
    await waitFor(() => {
      expect(screen.getByText('john@gmail.com')).toBeInTheDocument();
    });

    
    const editButtons = screen.getAllByTestId('edit-icon');
    await act(async () => {
      fireEvent.click(editButtons[1]); // email edit button
    });

    
    const emailInput = screen.getByDisplayValue('john@gmail.com');
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    });

    
    await act(async () => {
      fireEvent.click(screen.getByText('Save'));
    });

    
    expect(screen.getByText('Email must end with @gmail.com')).toBeInTheDocument();
  });

  test('submits form with updated data', async () => {
    
    global.fetch.mockImplementation((url) => {
      if (url === 'http://localhost:5000/api/auth/profile') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: mockUser })
        });
      } else if (url === 'http://localhost:5000/api/auth/update-profile') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Profile updated successfully' })
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <EditEmProfile />
        </MemoryRouter>
      );
    });

    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    
    const editButtons = screen.getAllByTestId('edit-icon');
    await act(async () => {
      fireEvent.click(editButtons[0]); 
    });

    
    const fullnameInput = screen.getByDisplayValue('John Doe');
    await act(async () => {
      fireEvent.change(fullnameInput, { target: { value: 'Jane Doe' } });
    });

    
    await act(async () => {
      fireEvent.click(screen.getByText('Save'));
    });

    
    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });

    
    expect(screen.getByText('Your account has been updated successfully.')).toBeInTheDocument();
    
    
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/auth/update-profile',
      expect.objectContaining({
        method: 'PUT',
        body: expect.stringContaining('Jane Doe'),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer fake-token'
        })
      })
    );
  });

  test('handles API errors gracefully', async () => {
    
    global.fetch.mockImplementation((url) => {
      if (url === 'http://localhost:5000/api/auth/profile') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: mockUser })
        });
      } else if (url === 'http://localhost:5000/api/auth/update-profile') {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: 'Update failed' })
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <EditEmProfile />
        </MemoryRouter>
      );
    });

    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    
    const editButtons = screen.getAllByTestId('edit-icon');
    await act(async () => {
      fireEvent.click(editButtons[0]); 
    });

    
    const fullnameInput = screen.getByDisplayValue('John Doe');
    await act(async () => {
      fireEvent.change(fullnameInput, { target: { value: 'Jane Doe' } });
    });

    
    await act(async () => {
      fireEvent.click(screen.getByText('Save'));
    });

    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
    
    
    expect(screen.queryByText('Success')).not.toBeInTheDocument();
  });
});