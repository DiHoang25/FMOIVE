// __tests__/ViewMembers.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ViewMembers from '../ViewMembers';
import { BrowserRouter } from 'react-router-dom';

jest.mock('../../../components/Sidebar-Admin', () => ({ children }) => (
  <div data-testid="mock-sidebar">{children}</div>
));

jest.mock('axios', () => ({
  get: jest.fn(),
  patch: jest.fn(),
}));

describe('ViewMembers Page', () => {
  const axios = require('axios');

  const mockMembers = [
    {
      userId: '1',
      _id: 'mongo-id-1',
      fullname: 'Alice Nguyen',
      date_of_birth: '2000-01-01',
      email: 'alice@example.com',
      phone: '0123456789',
      address: '123 St',
      is_actived: true,
      role: 'user',
    },
    {
      userId: '2',
      _id: 'mongo-id-2',
      fullname: 'Bob Tran',
      date_of_birth: null,
      email: 'bob@example.com',
      phone: '0987654321',
      address: '456 St',
      is_actived: false,
      role: 'user',
    },
  ];

  const renderPage = async () => {
    localStorage.setItem('token', 'test-token');
    axios.get.mockResolvedValueOnce({ data: { customers: mockMembers } });
    render(
      <BrowserRouter>
        <ViewMembers />
      </BrowserRouter>
    );
  };

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('fetches and displays member data', async () => {
    await renderPage();
    expect(await screen.findByText('Alice Nguyen')).toBeInTheDocument();
    expect(screen.getByText('Bob Tran')).toBeInTheDocument();
  });

  it('shows "No members found" if none match search', async () => {
    await renderPage();
    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: 'nonexistent' },
    });
    expect(await screen.findByText(/no members found/i)).toBeInTheDocument();
  });

  it('filters members by search term', async () => {
    await renderPage(); // ensure data loaded
    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: 'bob' },
    });
    await waitFor(() => {
      expect(screen.getByText('Bob Tran')).toBeInTheDocument();
      expect(screen.queryByText('Alice Nguyen')).not.toBeInTheDocument();
    });
  });

  it('renders loading indicator when loading is true', async () => {
    axios.get.mockImplementation(() => new Promise(() => {}));
    localStorage.setItem('token', 'test-token');
    render(
      <BrowserRouter>
        <ViewMembers />
      </BrowserRouter>
    );
    expect(await screen.findByText(/loading members/i)).toBeInTheDocument();
  });

  it('renders pagination component', async () => {
    const manyMembers = Array.from({ length: 6 }, (_, i) => ({
      ...mockMembers[0],
      userId: `${i + 1}`,
      fullname: `Member ${i + 1}`,
      email: `member${i + 1}@test.com`,
    }));
    axios.get.mockResolvedValueOnce({ data: { customers: manyMembers } });
    localStorage.setItem('token', 'test-token');
    render(
      <BrowserRouter>
        <ViewMembers />
      </BrowserRouter>
    );
    expect(await screen.findByText('Member 1')).toBeInTheDocument();
    expect(screen.getByText(/page/i)).toBeInTheDocument();
  });
});
