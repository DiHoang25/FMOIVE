import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ViewMembers from '../ViewMembersList';

// Mock antd components
jest.mock('antd', () => ({
  message: {
    success: jest.fn()
  },
  Modal: {
    confirm: jest.fn(({ onOk }) => {
      // Automatically trigger onOk to simulate user confirming
      if (onOk) onOk();
    })
  },
  Switch: ({ checked, onChange }) => (
    <button 
      data-testid={`switch-${checked ? 'active' : 'inactive'}`}
      onClick={() => onChange(!checked)}
    >
      {checked ? 'Active' : 'Inactive'}
    </button>
  )
}));

// Mock antd icons
jest.mock('@ant-design/icons', () => ({
  ExclamationCircleFilled: () => <span>Warning Icon</span>
}));

// Mock Sidebar component
jest.mock('../../../components/Sidebar-Employee', () => ({ children }) => (
  <div data-testid="sidebar-layout">{children}</div>
));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('ViewMembers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  test('renders the member management page with member list', () => {
    render(
      <MemoryRouter>
        <ViewMembers />
      </MemoryRouter>
    );
    
    // Check title and layout
    expect(screen.getByTestId('sidebar-layout')).toBeInTheDocument();
    expect(screen.getByText('Member Management')).toBeInTheDocument();
    
    // Check search functionality is present
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    
    // Check table headers
    expect(screen.getByText('ID #')).toBeInTheDocument();
    expect(screen.getByText('Full Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    
    // Check pagination
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    
    // Check member data is displayed
    expect(screen.getByText('Tran Van Tan')).toBeInTheDocument();
    expect(screen.getByText('tantran@gmail.com')).toBeInTheDocument();
  });

  test('search functionality filters members correctly', () => {
    render(
      <MemoryRouter>
        <ViewMembers />
      </MemoryRouter>
    );
    
    const searchInput = screen.getByPlaceholderText('Search...');
    
    // Search by name
    fireEvent.change(searchInput, { target: { value: 'Hoa' } });
    expect(screen.getByText('Nguyen Thi Hoa')).toBeInTheDocument();
    expect(screen.queryByText('Tran Van Tan')).not.toBeInTheDocument();
    
    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(screen.getByText('Tran Van Tan')).toBeInTheDocument();
    
    // Search by email
    fireEvent.change(searchInput, { target: { value: 'tantran' } });
    expect(screen.getByText('Tran Van Tan')).toBeInTheDocument();
    expect(screen.queryByText('Nguyen Thi Hoa')).not.toBeInTheDocument();
  });

  test('pagination works correctly', () => {
    render(
      <MemoryRouter>
        <ViewMembers />
      </MemoryRouter>
    );
    
    // First page should show the first 5 members
    expect(screen.getByText('Tran Van Tan')).toBeInTheDocument();
    
    // Click next to go to second page
    fireEvent.click(screen.getByText('Next'));
    
    // Second page should show different members
    expect(screen.getByText('Nguyen Trung Hieu')).toBeInTheDocument();
    expect(screen.queryByText('Tran Van Tan')).not.toBeInTheDocument();
    
    // Click previous to go back to first page
    fireEvent.click(screen.getByText('Previous'));
    expect(screen.getByText('Tran Van Tan')).toBeInTheDocument();
    expect(screen.queryByText('Nguyen Trung Hieu')).not.toBeInTheDocument();
  });
});