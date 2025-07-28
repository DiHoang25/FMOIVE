// Mock matchMedia cho Ant Design
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
  });
  
  import React from 'react';
  import { render, screen, fireEvent, waitFor } from '@testing-library/react';
  import EditAdminProfile from '../EditAdminProfile';
  import { BrowserRouter } from 'react-router-dom';
  
  // Mock navigate
  const mockNavigate = jest.fn();
  jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
  }));
  
  // Mock Sidebar
  jest.mock('../../../components/Sidebar-Admin', () => ({ children }) => (
    <div data-testid="mock-sidebar">{children}</div>
  ));
  
  beforeEach(() => {
    global.fetch = jest.fn().mockImplementation((url, options) => {
      if (url.endsWith('/api/auth/profile')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
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
  
      if (url.endsWith('/api/auth/update-profile') && options.method === 'PUT') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      }
  
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  
    localStorage.setItem('token', 'mock-token');
  });
  
  describe('EditAdminProfile Page', () => {
    it('renders and loads user data', async () => {
      render(
        <BrowserRouter>
          <EditAdminProfile />
        </BrowserRouter>
      );
  
      expect(await screen.findByText(/Edit Profile/i)).toBeInTheDocument();
      expect(await screen.findByText('adminuser')).toBeInTheDocument();
      expect(await screen.findByText('John Doe')).toBeInTheDocument();
      expect(await screen.findByText('admin@gmail.com')).toBeInTheDocument();
      expect(await screen.findByText('0123456789')).toBeInTheDocument();
    });
  
    it('toggles edit and allows changing fullname', async () => {
      render(
        <BrowserRouter>
          <EditAdminProfile />
        </BrowserRouter>
      );
  
      await screen.findByText('John Doe');
  
      const editBtn = screen.getAllByRole('button', { name: /Edit/i })[0];
      fireEvent.click(editBtn);
  
      const input = screen.getByDisplayValue('John Doe');
      fireEvent.change(input, { target: { value: 'Jane Smith' } });
  
      expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument();
    });
  
    it('renders and loads user data', async () => {
        render(
          <BrowserRouter>
            <EditAdminProfile />
          </BrowserRouter>
        );
      
        expect(await screen.findByText(/Edit Profile/i)).toBeInTheDocument();
        expect(await screen.findByText('adminuser')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('admin@gmail.com')).toBeInTheDocument();
        expect(screen.getByText('0123456789')).toBeInTheDocument();
      });
      
  
    it('shows success modal after saving valid data', async () => {
      render(
        <BrowserRouter>
          <EditAdminProfile />
        </BrowserRouter>
      );
  
      await screen.findByText('John Doe');
  
      // Toggle phone field to editable and change it
      fireEvent.click(screen.getAllByRole('button', { name: /Edit/i })[2]);
      const phoneInput = screen.getByDisplayValue('0123456789');
      fireEvent.change(phoneInput, { target: { value: '0999888777' } });
  
      fireEvent.click(screen.getByRole('button', { name: /Save/i }));
  
      expect(await screen.findByText(/Your account has been updated successfully/i)).toBeInTheDocument();
  
      fireEvent.click(screen.getByRole('button', { name: /OK/i }));
      expect(mockNavigate).toHaveBeenCalledWith('/admin/admin-profile');
    });
  
    it('navigates back on cancel', async () => {
      render(
        <BrowserRouter>
          <EditAdminProfile />
        </BrowserRouter>
      );
  
      await screen.findByText('John Doe');
      fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
  
      expect(mockNavigate).toHaveBeenCalledWith('/admin/admin-profile');
    });
  });
  