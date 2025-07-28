// AddMovieNews.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AddMovieNews from '../AddMovieNews';

// Mock Sidebar
jest.mock('../../../components/Sidebar-Admin', () => ({ children }) => (
  <div data-testid="mock-sidebar">{children}</div>
));

// Mock message and modal
jest.mock('antd', () => {
  const antd = jest.requireActual('antd');
  return {
    ...antd,
    message: {
      success: jest.fn(),
      error: jest.fn(),
    },
    Modal: ({ open, children }) => (open ? <div data-testid="mock-modal">{children}</div> : null),
  };
});

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ message: 'Success' }),
  })
);

const renderPage = () =>
  render(
    <BrowserRouter>
      <AddMovieNews />
    </BrowserRouter>
  );

describe('AddMovieNews Page', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'mock-token');
    jest.clearAllMocks();
  });

  it('renders the heading', () => {
    renderPage();
    expect(screen.getByText(/Add Movie News/i)).toBeInTheDocument();
  });

  it('renders sidebar layout', () => {
    renderPage();
    expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();
  });

  it('shows validation when submitting empty form', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach((input) => {
        expect(input).toBeInvalid();
      });
    });
  });

  it('navigates to list page on cancel', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/admin/movienews-list');
  });
});
