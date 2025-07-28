// Mock window.matchMedia cho antd dùng
beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }),
    });
  });
  

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddCinemaRoom from '../AddCinemaRoom';
import { BrowserRouter } from 'react-router-dom';

// Mock SidebarAdmin
jest.mock('../../../components/Sidebar-Admin', () => ({ children }) => (
  <div data-testid="mock-sidebar">{children}</div>
));

const renderPage = () =>
  render(
    <BrowserRouter>
      <AddCinemaRoom />
    </BrowserRouter>
  );

describe('AddCinemaRoom Page', () => {
  it('renders form fields and buttons', () => {
    renderPage();

    // Dùng placeholder hoặc getByRole để bắt chính xác
    expect(screen.getByLabelText('Room Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Number of Rows')).toBeInTheDocument();
    expect(screen.getByLabelText('Number of Columns')).toBeInTheDocument();
    expect(screen.getByLabelText('Room Type')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Room/i })).toBeInTheDocument();
  });
  
  it('does not submit when form is empty', async () => {
    renderPage();
  
    const button = screen.getByRole('button', { name: /Add Room/i });
    fireEvent.click(button);
  
    await waitFor(() => {
      expect(screen.queryByText(/Please enter room name/i)).toBeInTheDocument();
    });
  });

  
  

  it('shows validation errors on submit empty', async () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /Add Room/i }));

    await waitFor(() => {
      // Bắt đầu bằng "Please" (ví dụ "Please enter room name!")
      const errors = screen.getAllByText((text) => text.startsWith('Please'));
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
